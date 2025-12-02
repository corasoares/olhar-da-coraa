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

    const { subscriptionId, cancelAtPeriodEnd = true } = await req.json();

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: "Assinatura não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cancel in Mercado Pago if configured
    if (subscription.mp_preapproval_id && mpAccessToken) {
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/preapproval/${subscription.mp_preapproval_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${mpAccessToken}`,
            },
            body: JSON.stringify({ status: "cancelled" }),
          }
        );

        if (!mpResponse.ok) {
          const errorData = await mpResponse.json();
          console.error("MP cancel error:", errorData);
        }
      } catch (error) {
        console.error("Error cancelling in MP:", error);
      }
    }

    // Update subscription in database
    const updateData: any = {
      cancelled_at: new Date().toISOString(),
    };

    if (cancelAtPeriodEnd) {
      updateData.cancel_at_period_end = true;
    } else {
      updateData.status = "cancelled";
    }

    const { data: updatedSubscription, error: updateError } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("id", subscriptionId)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Erro ao cancelar assinatura" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: updatedSubscription,
        message: cancelAtPeriodEnd 
          ? "Assinatura será cancelada ao final do período atual"
          : "Assinatura cancelada imediatamente",
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
