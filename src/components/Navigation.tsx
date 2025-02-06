import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, Target, Camera, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CameraComponent from '@/components/Camera';

const Navigation = () => {
  const location = useLocation();
  const [showCamera, setShowCamera] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary ring-2 ring-primary rounded-full" : "text-gray-600";
  };

  return (
    <>
      {showCamera && (
        <CameraComponent
          onCapture={(imageData) => {
            // Handle image capture
            const event = new CustomEvent('imageCaptured', { detail: imageData });
            window.dispatchEvent(event);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
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
              <button
                onClick={() => setShowCamera(true)}
                className={`p-2 cursor-pointer ${isActive('/scan')}`}
              >
                <Camera className="h-5 w-5" />
              </button>
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
