import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizQuestion {
  id: string;
  order: number;
  type: 'dissertativa' | 'multipla_escolha';
  question: string;
  options?: Array<{
    id: string;
    text: string;
    is_correct: boolean;
  }>;
}

interface UserResponse {
  question_id: string;
  answer: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { lesson_id, user_id, responses } = await req.json() as {
      lesson_id: string;
      user_id: string;
      responses: UserResponse[];
    };

    // Buscar lição com configuração do quiz
    const { data: lesson, error: lessonError } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('id', lesson_id)
      .single();

    if (lessonError || !lesson) {
      throw new Error('Lição não encontrada');
    }

    const quizConfig = lesson.quiz_config as { questions: QuizQuestion[] };
    const questions = quizConfig.questions;
    const knowledgeBase = lesson.knowledge_base || '';

    const questionFeedback = [];
    let totalScore = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const topicsCovered = lesson.topics || [];
    const difficulties: Array<{ topic: string; context: string }> = [];

    // Avaliar cada pergunta
    for (const question of questions) {
      const userResponse = responses.find(r => r.question_id === question.id);
      if (!userResponse) continue;

      let isCorrect = false;
      let aiReasoning = '';
      let questionScore = 0;

      if (question.type === 'multipla_escolha') {
        const correctOption = question.options?.find(opt => opt.is_correct);
        isCorrect = userResponse.answer === correctOption?.id;
        questionScore = isCorrect ? 10 : 0;

        if (isCorrect) {
          correctAnswers++;
          aiReasoning = `Correto! A alternativa ${correctOption?.id}) está correta. `;
        } else {
          incorrectAnswers++;
          aiReasoning = `A resposta correta é a alternativa ${correctOption?.id}) ${correctOption?.text}. `;
          difficulties.push({
            topic: topicsCovered[0] || 'Geral',
            context: `Erro em: ${question.question}`
          });
        }

        // Adicionar contexto baseado na base de conhecimento usando IA
        if (knowledgeBase) {
          const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: 'Você é um professor especializado em moda. Forneça explicações breves e educativas (máximo 2 frases).'
                },
                {
                  role: 'user',
                  content: `Base de Conhecimento:\n${knowledgeBase}\n\nPergunta: ${question.question}\nResposta correta: ${correctOption?.text}\n\nDê uma breve explicação educativa sobre por que esta é a resposta correta.`
                }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const explanation = aiData.choices?.[0]?.message?.content || '';
            aiReasoning += explanation;
          }
        }
      } else {
        // Dissertativa - usar IA para avaliar
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'Você é um professor especializado em moda avaliando respostas dissertativas. Seja justo e educativo. Forneça uma nota de 0 a 10 e um feedback construtivo em até 3 frases. Retorne no formato: NOTA: X\nFEEDBACK: [seu feedback]'
              },
              {
                role: 'user',
                content: `Base de Conhecimento:\n${knowledgeBase}\n\nPergunta: ${question.question}\n\nResposta do usuário:\n${userResponse.answer}\n\nAvalie a resposta considerando a base de conhecimento.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiText = aiData.choices?.[0]?.message?.content || '';
          
          const notaMatch = aiText.match(/NOTA:\s*(\d+)/i);
          questionScore = notaMatch ? parseInt(notaMatch[1]) : 5;
          
          const feedbackMatch = aiText.match(/FEEDBACK:\s*(.+)/is);
          aiReasoning = feedbackMatch ? feedbackMatch[1].trim() : aiText;

          isCorrect = questionScore >= 7;
          if (isCorrect) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
            difficulties.push({
              topic: topicsCovered[0] || 'Geral',
              context: `Dificuldade em: ${question.question}`
            });
          }
        } else {
          questionScore = 5;
          aiReasoning = 'Não foi possível avaliar esta resposta no momento.';
        }
      }

      totalScore += questionScore;

      questionFeedback.push({
        question_id: question.id,
        user_answer: userResponse.answer,
        is_correct: isCorrect,
        ai_reasoning: aiReasoning,
        score: questionScore,
      });
    }

    const overallScore = (totalScore / (questions.length * 10)) * 100;

    const aiFeedback = {
      overall_score: overallScore,
      question_feedback: questionFeedback,
      generated_at: new Date().toISOString(),
    };

    // Calcular pontos baseado no score
    const basePoints = lesson.points_reward || 100;
    const scoreMultiplier = overallScore / 100;
    const pointsEarned = Math.round(basePoints * scoreMultiplier);

    // Salvar progresso da lição
    const { error: progressError } = await supabaseClient
      .from('user_lesson_progress')
      .upsert({
        user_id,
        lesson_id,
        status: 'completed',
        progress_percentage: 100,
        responses: { answers: responses },
        ai_feedback: aiFeedback,
        completed_at: new Date().toISOString(),
      });

    if (progressError) {
      console.error('Erro ao salvar progresso:', progressError);
    }

    // Criar registro de quiz attempt
    const { error: quizError } = await supabaseClient
      .from('quiz_attempts')
      .insert({
        user_id,
        lesson_id,
        quiz_type: 'lesson_based',
        questions: quizConfig,
        answers: { responses },
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        score: overallScore,
        topics_covered: topicsCovered,
        points_earned: pointsEarned,
      });

    if (quizError) {
      console.error('Erro ao criar quiz attempt:', quizError);
    }

    // Atualizar perfil do usuário
    const { data: profile } = await supabaseClient
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (profile) {
      const newTotalQuizzes = (profile.total_quizzes_completed || 0) + 1;
      const newTotalLessons = (profile.total_lessons_completed || 0) + 1;
      const newPoints = (profile.points || 0) + pointsEarned;
      const newAvgScore = ((profile.average_score || 0) * (newTotalQuizzes - 1) + overallScore) / newTotalQuizzes;

      await supabaseClient
        .from('user_learning_profiles')
        .update({
          total_quizzes_completed: newTotalQuizzes,
          total_lessons_completed: newTotalLessons,
          points: newPoints,
          average_score: newAvgScore,
          last_activity_date: new Date().toISOString().split('T')[0],
        })
        .eq('user_id', user_id);
    }

    // Registrar dificuldades
    for (const difficulty of difficulties) {
      await supabaseClient
        .from('user_difficulties')
        .insert({
          user_id,
          topic: difficulty.topic,
          difficulty_level: 'medium',
          context: difficulty.context,
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback: aiFeedback,
        points_earned: pointsEarned,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in evaluate-lesson-responses:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
