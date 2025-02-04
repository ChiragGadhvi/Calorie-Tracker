
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, History, Target, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CameraComponent from '@/components/Camera';
import MealCard from '@/components/MealCard';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Meal {
  id: string;
  image_url: string;
  calories: number;
  protein: number;
  name: string;
  description: string;
  created_at: string;
}

const Index = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast({
        title: "Error loading meals",
        description: "There was a problem loading your meal history.",
        variant: "destructive",
      });
    }
  };

  const analyzeMeal = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('https://pieymelbjcvhxcnonpms.supabase.co/functions/v1/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const analysis = await response.json();
      return analysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = async (imageData: string) => {
    toast({
      title: "Analyzing meal...",
      description: "Please wait while we process your image.",
    });

    try {
      const analysis = await analyzeMeal(imageData);
      
      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(`${Date.now()}.jpg`, imageData);

      if (uploadError) throw uploadError;

      const { data: imageUrlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(uploadData.path);

      // Save meal to database
      const { error: insertError } = await supabase
        .from('meals')
        .insert([
          {
            image_url: imageUrlData.publicUrl,
            ...analysis,
          }
        ]);

      if (insertError) throw insertError;

      await fetchMeals();

      toast({
        title: "Meal added successfully!",
        description: `Detected ${analysis.name} with ${analysis.calories} calories and ${analysis.protein}g protein.`,
      });
    } catch (error) {
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
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await handleCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      await fetchMeals();
      
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: "Error deleting meal",
        description: "There was a problem deleting the meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const todaysMeals = meals.filter(meal => {
    const today = new Date();
    const mealDate = new Date(meal.created_at);
    return (
      mealDate.getDate() === today.getDate() &&
      mealDate.getMonth() === today.getMonth() &&
      mealDate.getFullYear() === today.getFullYear()
    );
  });

  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Meal Tracker</h1>
          <div className="flex gap-2">
            <Link to="/history">
              <Button variant="outline" size="icon">
                <History className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/goals">
              <Button variant="outline" size="icon">
                <Target className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-xl font-bold text-primary">{totalCalories}</p>
            </div>
            <div className="bg-secondary/10 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-xl font-bold text-secondary">{totalProtein}g</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setShowCamera(true)}
            className="flex-1"
            disabled={isAnalyzing}
          >
            <Plus className="mr-2 h-4 w-4" /> Take Photo
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="flex-1"
            disabled={isAnalyzing}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          {todaysMeals.map((meal) => (
            <MealCard 
              key={meal.id} 
              {...meal} 
              image={meal.image_url}
              timestamp={new Date(meal.created_at)}
              onDelete={() => handleDeleteMeal(meal.id)} 
            />
          ))}
          {todaysMeals.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No meals logged today. Click "Take Photo" or "Upload" to get started!
            </p>
          )}
        </div>
      </div>

      {showCamera && (
        <CameraComponent
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default Index;
