
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Flame, Dumbbell, Droplet, Coffee, TrendingUp, Award, Utensils, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/ui/use-toast';
import EditGoalDialog from '@/components/EditGoalDialog';

interface GoalState {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Goals = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<GoalState>({ calories: 2000, protein: 150, carbs: 200, fat: 50 });
  const [editDialog, setEditDialog] = useState<{ open: boolean; type: keyof GoalState | null; title: string; unit: string }>({
    open: false,
    type: null,
    title: '',
    unit: '',
  });
  
  // Calculate progress (example values)
  const caloriesProgress = 65;
  const proteinProgress = 75;
  const streakDays = 7;

  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const handleGoalUpdate = (type: keyof GoalState, value: number) => {
    const newGoals = { ...goals, [type]: value };
    setGoals(newGoals);
    localStorage.setItem('goals', JSON.stringify(newGoals));
    
    toast({
      title: "Goal updated",
      description: `Your ${type} goal has been updated successfully.`,
    });
  };

  const handleCardClick = (type: keyof GoalState, title: string, unit: string = '') => {
    setEditDialog({
      open: true,
      type,
      title,
      unit,
    });
  };

  const handleAutoGenerate = () => {
    const newGoals = {
      calories: 2000,
      protein: Math.round(goals.calories * 0.3 / 4), // 30% of calories from protein (4 cal/g)
      carbs: Math.round(goals.calories * 0.5 / 4),   // 50% of calories from carbs (4 cal/g)
      fat: Math.round(goals.calories * 0.2 / 9),     // 20% of calories from fat (9 cal/g)
    };
    
    setGoals(newGoals);
    localStorage.setItem('goals', JSON.stringify(newGoals));
    
    toast({
      title: "Goals auto-generated",
      description: "We've calculated optimal nutrition goals based on your profile.",
    });
  };

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
            <h1 className="text-xl font-bold text-white">Adjust Goals</h1>
          </div>
          <p className="text-sm text-gray-400">Calories, protein, carbs, and fat</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="rounded-2xl p-6 bg-calories shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleCardClick('calories', 'Calories')}
          >
            <div className="absolute top-4 right-4">
              <Flame className="h-5 w-5 text-white/60" />
            </div>
            <div className="mt-2 mb-1">
              <h2 className="text-3xl font-bold text-white">{goals.calories}</h2>
              <p className="text-sm text-gray-400">Calorie goal</p>
            </div>
          </Card>
          
          <Card 
            className="rounded-2xl p-6 bg-protein shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleCardClick('protein', 'Protein', 'g')}
          >
            <div className="absolute top-4 right-4">
              <Dumbbell className="h-5 w-5 text-protein-foreground/60" />
            </div>
            <div className="mt-2 mb-1">
              <h2 className="text-3xl font-bold text-protein-foreground">{goals.protein}</h2>
              <p className="text-sm text-protein-foreground/70">Protein goal (g)</p>
            </div>
          </Card>
          
          <Card 
            className="rounded-2xl p-6 bg-carbs shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleCardClick('carbs', 'Carbs', 'g')}
          >
            <div className="absolute top-4 right-4">
              <Coffee className="h-5 w-5 text-carbs-foreground/60" />
            </div>
            <div className="mt-2 mb-1">
              <h2 className="text-3xl font-bold text-carbs-foreground">{goals.carbs}</h2>
              <p className="text-sm text-carbs-foreground/70">Carb goal (g)</p>
            </div>
          </Card>
          
          <Card 
            className="rounded-2xl p-6 bg-fat shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleCardClick('fat', 'Fat', 'g')}
          >
            <div className="absolute top-4 right-4">
              <Droplet className="h-5 w-5 text-fat-foreground/60" />
            </div>
            <div className="mt-2 mb-1">
              <h2 className="text-3xl font-bold text-fat-foreground">{goals.fat}</h2>
              <p className="text-sm text-fat-foreground/70">Fat goal (g)</p>
            </div>
          </Card>
        </div>

        <Button 
          className="w-full py-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md font-semibold"
          onClick={handleAutoGenerate}
        >
          Auto generate goals
        </Button>

        {/* Goal edit dialog */}
        {editDialog.type && (
          <EditGoalDialog
            open={editDialog.open}
            onClose={() => setEditDialog({ ...editDialog, open: false })}
            onSave={(value) => handleGoalUpdate(editDialog.type as keyof GoalState, value)}
            initialValue={goals[editDialog.type as keyof GoalState]}
            title={editDialog.title}
            unit={editDialog.unit}
          />
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Goals;
