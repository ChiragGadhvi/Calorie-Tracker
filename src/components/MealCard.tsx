
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MealCardProps {
  image: string;
  calories: number;
  protein: number;
  name: string;
  description: string;
  timestamp: Date;
  onDelete?: () => void;
}

const MealCard = ({ image, calories, protein, name, description, timestamp, onDelete }: MealCardProps) => {
  return (
    <Card className="w-full animate-fadeIn">
      <div className="w-full h-48 relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{name}</h3>
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
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <p className="font-medium">{calories} calories</p>
            <p>{protein}g protein</p>
          </div>
          <div className="text-right">
            <p>{formatDistanceToNow(timestamp, { addSuffix: true })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
