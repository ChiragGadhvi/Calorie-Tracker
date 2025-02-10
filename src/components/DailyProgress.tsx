
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
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm text-gray-500">{totalCalories} / {calorieGoal} kcal</span>
          </div>
          <Progress 
            value={caloriesPercentage} 
            className="h-2 bg-gray-100"
            indicatorClassName="bg-[#9b87f5] transition-all"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Protein</span>
            <span className="text-sm text-gray-500">{totalProtein} / {proteinGoal}g</span>
          </div>
          <Progress 
            value={proteinPercentage} 
            className="h-2 bg-gray-100"
            indicatorClassName="bg-[#7E69AB] transition-all"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgress;

