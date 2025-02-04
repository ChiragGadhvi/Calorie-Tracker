import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoalsForm from '@/components/GoalsForm';

const Goals = () => {
  const handleSaveGoals = (calories: number, protein: number) => {
    localStorage.setItem('goals', JSON.stringify({ calories, protein }));
  };

  const currentGoals = React.useMemo(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : { calories: 2000, protein: 150 };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Monthly Goals</h1>
        </div>

        <GoalsForm
          onSave={handleSaveGoals}
          currentCalories={currentGoals.calories}
          currentProtein={currentGoals.protein}
        />
      </div>
    </div>
  );
};

export default Goals;