
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  initialValue: number;
  title: string;
  unit: string;
}

const EditGoalDialog = ({ open, onClose, onSave, initialValue, title, unit }: EditGoalDialogProps) => {
  const [value, setValue] = useState<number>(initialValue);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-secondary border-border text-white">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="goal-value" className="text-sm font-medium text-white">
              Daily {title} Target {unit ? `(${unit})` : ''}
            </label>
            <Input
              id="goal-value"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="bg-muted text-white"
              min={0}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalDialog;
