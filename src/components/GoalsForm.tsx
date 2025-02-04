import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface GoalsFormProps {
  onSave: (calories: number, protein: number) => void;
  currentCalories?: number;
  currentProtein?: number;
}

const GoalsForm = ({ onSave, currentCalories = 2000, currentProtein = 150 }: GoalsFormProps) => {
  const [calories, setCalories] = React.useState(currentCalories.toString());
  const [protein, setProtein] = React.useState(currentProtein.toString());
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caloriesNum = parseInt(calories);
    const proteinNum = parseInt(protein);

    if (isNaN(caloriesNum) || isNaN(proteinNum)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for calories and protein.",
        variant: "destructive",
      });
      return;
    }

    onSave(caloriesNum, proteinNum);
    toast({
      title: "Goals updated",
      description: "Your monthly goals have been updated successfully.",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Monthly Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium mb-1">
              Daily Calories Target
            </label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Enter daily calories target"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="protein" className="block text-sm font-medium mb-1">
              Daily Protein Target (g)
            </label>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Enter daily protein target"
              min="0"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Goals
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoalsForm;