
import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, Target, Camera, User, Home, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary ring-2 ring-primary rounded-full" : "text-gray-600";
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleCapture = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            const event = new CustomEvent('imageCaptured', { detail: file });
            window.dispatchEvent(event);
          }
        }, 'image/jpeg');
      }
    }
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const uploadEvent = new CustomEvent('imageCaptured', { detail: file });
      window.dispatchEvent(uploadEvent);
    }
  };

  return (
    <>
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center space-x-4 bg-black/50">
            <Button onClick={handleCapture} variant="secondary">
              Take Photo
            </Button>
            <Button onClick={stopCamera} variant="destructive">
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link to="/" className="flex flex-col items-center p-2">
              <div className={`p-2 ${isActive('/')}`}>
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/goals" className="flex flex-col items-center p-2">
              <div className={`p-2 ${isActive('/goals')}`}>
                <Target className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Goals</span>
            </Link>
            <div className="flex flex-col items-center p-2">
              <div className="relative">
                <div 
                  className={`p-2 cursor-pointer ${isActive('/scan')}`}
                  onClick={startCamera}
                >
                  <Camera className="h-5 w-5" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -right-6 top-1/2 -translate-y-1/2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs mt-1">Scan</span>
            </div>
            <Link to="/history" className="flex flex-col items-center p-2">
              <div className={`p-2 ${isActive('/history')}`}>
                <History className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center p-2">
              <div className={`p-2 ${isActive('/profile')}`}>
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
