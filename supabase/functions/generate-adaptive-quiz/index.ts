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

    const { topics, difficulty, questionCount = 5 } = await req.json();

    // Fetch user's difficulties
    const { data: difficulties } = await supabase
      .from('user_difficulties')
      .select('*')
      .eq('user_id', user.id)
      .eq('resolved', false)
      .order('error_count', { ascending: false })
      .limit(10);

    // Fetch user's learning profile
    const { data: profile } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Build AI prompt
    const difficultiesText = difficulties && difficulties.length > 0
      ? difficulties.map(d => `${d.topic} (${d.error_count} erros)`).join(', ')
      : 'Nenhuma dificuldade específica registrada';

    const prompt = `Você é uma especialista em História da Moda. Crie um quiz personalizado para ajudar o aluno.

PERFIL DO ALUNO:
- Nível: ${profile?.level || 1}
- Pontuação média: ${profile?.average_score || 0}%
- Principais dificuldades: ${difficultiesText}
- Estilo de aprendizagem: ${profile?.learning_style || 'não definido'}

REQUISITOS DO QUIZ:
- Tópicos: ${topics?.join(', ') || 'moda em geral'}
- Dificuldade: ${difficulty || 'medium'}
- Número de questões: ${questionCount}

INSTRUÇÕES:
1. Crie ${questionCount} questões de múltipla escolha
2. Foque especialmente nas dificuldades do aluno
3. Adapte a linguagem ao nível do aluno
4. Cada questão deve ter 4 alternativas
5. Inclua explicações detalhadas para cada resposta correta

FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "id": 1,
      "question": "texto da pergunta",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "explicação detalhada",
      "topics": ["tópico1", "tópico2"],
      "difficulty": "medium"
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
    const quizContent = JSON.parse(aiData.choices[0].message.content);

    return new Response(
      JSON.stringify({ 
        success: true,
        quiz: quizContent
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating adaptive quiz:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
