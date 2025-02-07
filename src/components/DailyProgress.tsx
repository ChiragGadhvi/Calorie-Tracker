
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Beef } from 'lucide-react';

interface DailyProgressProps {
  totalCalories: number;
  totalProtein: number;
  calorieGoal: number;
  proteinGoal: number;
}

const DailyProgress = ({ totalCalories, totalProtein, calorieGoal, proteinGoal }: DailyProgressProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 mb-8">
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Calories</h2>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-[#F97316]">{totalCalories}</span>
                <span className="text-gray-500 ml-2">/ {calorieGoal} kcal</span>
              </div>
            </div>
            <Flame className="h-6 w-6 text-[#F97316]" />
          </div>
          <Progress 
            value={(totalCalories / calorieGoal) * 100} 
            className="h-2 bg-orange-100" 
          />
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Protein</h2>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-[#8B5CF6]">{totalProtein}</span>
                <span className="text-gray-500 ml-2">/ {proteinGoal}g</span>
              </div>
            </div>
            <Beef className="h-6 w-6 text-[#8B5CF6]" />
          </div>
          <Progress 
            value={(totalProtein / proteinGoal) * 100} 
            className="h-2 bg-purple-100"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyProgress;
