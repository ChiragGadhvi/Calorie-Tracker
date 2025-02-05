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
        className="flex-1 h-12 bg-primary text-white hover:bg-primary/90 transition-all duration-300"
        disabled={isAnalyzing}
      >
        <Camera className="mr-2 h-5 w-5" /> Take Photo
      </Button>
      <Button
        onClick={onUploadClick}
        variant="outline"
        className="flex-1 h-12 bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300"
        disabled={isAnalyzing}
      >
        <Upload className="mr-2 h-5 w-5" /> Upload
      </Button>
    </div>
  );
};

export default AddMealActions;