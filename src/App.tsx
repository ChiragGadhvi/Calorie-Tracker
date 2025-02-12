
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import Index from '@/pages/Index';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Goals from '@/pages/Goals';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import Scan from '@/pages/Scan';
import NotFound from '@/pages/NotFound';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          setSession(null);
        } else {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session ? 'session exists' : 'no session');
      setSession(session);
      setLoading(false);
    });

    return () => {
      // Cleanup subscription
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            session ? (
              <Index />
            ) : (
              <Landing />
            )
          } 
        />
        <Route
          path="/auth"
          element={session ? <Navigate to="/" replace /> : <Auth />}
        />
        <Route
          path="/goals"
          element={session ? <Goals /> : <Navigate to="/" replace />}
        />
        <Route
          path="/history"
          element={session ? <History /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={session ? <Profile /> : <Navigate to="/" replace />}
        />
        <Route
          path="/scan"
          element={session ? <Scan /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
