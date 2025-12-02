import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's active subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== "PGRST116") {
      console.error("Database error:", subError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar assinatura" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If subscription exists and has MP ID, sync with Mercado Pago
    if (subscription?.mp_preapproval_id && mpAccessToken) {
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/preapproval/${subscription.mp_preapproval_id}`,
          {
            headers: { "Authorization": `Bearer ${mpAccessToken}` },
          }
        );

        if (mpResponse.ok) {
          const mpData = await mpResponse.json();
          
          // Update local subscription with MP data
          const statusMap: Record<string, string> = {
            pending: "pending",
            authorized: "active",
            paused: "paused",
            cancelled: "cancelled",
          };

          const newStatus = statusMap[mpData.status] || mpData.status;
          
          if (newStatus !== subscription.status) {
            await supabase
              .from("subscriptions")
              .update({ status: newStatus })
              .eq("id", subscription.id);
            
            subscription.status = newStatus;
          }
        }
      } catch (error) {
        console.error("Error syncing with MP:", error);
      }
    }

    // Get recent transactions
    const { data: transactions } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Calculate subscription details
    const isPremium = subscription?.status === "active" && subscription?.plan?.slug !== "free";
    const isTrialing = subscription?.status === "trialing";
    
    let daysRemaining = null;
    if (subscription?.current_period_end) {
      const endDate = new Date(subscription.current_period_end);
      const now = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return new Response(
      JSON.stringify({
        subscription,
        transactions,
        isPremium,
        isTrialing,
        daysRemaining,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
