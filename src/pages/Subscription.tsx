
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { LoadScript } from '@/components/LoadScript';

const PLANS = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: '₹299',
    analyses: 10,
    features: ['10 meal analyses', 'Full nutrition breakdown', 'Image storage'],
    popular: false,
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    price: '₹499',
    analyses: 25,
    features: ['25 meal analyses', 'Full nutrition breakdown', 'Image storage', 'Historical tracking'],
    popular: true,
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: '₹899',
    analyses: 50,
    features: ['50 meal analyses', 'Full nutrition breakdown', 'Image storage', 'Historical tracking', 'Priority support'],
    popular: false,
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Subscription = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Verify Razorpay is loaded
  useEffect(() => {
    const checkRazorpayLoaded = () => {
      const isLoaded = typeof window.Razorpay !== 'undefined';
      console.log("Checking if Razorpay is loaded:", isLoaded);
      setScriptLoaded(isLoaded);
      return isLoaded;
    };

    // Check on mount
    const isLoaded = checkRazorpayLoaded();
    
    // If not loaded yet, check again in 2 seconds
    if (!isLoaded) {
      const timer = setTimeout(() => {
        checkRazorpayLoaded();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      
      if (!window.Razorpay) {
        console.error("Razorpay SDK not loaded");
        toast({
          title: "Payment system not available",
          description: "Please refresh the page and try again",
          variant: "destructive",
        });
        setLoading(null);
        setScriptError(true);
        return;
      }

      console.log("Getting user from Supabase Auth");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Auth error:", userError);
        toast({
          title: "Authentication required",
          description: "Please sign in to subscribe",
          variant: "destructive",
        });
        setLoading(null);
        return;
      }

      console.log("User ID:", user.id);
      console.log("Creating order for plan:", planId);
      
      // Create order via Supabase edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { planId, userId: user.id },
      });

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error(orderError.message || 'Failed to create order');
      }

      if (!orderData || !orderData.order) {
        console.error("Invalid order response:", orderData);
        throw new Error('Invalid order response');
      }

      const { order, plan, key } = orderData;
      console.log("Order created:", order.id);
      console.log("Using Razorpay key:", key);
      console.log("Full order data:", JSON.stringify(order, null, 2));

      // Debugging: Verify that key is available
      if (!key) {
        console.error("Razorpay key is missing");
        throw new Error("Payment system configuration error");
      }

      // Initialize Razorpay with explicit error handling
      try {
        console.log("Initializing Razorpay checkout");
        const razorpay = new window.Razorpay({
          key: key,
          amount: order.amount,
          currency: order.currency,
          name: "Meal Analyzer",
          description: `Subscription for ${plan.description}`,
          order_id: order.id,
          handler: async function(response: any) {
            console.log("Payment successful, verifying...", response);
            try {
              // Verify payment
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
                body: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user.id,
                  planId: planId,
                },
              });

              if (verifyError) {
                console.error("Verification error:", verifyError);
                throw new Error(verifyError.message || 'Payment verification failed');
              }

              console.log("Payment verified:", verifyData);
              
              toast({
                title: "Payment successful",
                description: `Your subscription has been activated. You now have ${verifyData.analyses} meal analyses available.`,
              });
              
              // Redirect to home page after successful payment
              navigate('/');
            } catch (error) {
              console.error('Payment verification error:', error);
              toast({
                title: "Payment verification failed",
                description: error.message || "There was a problem verifying your payment",
                variant: "destructive",
              });
            }
            setLoading(null);
          },
          prefill: {
            name: user.email?.split('@')[0] || '',
            email: user.email || '',
          },
          theme: {
            color: "#121212",
          },
          modal: {
            ondismiss: function() {
              console.log("Payment modal closed by user");
              setLoading(null);
              toast({
                title: "Payment cancelled",
                description: "You can try again when you're ready",
              });
            },
          },
        });

        razorpay.on('payment.failed', function(response: any) {
          console.error("Payment failed:", response.error);
          toast({
            title: "Payment failed",
            description: response.error.description || "There was a problem processing your payment",
            variant: "destructive",
          });
          setLoading(null);
        });

        console.log("Opening Razorpay payment modal");
        razorpay.open();
      } catch (razorpayError) {
        console.error("Error initializing Razorpay:", razorpayError);
        toast({
          title: "Payment system error",
          description: "Could not initialize the payment system. Please try again later.",
          variant: "destructive",
        });
        setLoading(null);
        setScriptError(true);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: error.message || "There was a problem processing your subscription",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  // Handle script loading
  const handleScriptLoad = () => {
    console.log("Razorpay script loaded successfully");
    setScriptLoaded(true);
    setScriptError(false);
  };

  const handleScriptError = () => {
    console.error("Failed to load Razorpay script");
    setScriptLoaded(false);
    setScriptError(true);
    toast({
      title: "Payment system error",
      description: "Failed to load the payment system. Please try again later.",
      variant: "destructive",
    });
  };

  // Try to reload the script if it failed
  const handleRetryScriptLoad = () => {
    setScriptError(false);
    setScriptLoaded(false);
    
    // Force script reload by adding a timestamp query parameter
    const timestamp = new Date().getTime();
    const scriptSrc = `https://checkout.razorpay.com/v1/checkout.js?_t=${timestamp}`;
    
    // Remove any existing script
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
    
    // Append the script manually
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.onload = handleScriptLoad;
    script.onerror = handleScriptError;
    document.head.appendChild(script);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <LoadScript 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-white text-center mb-4">Choose a Plan</h1>
        <p className="text-gray-400 text-center mb-8">
          Get more meal analyses with our subscription plans
        </p>

        {scriptError && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-white text-center mb-2">Failed to load payment system</p>
            <Button 
              className="w-full"
              onClick={handleRetryScriptLoad}
            >
              Retry Loading Payment System
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id}
              className={`border-border ${
                plan.popular 
                  ? 'bg-primary border-primary/30' 
                  : 'bg-secondary border-border'
              } shadow-lg hover:shadow-xl transition-all`}
            >
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className={plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
                  {plan.analyses} meal analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-6 text-white">
                  {plan.price}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className={`h-5 w-5 ${plan.popular ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      <span className={plan.popular ? 'text-primary-foreground' : 'text-muted-foreground'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-white text-primary hover:bg-white/90' 
                      : 'bg-primary'
                  }`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || !scriptLoaded || scriptError}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Processing...
                    </span>
                  ) : !scriptLoaded ? (
                    "Loading..."
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Subscription;
