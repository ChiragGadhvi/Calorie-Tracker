import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import React from 'react';

interface AddMealActionsProps {
  onCameraClick: () => void;
  onUploadClick: () => void;
  isAnalyzing: boolean;
}

const AddMealActions = ({ onCameraClick, onUploadClick, isAnalyzing }: AddMealActionsProps) => {
  return (
    <div className="flex gap-4 mb-8">
      <Button
        onClick={onCameraClick}
        className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
        disabled={isAnalyzing}
      >
        <Camera className="mr-2 h-5 w-5" /> Take Photo
      </Button>
      <Button
        onClick={onUploadClick}
        variant="outline"
        className="flex-1 h-12 bg-white/50 backdrop-blur-sm border border-purple-100 hover:bg-white/80 transition-all duration-300"
        disabled={isAnalyzing}
      >
        <Upload className="mr-2 h-5 w-5" /> Upload
      </Button>
    </div>
  );
};

export default AddMealActions;