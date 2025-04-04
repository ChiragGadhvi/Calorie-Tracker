
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Flame, Dumbbell, Droplet, Coffee, TrendingUp, Award, Utensils, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import GoalsForm from '@/components/GoalsForm';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/ui/use-toast';

const Goals = () => {
  const { toast } = useToast();
  
  const handleSaveGoals = (calories: number, protein: number) => {
    localStorage.setItem('goals', JSON.stringify({ calories, protein }));
    toast({
      title: "Goals updated",
      description: "Your nutrition goals have been updated successfully.",
    });
  };

  const currentGoals = React.useMemo(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : { calories: 2000, protein: 150, carbs: 200, fat: 50 };
  }, []);

  // Calculate progress (example values)
  const caloriesProgress = 65;
  const proteinProgress = 75;
  const streakDays = 7;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-secondary py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Adjust goals</h1>
          </div>
          <p className="text-sm text-gray-400">Calories, carbs, fats, and protein</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="nutrition-card bg-calories">
            <Flame className="nutrition-card-icon h-5 w-5" />
            <h2 className="mt-8 text-3xl font-bold">{currentGoals.calories}</h2>
            <p className="text-sm text-gray-400">Calorie goal</p>
          </div>
          
          <div className="nutrition-card bg-protein">
            <Dumbbell className="nutrition-card-icon h-5 w-5" />
            <h2 className="mt-8 text-3xl font-bold text-secondary">{currentGoals.protein}</h2>
            <p className="text-sm text-gray-600">Protein goal</p>
          </div>
          
          <div className="nutrition-card bg-carbs">
            <Coffee className="nutrition-card-icon h-5 w-5" />
            <h2 className="mt-8 text-3xl font-bold text-secondary">{currentGoals.carbs}</h2>
            <p className="text-sm text-gray-600">Carb goal</p>
          </div>
          
          <div className="nutrition-card bg-fat">
            <Droplet className="nutrition-card-icon h-5 w-5" />
            <h2 className="mt-8 text-3xl font-bold text-secondary">{currentGoals.fat}</h2>
            <p className="text-sm text-gray-600">Fat goal</p>
          </div>
        </div>

        <Button 
          className="w-full py-6 rounded-xl button-gradient shadow-md font-semibold"
          onClick={() => {
            toast({
              title: "Goals auto-generated",
              description: "We've calculated optimal nutrition goals based on your profile.",
            });
          }}
        >
          Auto generate goals
        </Button>

        <Card className="bg-secondary border-border shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Utensils className="h-5 w-5" />
              Update Your Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalsForm
              onSave={handleSaveGoals}
              currentCalories={currentGoals.calories}
              currentProtein={currentGoals.protein}
            />
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Goals;
