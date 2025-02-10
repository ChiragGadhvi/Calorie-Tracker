
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import CameraComponent from '@/components/Camera';
import Navigation from '@/components/Navigation';
import ScanActions from '@/components/ScanActions';
import { useMealAnalysis } from '@/hooks/useMealAnalysis';

const Scan = () => {
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAnalyzing, handleMealCapture } = useMealAnalysis();

  const handleCapture = async (imageData: string) => {
    setShowCamera(false);
    await handleMealCapture(imageData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await handleCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-center mb-8">Add Meal</h1>
        
        <ScanActions
          onTakePhoto={() => setShowCamera(true)}
          onUploadClick={() => fileInputRef.current?.click()}
          isAnalyzing={isAnalyzing}
        />
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {showCamera && (
        <CameraComponent
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      
      <Navigation />
    </div>
  );
};

export default Scan;
