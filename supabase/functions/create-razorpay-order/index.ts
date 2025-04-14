
import { serve } from 'https://deno.land/std@0.204.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Configure Razorpay
import Razorpay from 'https://esm.sh/razorpay@2.9.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || '';
const razorpaySecretKey = Deno.env.get('RAZORPAY_SECRET_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log("Edge function initialized with Razorpay key_id:", razorpayKeyId ? "Present" : "Missing");
console.log("Razorpay key_id value:", razorpayKeyId);

// Create Razorpay instance with extensive error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpaySecretKey,
  });
  console.log("Razorpay instance created successfully");
} catch (error) {
  console.error("Failed to initialize Razorpay:", error);
}

// Define subscription plans
const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    amount: 29900, // ₹299 (in paise)
    currency: 'INR',
    analyses: 10,
    description: '10 meal analyses',
  },
  STANDARD: {
    name: 'Standard',
    amount: 49900, // ₹499 (in paise)
    currency: 'INR',
    analyses: 25,
    description: '25 meal analyses',
  },
  PREMIUM: {
    name: 'Premium',
    amount: 89900, // ₹899 (in paise)
    currency: 'INR',
    analyses: 50,
    description: '50 meal analyses',
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to create order");
    
    if (!razorpay) {
      throw new Error("Razorpay is not properly initialized. Check API keys.");
    }
    
    const requestBody = await req.json();
    const { planId, userId } = requestBody;
    
    console.log("Request data:", { planId, userId });
    
    if (!planId || !userId) {
      console.error("Missing required parameters:", { planId, userId });
      return new Response(
        JSON.stringify({ error: 'Plan ID and User ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      console.error("Invalid plan selected:", planId);
      return new Response(
        JSON.stringify({ error: 'Invalid plan selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Found plan:", plan.name, "with amount:", plan.amount);

    // Create order in Razorpay
    const orderOptions = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId: userId,
        planId: planId,
      }
    };

    console.log("Creating order with options:", orderOptions);
    
    try {
      const order = await razorpay.orders.create(orderOptions);
      console.log("Order created successfully:", order.id);
      
      // Make sure key_id is properly included in the response
      if (!razorpayKeyId) {
        throw new Error("Razorpay key_id is missing in environment variables");
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          order: order,
          plan: plan,
          key: razorpayKeyId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (razorpayError) {
      console.error("Razorpay API error:", razorpayError);
      throw new Error(`Razorpay API error: ${razorpayError.message || JSON.stringify(razorpayError)}`);
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create order' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
