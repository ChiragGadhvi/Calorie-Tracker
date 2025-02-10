
import React from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanActionsProps {
  onTakePhoto: () => void;
  onUploadClick: () => void;
  isAnalyzing: boolean;
}

const ScanActions = ({ onTakePhoto, onUploadClick, isAnalyzing }: ScanActionsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={onTakePhoto}
        className="h-16 bg-primary text-white hover:bg-primary/90"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        ) : (
          <Camera className="mr-2 h-6 w-6" />
        )}
        {isAnalyzing ? 'Processing...' : 'Take Photo'}
      </Button>
      
      <Button
        onClick={onUploadClick}
        variant="outline"
        className="h-16 bg-white"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        ) : (
          <Upload className="mr-2 h-6 w-6" />
        )}
        {isAnalyzing ? 'Processing...' : 'Upload Image'}
      </Button>
    </div>
  );
};

export default ScanActions;
