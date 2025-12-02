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

    if (!mpAccessToken) {
      console.error("MP_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Mercado Pago não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    const { type, data, action } = body;

    // Handle different webhook types
    if (type === "payment") {
      await handlePaymentWebhook(supabase, mpAccessToken, data.id);
    } else if (type === "subscription_preapproval") {
      await handlePreapprovalWebhook(supabase, mpAccessToken, data.id);
    } else if (type === "subscription_authorized_payment") {
      await handleAuthorizedPaymentWebhook(supabase, mpAccessToken, data.id);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handlePaymentWebhook(supabase: any, accessToken: string, paymentId: string) {
  // Fetch payment details from Mercado Pago
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    console.error("Failed to fetch payment:", await response.text());
    return;
  }

  const payment = await response.json();
  console.log("Payment details:", JSON.stringify(payment, null, 2));

  // Parse external_reference to get user_id
  const externalRef = payment.external_reference;
  if (!externalRef) {
    console.log("No external_reference in payment");
    return;
  }

  const [userId, planId, billingCycle] = externalRef.split(":");

  // Find or create transaction
  const { data: existingTx } = await supabase
    .from("payment_transactions")
    .select("id")
    .eq("mp_payment_id", paymentId.toString())
    .single();

  const transactionData = {
    user_id: userId,
    amount: payment.transaction_amount,
    currency: payment.currency_id || "BRL",
    status: mapPaymentStatus(payment.status),
    transaction_type: "subscription",
    mp_payment_id: paymentId.toString(),
    mp_status: payment.status,
    mp_status_detail: payment.status_detail,
    payment_method: payment.payment_method_id,
    payment_type: payment.payment_type_id,
    installments: payment.installments,
    description: payment.description,
    processed_at: payment.date_approved || payment.date_created,
    metadata: {
      payer_email: payment.payer?.email,
      payer_id: payment.payer?.id,
    },
  };

  if (existingTx) {
    await supabase
      .from("payment_transactions")
      .update(transactionData)
      .eq("id", existingTx.id);
  } else {
    await supabase
      .from("payment_transactions")
      .insert(transactionData);
  }

  // Update subscription status if payment approved
  if (payment.status === "approved") {
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        started_at: new Date().toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: calculatePeriodEnd(billingCycle),
      })
      .eq("user_id", userId)
      .eq("status", "pending");
  }
}

async function handlePreapprovalWebhook(supabase: any, accessToken: string, preapprovalId: string) {
  const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    console.error("Failed to fetch preapproval:", await response.text());
    return;
  }

  const preapproval = await response.json();
  console.log("Preapproval details:", JSON.stringify(preapproval, null, 2));

  const statusMap: Record<string, string> = {
    pending: "pending",
    authorized: "active",
    paused: "paused",
    cancelled: "cancelled",
  };

  const status = statusMap[preapproval.status] || preapproval.status;

  // Update subscription
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      mp_subscription_id: preapproval.id,
      mp_payer_id: preapproval.payer_id?.toString(),
      started_at: preapproval.date_created,
      current_period_start: preapproval.last_modified,
    })
    .eq("mp_preapproval_id", preapprovalId);

  if (error) {
    console.error("Error updating subscription:", error);
  }
}

async function handleAuthorizedPaymentWebhook(supabase: any, accessToken: string, paymentId: string) {
  // Similar to payment webhook but for recurring payments
  await handlePaymentWebhook(supabase, accessToken, paymentId);
}

function mapPaymentStatus(mpStatus: string): string {
  const statusMap: Record<string, string> = {
    pending: "pending",
    approved: "approved",
    authorized: "approved",
    in_process: "pending",
    in_mediation: "pending",
    rejected: "rejected",
    cancelled: "cancelled",
    refunded: "refunded",
    charged_back: "refunded",
  };
  return statusMap[mpStatus] || "pending";
}

function calculatePeriodEnd(billingCycle: string): string {
  const now = new Date();
  if (billingCycle === "yearly") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}
