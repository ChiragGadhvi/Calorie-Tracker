
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Award, Utensils, TrendingUp, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DailyProgress from '@/components/DailyProgress';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import MealList from '@/components/MealList';
import Onboarding from '@/components/Onboarding';
import FeedbackPopup from '@/components/FeedbackPopup';

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

const TILE_STYLES = [
  "from-soft-green to-[#A8E890]", // Soft green gradient (from palette)
  "from-soft-yellow to-[#FFF7CD]", // Soft yellow gradient
  "from-soft-purple to-[#C8A4D4]", // Soft purple gradient
  "from-soft-pink to-[#FFD6E0]",   // Soft pink gradient
  "from-soft-peach to-[#FEC6A1]",  // Soft peach/orange gradient
];

// Updated onboarding pages with cute food emojis and clearer steps
const pages = [
  {
    emoji: "🍔",
    title: "Snap a Photo",
    desc: "Take a picture of your meal to analyze nutrition."
  },
  {
    emoji: "📊",
    title: "Track Your Progress",
    desc: "See calories and protein instantly. Stay motivated!"
  },
  {
    emoji: "🥕🍎🍰",
    title: "Stay Healthy!",
    desc: "Get insights and keep moving towards your goals."
  },
];

export default function Index() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [streak, setStreak] = useState(5);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Show onboarding popup for new users
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (!hasOnboarded) setShowOnboarding(true);
  }, []);

  // Hide onboarding and store flag
  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasOnboarded', 'true');
    setShowOnboarding(false);
  };

  // Fetch meals for logged in user
  const fetchMeals = async () => {
    try {
      if (!user) return;
      console.log('Fetching meals for user:', user.id);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
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

  // Fetch subscription is kept but without Razorpay/payments influence.
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

  // After 2 meals are logged, show the feedback popup once
  useEffect(() => {
    if (meals.length >= 2 && !feedbackSubmitted && !showFeedback) {
      setTimeout(() => setShowFeedback(true), 200);
    }
  }, [meals.length, feedbackSubmitted, showFeedback]);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-secondary py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
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
          <h1 className="text-2xl font-bold text-white mt-4">Today's Summary</h1>
          <p className="text-sm text-gray-400">Track your nutrition progress</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
        <div className="space-y-6">
          {subscription && (
            <Card className="bg-secondary border-border shadow-md rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Remaining Analyses</p>
                      <p className="text-lg font-semibold text-white">
                        {subscription.remaining_analyses}
                        {subscription.remaining_analyses === 0 && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Buy more analyses)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                    onClick={() => navigate('/subscription')}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Get More
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="relative rounded-2xl p-6 bg-gradient-to-br from-soft-green to-[#A8E890] border-none shadow-md hover:shadow-lg transition-all">
              <div className="absolute top-4 right-4 text-black/40">
                <Award className="h-5 w-5" />
              </div>
              <div className="mt-2 mb-1">
                <h2 className="text-lg font-semibold text-black">Current Streak</h2>
                <p className="text-2xl font-bold text-black mt-1">{streak} days</p>
              </div>
            </Card>

            <Card className="relative rounded-2xl p-6 bg-gradient-to-br from-soft-yellow to-[#FFF7CD] border-none shadow-md hover:shadow-lg transition-all">
              <div className="absolute top-4 right-4 text-yellow-700/60">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="mt-2 mb-1">
                <h2 className="text-lg font-semibold text-yellow-900">Today's Meals</h2>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{todaysMeals.length}</p>
              </div>
            </Card>

            <Card className="relative rounded-2xl p-6 bg-gradient-to-br from-soft-purple to-[#C8A4D4] border-none shadow-md hover:shadow-lg transition-all col-span-2">
              <div className="absolute top-4 right-4 text-purple-700/60">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="mt-2 mb-1">
                <h2 className="text-lg font-semibold text-purple-800">Weekly Average</h2>
                <p className="text-2xl font-bold text-purple-800 mt-1">{Math.round(totalCalories / 7)} cal</p>
              </div>
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

          {showOnboarding && <Onboarding onComplete={handleCompleteOnboarding} />}
          {showFeedback && !feedbackSubmitted && (
            <FeedbackPopup
              onClose={() => setShowFeedback(false)}
              onSubmit={async (feedback) => {
                if (!user) return;
                await supabase.from('feedback').insert([
                  { user_id: user.id, feedback }
                ]);
                setFeedbackSubmitted(true);
                setShowFeedback(false);
                toast({ title: "Thanks for your feedback!" });
              }}
            />
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}
