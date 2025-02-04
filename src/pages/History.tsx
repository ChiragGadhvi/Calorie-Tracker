import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MealCard from '@/components/MealCard';

const History = () => {
  const [meals] = React.useState(() => {
    const saved = localStorage.getItem('meals');
    return saved ? JSON.parse(saved) : [];
  });

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
          {meals.map((meal: any) => (
            <MealCard key={meal.id} {...meal} timestamp={new Date(meal.timestamp)} />
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