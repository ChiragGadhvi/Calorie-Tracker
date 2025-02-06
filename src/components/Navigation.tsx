
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, Target, Camera, User, Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-gray-600";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around py-2">
          <Link to="/" className="flex flex-col items-center p-2">
            <Home className={`h-5 w-5 ${isActive('/')}`} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/goals" className="flex flex-col items-center p-2">
            <Target className={`h-5 w-5 ${isActive('/goals')}`} />
            <span className="text-xs mt-1">Goals</span>
          </Link>
          <Link to="/scan" className="flex flex-col items-center p-2">
            <Camera className={`h-5 w-5 ${isActive('/scan')}`} />
            <span className="text-xs mt-1">Scan</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center p-2">
            <History className={`h-5 w-5 ${isActive('/history')}`} />
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center p-2">
            <User className={`h-5 w-5 ${isActive('/profile')}`} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
