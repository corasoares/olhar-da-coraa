import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is a super_admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is super_admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only super admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isSuperAdmin = roleData?.some((r: any) => r.role === 'super_admin');
    if (!isSuperAdmin) {
      console.error('User is not a super admin');
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only super admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, fullName, password, role } = await req.json();

    if (!email || !fullName || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, fullName, password, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating user:', { email, fullName, role });

    // Create user with Supabase Auth Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', newUser.user.id);

    // Insert into profiles table (if not auto-created by trigger)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        email,
        full_name: fullName,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Assign role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: newUser.user.id,
        role,
      });

    if (roleInsertError) {
      console.error('Error assigning role:', roleInsertError);
      return new Response(
        JSON.stringify({ error: 'User created but role assignment failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Role assigned successfully:', role);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        email: newUser.user.email,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
