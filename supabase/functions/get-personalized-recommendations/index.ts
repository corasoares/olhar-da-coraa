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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
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

    // Fetch user profile and difficulties
    const { data: profile } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: difficulties } = await supabase
      .from('user_difficulties')
      .select('*')
      .eq('user_id', user.id)
      .eq('resolved', false)
      .order('error_count', { ascending: false })
      .limit(5);

    // Get existing recommendations that are still pending
    const { data: existingRecs } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString());

    if (existingRecs && existingRecs.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          recommendations: existingRecs
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new recommendations using AI
    const difficultiesText = difficulties && difficulties.length > 0
      ? difficulties.map(d => `${d.topic} (${d.error_count} erros, nível: ${d.difficulty_level})`).join('\n')
      : 'Nenhuma dificuldade específica';

    const prompt = `Você é uma consultora de aprendizagem em Moda. Analise o perfil do aluno e crie recomendações personalizadas.

PERFIL DO ALUNO:
- Nível: ${profile?.level || 1}
- Pontuação média: ${profile?.average_score || 0}%
- Quizzes completados: ${profile?.total_quizzes_completed || 0}
- Lições completadas: ${profile?.total_lessons_completed || 0}
- Estilo de aprendizagem: ${profile?.learning_style || 'não definido'}
- Pontos fracos: ${profile?.weaknesses?.join(', ') || 'não identificados'}

DIFICULDADES RECENTES:
${difficultiesText}

Crie 3 recomendações priorizadas para ajudar o aluno a melhorar. Para cada recomendação, especifique:
1. Tipo (lesson, quiz, ou study_plan)
2. Título
3. Descrição
4. Prioridade (low, medium, high, urgent)
5. Tópicos a abordar

FORMATO DE RESPOSTA (JSON):
{
  "recommendations": [
    {
      "type": "quiz",
      "title": "título da recomendação",
      "description": "descrição detalhada",
      "priority": "high",
      "topics": ["tópico1", "tópico2"],
      "reasoning": "por que essa recomendação é importante"
    }
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI request failed: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const { recommendations } = JSON.parse(aiData.choices[0].message.content);

    // Store recommendations in database
    const recommendationsToInsert = recommendations.map((rec: any) => ({
      user_id: user.id,
      recommendation_type: rec.type,
      content: rec,
      based_on_difficulties: difficulties?.map(d => d.id) || [],
      priority: rec.priority,
      reasoning: rec.reasoning,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));

    const { data: savedRecs, error } = await supabase
      .from('ai_recommendations')
      .insert(recommendationsToInsert)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        recommendations: savedRecs
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
