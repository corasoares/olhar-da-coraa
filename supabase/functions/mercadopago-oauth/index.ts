import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthRequest {
  clientId: string;
  clientSecret: string;
  grantType: 'client_credentials' | 'authorization_code';
  code?: string;
  redirectUri?: string;
  codeVerifier?: string;
  testToken?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Mercado Pago OAuth request received');

    const { clientId, clientSecret, grantType, code, redirectUri, codeVerifier, testToken }: OAuthRequest = await req.json();

    // Validate required fields
    if (!clientId || !clientSecret || !grantType) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, clientSecret, grantType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build request body based on grant type
    const bodyParams: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: grantType,
    };

    if (grantType === 'authorization_code') {
      if (!code || !redirectUri) {
        console.error('Missing code or redirectUri for authorization_code flow');
        return new Response(
          JSON.stringify({ error: 'Missing code or redirectUri for authorization_code flow' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      bodyParams.code = code;
      bodyParams.redirect_uri = redirectUri;
      if (codeVerifier) {
        bodyParams.code_verifier = codeVerifier;
      }
    }

    if (testToken) {
      bodyParams.test_token = 'true';
    }

    console.log('Requesting access token from Mercado Pago...');

    // Make request to Mercado Pago OAuth endpoint
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(bodyParams).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago OAuth error:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to obtain access token', 
          details: data 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Access token obtained successfully');

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        scope: data.scope,
        refresh_token: data.refresh_token,
        user_id: data.user_id,
        public_key: data.public_key,
        live_mode: data.live_mode,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mercadopago-oauth function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
