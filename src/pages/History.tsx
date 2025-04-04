
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MealCard from '@/components/MealCard';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Meal {
  id: string;
  image_url: string;
  calories: number;
  protein: number;
  name: string;
  description: string;
  created_at: string;
}

const History = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
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

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6 mt-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-secondary/80">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2 text-foreground">Meal History</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
          {meals.map((meal) => (
            <div key={meal.id} className="w-full animate-fadeIn animation-delay-200">
              <MealCard
                {...meal}
                image={meal.image_url}
                timestamp={new Date(meal.created_at)}
                onDelete={() => handleDeleteMeal(meal.id)}
              />
            </div>
          ))}
          {meals.length === 0 && (
            <div className="col-span-full">
              <div className="text-center py-12 glass-card rounded-xl px-6">
                <p className="text-gray-400">
                  No meal history available.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default History;
