
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Target, Dumbbell, Clock, Calendar, TrendingUp, Award, Utensils, Activity } from 'lucide-react';
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
    return saved ? JSON.parse(saved) : { calories: 2000, protein: 150 };
  }, []);

  // Calculate progress (example values)
  const caloriesProgress = 65;
  const proteinProgress = 75;
  const streakDays = 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Your Health Goals</h1>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Calories</span>
                  <span className="text-sm text-gray-500">{caloriesProgress}%</span>
                </div>
                <Progress value={caloriesProgress} className="h-2 bg-[#F2FCE2] [&>div]:bg-green-500" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-gray-500">{proteinProgress}%</span>
                </div>
                <Progress value={proteinProgress} className="h-2 bg-[#F2FCE2] [&>div]:bg-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Calories</p>
                  <p className="text-lg font-semibold">{currentGoals.calories} kcal</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Protein</p>
                  <p className="text-lg font-semibold">{currentGoals.protein}g</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-lg font-semibold">{streakDays} days</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activity Level</p>
                  <p className="text-lg font-semibold">Moderate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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

          {/* Tips Section */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Health Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  Stay hydrated by drinking at least 8 glasses of water daily
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  Include protein in every meal to maintain muscle mass
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  Aim for 7-9 hours of quality sleep each night
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Goals;
