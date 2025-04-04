
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
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
    <Card className="w-full overflow-hidden bg-card card-gradient border-border hover:shadow-md transition-all duration-300">
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
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
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
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">{calories}</span>
              <span className="text-sm text-muted-foreground">calories</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">{protein}g</span>
              <span className="text-sm text-muted-foreground">protein</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
