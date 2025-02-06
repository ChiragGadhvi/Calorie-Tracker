
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Target, Dumbbell, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Monthly Goals</h1>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meal Windows</p>
                  <p className="text-lg font-semibold">5</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tracking Days</p>
                  <p className="text-lg font-semibold">30</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Update Your Goals</CardTitle>
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
      </div>
      <Navigation />
    </div>
  );
};

export default Goals;
