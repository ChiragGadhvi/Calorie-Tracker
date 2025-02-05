import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, Target, Camera, LogOut, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CameraComponent from '@/components/Camera';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DailyProgress from '@/components/DailyProgress';
import AddMealActions from '@/components/AddMealActions';
import MealList from '@/components/MealList';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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

      if (!response.ok) throw new Error('Failed to analyze image');
      return await response.json();
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
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
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

      const { data: urlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('Image public URL:', publicUrl);

      const analysis = await analyzeMeal(imageData);
      console.log('Meal analysis:', analysis);

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
  const calorieGoal = 2000;
  const proteinGoal = 150;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium">Hello,</p>
              <p className="text-xs text-gray-600">{user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-4">
        <div className="space-y-6">
          <DailyProgress
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            calorieGoal={calorieGoal}
            proteinGoal={proteinGoal}
          />

          <AddMealActions
            onCameraClick={() => setShowCamera(true)}
            onUploadClick={() => fileInputRef.current?.click()}
            isAnalyzing={isAnalyzing}
          />

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <MealList
            meals={todaysMeals}
            onDeleteMeal={handleDeleteMeal}
            onUpdateMeal={fetchMeals}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link to="/" className="flex flex-col items-center p-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/goals" className="flex flex-col items-center p-2">
              <Target className="h-5 w-5 text-gray-600" />
              <span className="text-xs mt-1">Goals</span>
            </Link>
            <button
              onClick={() => setShowCamera(true)}
              className="flex flex-col items-center p-2"
            >
              <Camera className="h-5 w-5 text-gray-600" />
              <span className="text-xs mt-1">Scan</span>
            </button>
            <Link to="/history" className="flex flex-col items-center p-2">
              <History className="h-5 w-5 text-gray-600" />
              <span className="text-xs mt-1">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center p-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
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
