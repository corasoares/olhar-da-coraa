import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, type, options, topicName } = await req.json();

    if (!question || !topicName) {
      return new Response(
        JSON.stringify({ error: 'Question and topic are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build prompt for AI
    let optionsText = '';
    if (type === 'multipla_escolha' && options?.length > 0) {
      optionsText = '\nOPÇÕES:\n' + options.map((opt: any, i: number) => `${i + 1}. ${opt.text}`).join('\n');
    }

    const prompt = `Analise esta questão de História da Moda e sugira um nível de dificuldade (1-4):

QUESTÃO: "${question}"
TIPO: ${type === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'}
ASSUNTO: ${topicName}${optionsText}

CRITÉRIOS:
- Nível 1 ⭐: Conhecimento básico, senso comum, fatos amplamente conhecidos
- Nível 2 ⭐⭐: Requer estudo moderado, conceitos intermediários
- Nível 3 ⭐⭐⭐: Exige conhecimento aprofundado, análise crítica
- Nível 4 ⭐⭐⭐⭐: Expertise, detalhes técnicos complexos, análise profunda

Retorne APENAS um número de 1 a 4, sem explicações.`;

    console.log('Calling Lovable AI with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert in Fashion History education. Respond only with a number from 1 to 4.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', aiResponse);

    // Parse the difficulty from response
    const difficulty = parseInt(aiResponse.trim());
    
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 4) {
      console.error('Invalid difficulty from AI:', aiResponse);
      // Default to level 2 if AI response is invalid
      return new Response(
        JSON.stringify({ difficulty: 2 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ difficulty }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in suggest-question-difficulty:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
