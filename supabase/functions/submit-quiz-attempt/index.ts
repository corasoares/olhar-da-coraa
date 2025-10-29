import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { quizAttempt } = await req.json();

    // Calculate score
    const totalQuestions = quizAttempt.questions.length;
    const correctAnswers = quizAttempt.questions.filter((q: any, i: number) => {
      return q.correctAnswer === quizAttempt.answers[i];
    }).length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Calculate points earned (base 50 points + score percentage)
    const pointsEarned = Math.round(50 + (score / 2));

    // Insert quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        lesson_id: quizAttempt.lessonId,
        quiz_type: quizAttempt.quizType,
        questions: quizAttempt.questions,
        answers: quizAttempt.answers,
        correct_answers: correctAnswers,
        incorrect_answers: totalQuestions - correctAnswers,
        score: score,
        topics_covered: quizAttempt.topicsCovered,
        time_taken: quizAttempt.timeTaken,
        points_earned: pointsEarned
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Identify incorrect topics and create difficulties
    const incorrectTopics: string[] = [];
    for (let i = 0; i < quizAttempt.questions.length; i++) {
      const question = quizAttempt.questions[i];
      if (question.correctAnswer !== quizAttempt.answers[i]) {
        incorrectTopics.push(...(question.topics || []));
        
        // Generate embedding for difficulty
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        const embeddingResponse = await fetch(`${supabaseUrl}/functions/v1/generate-embedding`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: `${question.topics?.join(', ')}: ${question.question}`
          }),
        });

        if (embeddingResponse.ok) {
          const { embedding } = await embeddingResponse.json();
          
          // Check if difficulty already exists
          const { data: existingDifficulty } = await supabase
            .from('user_difficulties')
            .select('*')
            .eq('user_id', user.id)
            .eq('topic', question.topics?.[0] || 'Unknown')
            .eq('resolved', false)
            .maybeSingle();

          if (existingDifficulty) {
            // Update existing difficulty
            await supabase
              .from('user_difficulties')
              .update({
                error_count: existingDifficulty.error_count + 1,
                last_error_at: new Date().toISOString(),
                context: question.question,
                difficulty_level: existingDifficulty.error_count >= 3 ? 'critical' : 
                                 existingDifficulty.error_count >= 2 ? 'high' : 'medium'
              })
              .eq('id', existingDifficulty.id);
          } else {
            // Insert new difficulty
            await supabase
              .from('user_difficulties')
              .insert({
                user_id: user.id,
                topic: question.topics?.[0] || 'Unknown',
                category: quizAttempt.topicsCovered?.[0],
                difficulty_level: 'medium',
                error_count: 1,
                context: question.question,
                embedding: embedding
              });
          }
        }
      }
    }

    // Update user learning profile
    const { data: profile } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const newAvgScore = ((profile.average_score * profile.total_quizzes_completed) + score) / 
                         (profile.total_quizzes_completed + 1);
      
      await supabase
        .from('user_learning_profiles')
        .update({
          total_quizzes_completed: profile.total_quizzes_completed + 1,
          average_score: newAvgScore,
          points: profile.points + pointsEarned,
          level: Math.floor((profile.points + pointsEarned) / 1000) + 1,
          weaknesses: Array.from(new Set([...profile.weaknesses, ...incorrectTopics]))
        })
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        attempt,
        score,
        pointsEarned,
        correctAnswers,
        totalQuestions
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
