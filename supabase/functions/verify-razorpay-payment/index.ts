
import { serve } from 'https://deno.land/std@0.204.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createHmac } from 'https://deno.land/std@0.204.0/crypto/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const razorpaySecretKey = Deno.env.get('RAZORPAY_SECRET_KEY') || '';

console.log("Verify function initialized with Supabase URL:", supabaseUrl ? "Present" : "Missing");

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
  try {
    const text = `${orderId}|${paymentId}`;
    const secret = razorpaySecretKey;
    
    const hmac = createHmac("sha256", secret);
    hmac.update(text);
    const digest = hmac.digest("hex");
    
    const isValid = digest === signature;
    console.log("Signature verification result:", isValid);
    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received payment verification request");
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody, null, 2));
    
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      userId,
      planId
    } = requestBody;
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error("Missing required Razorpay parameters");
      return new Response(
        JSON.stringify({ error: 'Missing required Razorpay parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userId || !planId) {
      console.error("Missing userId or planId");
      return new Response(
        JSON.stringify({ error: 'Missing userId or planId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (!isValidSignature) {
      console.error("Invalid payment signature");
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Payment signature verified successfully");
    
    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      console.error("Invalid plan:", planId);
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Found plan with analyses:", plan.analyses);

    // Update user subscription in the database
    try {
      console.log("Fetching existing subscription for user:", userId);
      const { data: subscription, error: fetchError } = await supabaseAdmin
        .from('subscriptions')
        .select('remaining_analyses')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error("Error fetching subscription:", fetchError);
        throw fetchError;
      }

      // Calculate new analyses count
      const currentAnalyses = subscription?.remaining_analyses || 0;
      const newAnalysesCount = currentAnalyses + plan.analyses;

      console.log("Updating subscription with new analysis count:", newAnalysesCount);

      // Insert or update subscription record
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          remaining_analyses: newAnalysesCount,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw updateError;
      }

      console.log("Subscription updated successfully");

      // Record the payment in payments table
      console.log("Recording payment in payments table");
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: userId,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          plan_id: planId,
          amount: plan.analyses,
          status: 'completed'
        });

      if (paymentError) {
        console.error("Error recording payment:", paymentError);
        // Don't fail the response as the subscription was already updated
      } else {
        console.log("Payment recorded successfully");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment verified and subscription updated',
          analyses: newAnalysesCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to verify payment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
