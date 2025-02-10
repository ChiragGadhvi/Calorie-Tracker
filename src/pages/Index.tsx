
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Award, Utensils, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DailyProgress from '@/components/DailyProgress';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
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
  const [meals, setMeals] = useState<Meal[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [streak, setStreak] = useState(5); // Example streak count

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
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
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
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

      <div className="max-w-4xl mx-auto px-4 pt-16 pb-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-lg font-semibold">{streak} days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Utensils className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Meals</p>
                  <p className="text-lg font-semibold">{todaysMeals.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weekly Average</p>
                  <p className="text-lg font-semibold">{Math.round(totalCalories / 7)} cal</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DailyProgress
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            calorieGoal={calorieGoal}
            proteinGoal={proteinGoal}
          />

          <MealList
            meals={todaysMeals}
            onDeleteMeal={async (id) => {
              try {
                const { error } = await supabase
                  .from('meals')
                  .delete()
                  .eq('id', id);
                
                if (error) throw error;
                
                fetchMeals();
                toast({
                  title: "Meal deleted",
                  description: "The meal has been removed from your history.",
                });
              } catch (error) {
                toast({
                  title: "Error deleting meal",
                  description: "There was a problem deleting the meal.",
                  variant: "destructive",
                });
              }
            }}
            onUpdateMeal={fetchMeals}
          />
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Index;
