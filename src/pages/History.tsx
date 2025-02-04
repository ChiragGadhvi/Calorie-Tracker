
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MealCard from '@/components/MealCard';
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
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Meal History</h1>
        </div>

        <div className="space-y-4">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              {...meal}
              image={meal.image_url}
              timestamp={new Date(meal.created_at)}
              onDelete={() => handleDeleteMeal(meal.id)}
            />
          ))}
          {meals.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No meal history available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
