
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CameraComponent from '@/components/Camera';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Scan = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscriptionLimit = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('tier, meals_analyzed')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const limits = {
          free: 1,
          pro: 3,
          pro_plus: 5
        };

        const limit = limits[subscription.tier as keyof typeof limits];
        if (subscription.meals_analyzed >= limit) {
          setHasReachedLimit(true);
          toast({
            title: "Subscription Limit Reached",
            description: `You've used ${subscription.meals_analyzed}/${limit} meal analyses on your ${subscription.tier} plan. Upgrade to analyze more meals!`,
            duration: 6000,
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="mt-2"
              >
                Upgrade Plan
              </Button>
            ),
          });
          // Immediately redirect to home page if limit is reached
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking subscription limit:', error);
      }
    };

    checkSubscriptionLimit();
  }, [toast, navigate]);

  // If limit is reached, don't render anything as we're redirecting
  if (hasReachedLimit) {
    return null;
  }

  const analyzeMeal = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('https://pieymelbjcvhxcnonpms.supabase.co/functions/v1/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ 
          image: imageData,
          user_id: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error === 'Meal analysis limit reached') {
          setHasReachedLimit(true);
          toast({
            title: "Subscription Limit Reached",
            description: `You've used ${data.current}/${data.limit} meal analyses on your ${data.tier} plan. Upgrade to analyze more meals!`,
            duration: 6000,
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="mt-2"
              >
                Upgrade Plan
              </Button>
            ),
          });
          navigate('/');
          return null;
        }
        throw new Error(data.error || 'Failed to analyze image');
      }

      return data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = async (imageData: string) => {
    if (hasReachedLimit) {
      navigate('/');
      return;
    }

    toast({
      title: "Analyzing meal...",
      description: "Please wait while we process your image.",
    });

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const { error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, binaryData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      const analysis = await analyzeMeal(imageData);
      
      if (!analysis) return; // Analysis failed (e.g., due to subscription limits)

      const { error: insertError } = await supabase
        .from('meals')
        .insert([{
          image_url: publicUrl,
          calories: analysis.calories,
          protein: analysis.protein,
          name: analysis.name,
          description: analysis.description,
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Meal added successfully!",
        description: `Detected ${analysis.name} with ${analysis.calories} calories and ${analysis.protein}g protein.`,
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error analyzing meal",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive",
      });
    }

    setShowCamera(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (hasReachedLimit) {
      navigate('/');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await handleCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-center mb-8">Add Meal</h1>
        
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => setShowCamera(true)}
            className="h-16 bg-primary text-white hover:bg-primary/90"
            disabled={isAnalyzing || hasReachedLimit}
          >
            <Camera className="mr-2 h-6 w-6" /> Take Photo
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="h-16 bg-white"
            disabled={isAnalyzing || hasReachedLimit}
          >
            <Upload className="mr-2 h-6 w-6" /> Upload Image
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={hasReachedLimit}
          />
        </div>
      </div>

      {showCamera && !hasReachedLimit && (
        <CameraComponent
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      
      <Navigation />
    </div>
  );
};

export default Scan;
