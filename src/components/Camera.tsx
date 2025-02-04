import React, { useRef, useState } from 'react';
import { Camera, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraComponent = ({ onCapture, onClose }: CameraComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');

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

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
        stopCamera();
      }
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-4 relative animate-fadeIn">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          <XCircle className="h-6 w-6" />
        </button>
        
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
          {error ? (
            <div className="h-full flex items-center justify-center text-red-500 p-4 text-center">
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
        </div>

        <div className="flex justify-center">
          <Button
            onClick={takePhoto}
            className="bg-primary hover:bg-primary/90"
            disabled={!isStreaming}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;