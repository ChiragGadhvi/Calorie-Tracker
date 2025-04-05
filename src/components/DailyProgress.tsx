
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface DailyProgressProps {
  totalCalories: number;
  totalProtein: number;
  calorieGoal: number;
  proteinGoal: number;
}

const DailyProgress = ({ totalCalories, totalProtein, calorieGoal, proteinGoal }: DailyProgressProps) => {
  const caloriesPercentage = Math.min((totalCalories / calorieGoal) * 100, 100);
  const proteinPercentage = Math.min((totalProtein / proteinGoal) * 100, 100);

  return (
    <Card className="bg-calories border-border shadow-md hover:shadow-lg transition-all rounded-xl">
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-white">Calories</span>
            <span className="text-sm text-gray-400">{totalCalories} / {calorieGoal} kcal</span>
          </div>
          <Progress 
            value={caloriesPercentage} 
            className="h-3 bg-muted/70 rounded-full [&>div]:bg-primary"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-white">Protein</span>
            <span className="text-sm text-gray-400">{totalProtein} / {proteinGoal}g</span>
          </div>
          <Progress 
            value={proteinPercentage} 
            className="h-3 bg-muted/70 rounded-full [&>div]:bg-protein"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgress;
