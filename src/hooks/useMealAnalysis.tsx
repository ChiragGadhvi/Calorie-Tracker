
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useMealAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const analyzeMeal = async (imageData: string) => {
    try {
      const response = await fetch('https://pieymelbjcvhxcnonpms.supabase.co/functions/v1/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZXltZWxiamN2aHhjbm9ucG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NzM0MzcsImV4cCI6MjA1NDI0OTQzN30.S2BdZHFJA6GY8JenEYLUu3IOVlq1pJbRCHIjOy04vgk`,
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Failed to analyze image');
      return await response.json();
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  };

  const handleMealCapture = async (imageData: string) => {
    setIsAnalyzing(true);
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
      
      // Only navigate after successful analysis and upload
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error analyzing meal",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    handleMealCapture
  };
};
