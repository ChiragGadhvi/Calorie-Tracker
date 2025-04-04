
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Barcode, Tag, BookOpen, X } from 'lucide-react';
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
    const checkLimit = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('remaining_analyses')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (subscription.remaining_analyses <= 0) {
          setHasReachedLimit(true);
          toast({
            title: "Analysis Limit Reached",
            description: `You've used all your available meal analyses. Each user gets 3 free analyses for testing.`,
            duration: 6000,
          });
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking analysis limit:', error);
      }
    };

    checkLimit();
  }, [toast, navigate]);

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
        if (response.status === 403 && data.error === 'No analyses remaining') {
          setHasReachedLimit(true);
          toast({
            title: "Analysis Limit Reached",
            description: `You've used all your available meal analyses. Each user gets 3 free analyses for testing.`,
            duration: 6000,
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
      
      if (!analysis) return;

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
    <div className="min-h-screen bg-background">
      {showCamera ? (
        <div className="relative min-h-screen bg-black pb-20">
          <div className="absolute top-4 left-4 z-20">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={() => setShowCamera(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="pt-12 pb-4 px-4">
            <h1 className="text-2xl font-bold text-white text-center">Scanner</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="camera-frame">
              <div className="camera-corner camera-corner-tl"></div>
              <div className="camera-corner camera-corner-tr"></div>
              <div className="camera-corner camera-corner-bl"></div>
              <div className="camera-corner camera-corner-br"></div>
            </div>
          </div>
          
          <div className="fixed bottom-20 left-0 right-0">
            <div className="grid grid-cols-4 gap-4 px-4">
              <div className="flex flex-col items-center">
                <Button 
                  className="w-16 h-16 rounded-2xl bg-accent text-secondary"
                  disabled={isAnalyzing}
                >
                  <Camera className="h-6 w-6" />
                </Button>
                <span className="text-xs text-white mt-2">Scan food</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  variant="outline"
                  className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white"
                  disabled={isAnalyzing}
                >
                  <Barcode className="h-6 w-6" />
                </Button>
                <span className="text-xs text-white mt-2">Barcode</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  variant="outline"
                  className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white"
                  disabled={isAnalyzing}
                >
                  <Tag className="h-6 w-6" />
                </Button>
                <span className="text-xs text-white mt-2">Food label</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  variant="outline"
                  className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white"
                  disabled={isAnalyzing}
                >
                  <BookOpen className="h-6 w-6" />
                </Button>
                <span className="text-xs text-white mt-2">Library</span>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button 
                className="w-14 h-14 rounded-full bg-primary shadow-lg"
                onClick={() => handleCapture("mock-camera-data")}
                disabled={isAnalyzing}
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          <Navigation />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-20">
          <h1 className="text-2xl font-bold text-white text-center mb-8">Add Meal</h1>
          
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => setShowCamera(true)}
              className="h-16 button-gradient rounded-xl text-white shadow-md"
              disabled={isAnalyzing || hasReachedLimit}
            >
              <Camera className="mr-2 h-6 w-6" /> Take Photo
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-16 bg-secondary/50 text-white border-white/10 rounded-xl"
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
          
          <Navigation />
        </div>
      )}
    </div>
  );
};

export default Scan;
