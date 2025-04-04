
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { History, Target, Camera, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CameraComponent from '@/components/Camera';
import { supabase } from '@/integrations/supabase/client';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(null);

  const checkAnalysisLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('remaining_analyses')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setRemainingAnalyses(subscription.remaining_analyses);
      setHasReachedLimit(subscription.remaining_analyses <= 0);
    } catch (error) {
      console.error('Error checking analysis limit:', error);
    }
  };

  useEffect(() => {
    checkAnalysisLimit();

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'subscriptions',
        },
        () => {
          checkAnalysisLimit();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleScanClick = () => {
    if (hasReachedLimit) {
      toast({
        title: "Analysis Limit Reached",
        description: "Thank you for using the app! You've completed all available meal analyses.",
        duration: 4000,
      });
    } else {
      setShowCamera(true);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {showCamera && !hasReachedLimit && (
        <CameraComponent
          onCapture={(imageData) => {
            setShowCamera(false);
            navigate('/scan');
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-border z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-around py-3">
            <Link to="/" className={`bottom-tab ${isActive('/') ? 'bottom-tab-active' : 'text-gray-400'}`}>
              <Home className="bottom-tab-icon mb-1" />
              <span className="text-xs">Home</span>
            </Link>
            
            <Link to="/goals" className={`bottom-tab ${isActive('/goals') ? 'bottom-tab-active' : 'text-gray-400'}`}>
              <Target className="bottom-tab-icon mb-1" />
              <span className="text-xs">Goals</span>
            </Link>
            
            <div className="relative -mt-5">
              <button
                onClick={handleScanClick}
                className={`rounded-full p-4 ${hasReachedLimit ? 'bg-gray-500' : 'bg-primary'} text-white shadow-lg transition-transform hover:scale-105`}
                disabled={hasReachedLimit}
              >
                <Camera className="h-6 w-6" />
              </button>
              {hasReachedLimit && (
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                  Completed
                </span>
              )}
            </div>
            
            <Link to="/history" className={`bottom-tab ${isActive('/history') ? 'bottom-tab-active' : 'text-gray-400'}`}>
              <History className="bottom-tab-icon mb-1" />
              <span className="text-xs">History</span>
            </Link>
            
            <Link to="/profile" className={`bottom-tab ${isActive('/profile') ? 'bottom-tab-active' : 'text-gray-400'}`}>
              <User className="bottom-tab-icon mb-1" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
