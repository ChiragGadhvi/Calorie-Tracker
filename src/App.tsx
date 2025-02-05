import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import Index from '@/pages/Index';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Goals from '@/pages/Goals';
import History from '@/pages/History';
import NotFound from '@/pages/NotFound';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={session ? <Index /> : <Landing />} />
        <Route
          path="/auth"
          element={session ? <Navigate to="/" replace /> : <Auth />}
        />
        <Route
          path="/goals"
          element={session ? <Goals /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/history"
          element={session ? <History /> : <Navigate to="/auth" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;