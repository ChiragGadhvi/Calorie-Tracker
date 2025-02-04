
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface EditMealDialogProps {
  mealId: string;
  currentName: string;
  currentCalories: number;
  currentProtein: number;
  currentDescription: string;
  onUpdate: () => void;
}

const EditMealDialog = ({
  mealId,
  currentName,
  currentCalories,
  currentProtein,
  currentDescription,
  onUpdate
}: EditMealDialogProps) => {
  const [name, setName] = React.useState(currentName);
  const [calories, setCalories] = React.useState(currentCalories.toString());
  const [protein, setProtein] = React.useState(currentProtein.toString());
  const [description, setDescription] = React.useState(currentDescription);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('meals')
        .update({
          name,
          calories: parseInt(calories),
          protein: parseInt(protein),
          description,
        })
        .eq('id', mealId);

      if (error) throw error;

      toast({
        title: "Meal updated",
        description: "Your meal has been updated successfully.",
      });
      
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        title: "Error",
        description: "There was a problem updating your meal.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Meal Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter meal name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="calories" className="text-sm font-medium">
              Calories
            </label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Enter calories"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="protein" className="text-sm font-medium">
              Protein (g)
            </label>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Enter protein"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMealDialog;
