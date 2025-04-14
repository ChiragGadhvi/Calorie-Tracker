
import { serve } from 'https://deno.land/std@0.204.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createHmac } from 'https://deno.land/std@0.204.0/crypto/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const razorpaySecretKey = Deno.env.get('RAZORPAY_SECRET_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Define subscription plans
const SUBSCRIPTION_PLANS = {
  BASIC: { analyses: 10 },
  STANDARD: { analyses: 25 },
  PREMIUM: { analyses: 50 }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const text = `${orderId}|${paymentId}`;
  const secret = razorpaySecretKey;
  
  const hmac = createHmac("sha256", secret);
  hmac.update(text);
  const digest = hmac.digest("hex");
  
  return digest === signature;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      userId,
      planId
    } = await req.json();
    
    // Verify the signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user subscription in the database
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('remaining_analyses')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      throw fetchError;
    }

    // Calculate new analyses count
    const currentAnalyses = subscription?.remaining_analyses || 0;
    const newAnalysesCount = currentAnalyses + plan.analyses;

    // Insert or update subscription record
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        remaining_analyses: newAnalysesCount,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      throw updateError;
    }

    // Record the payment in a new payments table
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        plan_id: planId,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: plan.analyses,
        status: 'completed'
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      // Don't fail the response as the subscription was already updated
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified and subscription updated',
        analyses: newAnalysesCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to verify payment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
