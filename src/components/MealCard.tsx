import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface MealCardProps {
  image: string;
  calories: number;
  protein: number;
  name: string;
  timestamp: Date;
}

const MealCard = ({ image, calories, protein, name, timestamp }: MealCardProps) => {
  return (
    <Card className="w-full animate-fadeIn">
      <CardHeader className="p-4">
        <div className="aspect-video relative rounded-md overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
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