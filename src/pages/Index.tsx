import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, History, Target, LogOut, Camera, Upload, MoreVertical, Flame, Apple, Beef } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const navigate = useNavigate();

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
      
      // Log the fetched meals for debugging
      console.log('Fetched meals:', data);
      
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
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZXltZWxiamN2aHhjbm9ucG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NzM0MzcsImV4cCI6MjA1NDI0OTQzN30.S2BdZHFJA6GY8JenEYLUu3IOVlq1pJbRCHIjOy04vgk`,
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
      // Upload image to Supabase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
      
      // Remove data URL prefix and convert to binary
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      console.log('Uploading image to Supabase Storage...');
      const { error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, binaryData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('Image public URL:', publicUrl);

      // Analyze the meal
      const analysis = await analyzeMeal(imageData);
      console.log('Meal analysis:', analysis);

      // Save to database
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

      // Fetch updated meals
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
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
  const calorieGoal = 2000; // We can make this configurable later
  const proteinGoal = 150; // We can make this configurable later

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Nutrition</h1>
            <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/history">
              <Button variant="outline" size="icon" className="bg-white">
                <History className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/goals">
              <Button variant="outline" size="icon" className="bg-white">
                <Target className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Calories</h2>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary">{totalCalories}</span>
                  <span className="text-gray-500 ml-2">/ {calorieGoal} kcal</span>
                </div>
              </div>
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <Progress value={(totalCalories / calorieGoal) * 100} className="h-2" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Protein</h2>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-secondary">{totalProtein}</span>
                  <span className="text-gray-500 ml-2">/ {proteinGoal}g</span>
                </div>
              </div>
              <Beef className="h-6 w-6 text-secondary" />
            </div>
            <Progress value={(totalProtein / proteinGoal) * 100} className="h-2" />
          </div>
        </div>

        {/* Add Meal Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setShowCamera(true)}
            className="flex-1 h-12 bg-primary hover:bg-primary/90"
            disabled={isAnalyzing}
          >
            <Camera className="mr-2 h-5 w-5" /> Take Photo
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1 h-12 bg-white"
            disabled={isAnalyzing}
          >
            <Upload className="mr-2 h-5 w-5" /> Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Today's Meals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Today's Meals</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {todaysMeals.map((meal) => (
              <MealCard 
                key={meal.id}
                id={meal.id}
                image={meal.image_url}
                calories={meal.calories}
                protein={meal.protein}
                name={meal.name}
                description={meal.description}
                timestamp={new Date(meal.created_at)}
                onDelete={() => handleDeleteMeal(meal.id)}
                onUpdate={fetchMeals}
              />
            ))}
            {todaysMeals.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  No meals logged today. Click "Take Photo" or "Upload" to get started!
                </p>
              </div>
            )}
          </div>
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