
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

interface Subscription {
  remaining_analyses: number;
}

const Index = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [streak, setStreak] = useState(5);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const fetchMeals = async () => {
    try {
      console.log('Fetching meals for user:', user?.id);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user?.id)
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

  const fetchSubscription = async (userId: string) => {
    console.log('Fetching subscription for user:', userId);
    const { data: subscriptionData, error } = await supabase
      .from('subscriptions')
      .select('remaining_analyses')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error loading subscription",
        description: "There was a problem loading your subscription details.",
        variant: "destructive",
      });
    } else {
      console.log('Subscription data:', subscriptionData);
      setSubscription(subscriptionData);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }

      if (user) {
        fetchSubscription(user.id);
      }
    };
    getUser();

    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'subscriptions',
        },
        (payload: any) => {
          if (payload.new && user && payload.new.user_id === user.id) {
            setSubscription(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchMeals();

    const channel = supabase
      .channel('meals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('Meals changed, fetching updates...');
          fetchMeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const TOTAL_ANALYSES = 2;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-0 left-0 right-0 bg-secondary border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Hello,</p>
              <p className="text-xs text-gray-400">{user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-4">
        <div className="space-y-6">
          {subscription && (
            <Card className="bg-secondary border-border shadow-md hover:shadow-lg transition-all rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Remaining Analyses</p>
                      <p className="text-lg font-semibold text-white">
                        {subscription.remaining_analyses}/{TOTAL_ANALYSES}
                        {subscription.remaining_analyses === 0 && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Thank you for using the app!)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-secondary border-border shadow-md hover:shadow-lg transition-all rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Streak</p>
                  <p className="text-lg font-semibold text-white">{streak} days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-border shadow-md hover:shadow-lg transition-all rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-800/30 rounded-full">
                  <Utensils className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Today's Meals</p>
                  <p className="text-lg font-semibold text-white">{todaysMeals.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-border shadow-md hover:shadow-lg transition-all rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-800/30 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Weekly Average</p>
                  <p className="text-lg font-semibold text-white">{Math.round(totalCalories / 7)} cal</p>
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
