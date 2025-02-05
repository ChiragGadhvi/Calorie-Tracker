import React from 'react';
import MealCard from './MealCard';

interface Meal {
  id: string;
  image_url: string;
  calories: number;
  protein: number;
  name: string;
  description: string;
  created_at: string;
}

interface MealListProps {
  meals: Meal[];
  onDeleteMeal: (id: string) => void;
  onUpdateMeal: () => void;
}

const MealList = ({ meals, onDeleteMeal, onUpdateMeal }: MealListProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Today's Meals</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            id={meal.id}
            image={meal.image_url}
            calories={meal.calories}
            protein={meal.protein}
            name={meal.name}
            description={meal.description}
            timestamp={new Date(meal.created_at)}
            onDelete={() => onDeleteMeal(meal.id)}
            onUpdate={onUpdateMeal}
          />
        ))}
        {meals.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              No meals logged today. Click "Take Photo" or "Upload" to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealList;