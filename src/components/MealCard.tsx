
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EditMealDialog from './EditMealDialog';

interface MealCardProps {
  id: string;
  image: string;
  calories: number;
  protein: number;
  name: string;
  description: string;
  timestamp: Date;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const MealCard = ({ 
  id,
  image, 
  calories, 
  protein, 
  name, 
  description, 
  timestamp, 
  onDelete,
  onUpdate 
}: MealCardProps) => {
  return (
    <Card className="w-full animate-fadeIn overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
          <div className="flex items-center space-x-1">
            <EditMealDialog
              mealId={id}
              currentName={name}
              currentCalories={calories}
              currentProtein={protein}
              currentDescription={description}
              onUpdate={onUpdate || (() => {})}
            />
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{calories}</span>
              <span className="text-sm text-gray-500">calories</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{protein}g</span>
              <span className="text-sm text-gray-500">protein</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
