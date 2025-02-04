import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, History, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CameraComponent from '@/components/Camera';
import MealCard from '@/components/MealCard';
import { useToast } from '@/components/ui/use-toast';

interface Meal {
  id: string;
  image: string;
  calories: number;
  protein: number;
  name: string;
  timestamp: Date;
}

const Index = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('meals');
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  // Simulated AI analysis - in reality, you'd want to use a proper AI service
  const analyzeMeal = async (imageData: string): Promise<{ calories: number; protein: number; name: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      calories: Math.floor(Math.random() * 800) + 200,
      protein: Math.floor(Math.random() * 30) + 10,
      name: "Detected Meal", // In reality, this would come from AI
    };
  };

  const handleCapture = async (imageData: string) => {
    toast({
      title: "Analyzing meal...",
      description: "Please wait while we process your image.",
    });

    try {
      const analysis = await analyzeMeal(imageData);
      const newMeal: Meal = {
        id: Date.now().toString(),
        image: imageData,
        ...analysis,
        timestamp: new Date(),
      };

      const updatedMeals = [newMeal, ...meals];
      setMeals(updatedMeals);
      localStorage.setItem('meals', JSON.stringify(updatedMeals));

      toast({
        title: "Meal added successfully!",
        description: `Detected ${analysis.calories} calories and ${analysis.protein}g protein.`,
      });
    } catch (error) {
      toast({
        title: "Error analyzing meal",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive",
      });
    }

    setShowCamera(false);
  };

  const todaysMeals = meals.filter(meal => {
    const today = new Date();
    const mealDate = new Date(meal.timestamp);
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

        <Button
          onClick={() => setShowCamera(true)}
          className="w-full mb-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Meal
        </Button>

        <div className="space-y-4">
          {todaysMeals.map((meal) => (
            <MealCard key={meal.id} {...meal} />
          ))}
          {todaysMeals.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No meals logged today. Click "Add Meal" to get started!
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