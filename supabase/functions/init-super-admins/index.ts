import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function should only be called once during initial setup
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-super-admin`;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    const superAdmins = [
      { email: 'contato@iacombusiness.com.br', password: 'Fgvfgv20@' },
      { email: 'soarescora@gmail.com', password: 'Olivia2507@' }
    ];

    const results = [];

    for (const admin of superAdmins) {
      console.log(`Creating super admin: ${admin.email}`);
      
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(admin),
      });

      const result = await response.json();
      results.push({
        email: admin.email,
        ...result
      });

      console.log(`Result for ${admin.email}:`, result);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super admins initialization completed',
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error initializing super admins:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
