
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

      if (subscription.remaining_analyses <= 0) {
        toast({
          title: "Analysis Limit Reached",
          description: "Thank you for using the app! You've completed all your available meal analyses.",
          duration: 6000,
        });
      }
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
    return location.pathname === path ? "text-primary ring-2 ring-primary rounded-full" : "text-gray-600";
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
                onClick={handleScanClick}
                className={`p-2 cursor-pointer ${isActive('/scan')} ${hasReachedLimit ? 'opacity-50' : ''}`}
                disabled={hasReachedLimit}
                aria-disabled={hasReachedLimit}
              >
                <Camera className={`h-5 w-5 ${hasReachedLimit ? 'text-gray-400' : ''}`} />
              </button>
              <span className="text-xs mt-1">Scan {hasReachedLimit ? '(Completed)' : ''}</span>
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
