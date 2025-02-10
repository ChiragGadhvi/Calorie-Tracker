
import React, { useRef, useState } from 'react';
import { Camera as CameraIcon, XCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraComponent = ({ onCapture, onClose }: CameraComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
      console.error('Camera access error:', err);
    }
  };

  const analyzeMeal = async (imageData: string) => {
    try {
      const response = await fetch('https://pieymelbjcvhxcnonpms.supabase.co/functions/v1/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZXltZWxiamN2aHhjbm9ucG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NzM0MzcsImV4cCI6MjA1NDI0OTQzN30.S2BdZHFJA6GY8JenEYLUu3IOVlq1pJbRCHIjOy04vgk`,
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Failed to analyze image');
      return await response.json();
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  };

  const handleImageProcessing = async (imageData: string) => {
    toast({
      title: "Analyzing meal...",
      description: "Please wait while we process your image.",
    });

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const { error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, binaryData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      const analysis = await analyzeMeal(imageData);

      const { error: insertError } = await supabase
        .from('meals')
        .insert([{
          image_url: publicUrl,
          calories: analysis.calories,
          protein: analysis.protein,
          name: analysis.name,
          description: analysis.description,
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Meal added successfully!",
        description: `Detected ${analysis.name} with ${analysis.calories} calories and ${analysis.protein}g protein.`,
      });

      setTimeout(() => {
        stopCamera();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error analyzing meal",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        stopCamera();
        handleImageProcessing(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      handleImageProcessing(imageData);
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1">
        {error ? (
          <div className="h-full flex items-center justify-center text-white p-4 text-center">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={cn(
              "w-full h-full object-cover",
              !isStreaming && "hidden"
            )}
          />
        )}
        
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute right-4 top-4 text-white hover:text-gray-200"
        >
          <XCircle className="h-8 w-8" />
        </button>
      </div>

      <div className="bg-black p-6 flex justify-center gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>

        <Button
          onClick={takePhoto}
          className="bg-white text-black hover:bg-white/90"
          disabled={!isStreaming}
        >
          <CameraIcon className="mr-2 h-4 w-4" />
          Take Photo
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CameraComponent;
