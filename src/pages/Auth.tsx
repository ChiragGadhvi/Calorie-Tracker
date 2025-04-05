
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw error;
        }

        toast({
          title: "Success",
          description: "Please check your email to confirm your registration.",
          duration: 5000,
        });
        
        // Switch to sign in mode after successful registration
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign in error details:', error);
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again, or sign up if you don\'t have an account.');
          }
          throw error;
        }

        if (data.session) {
          toast({
            title: "Success",
            description: "Successfully logged in!",
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google Sign In Error",
        description: error.message || "An error occurred during Google authentication",
        variant: "destructive",
        duration: 5000,
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-gray-400">
            {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full bg-secondary border-secondary text-white placeholder:text-gray-500 rounded-xl h-12 px-4"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-secondary border-secondary text-white placeholder:text-gray-500 rounded-xl h-12 px-4"
                minLength={6}
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          </div>

          <Button 
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-base"
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-gray-700"></div>
            <div className="px-3 text-sm text-gray-500 bg-background">or</div>
            <div className="w-full border-t border-gray-700"></div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 border-gray-700 hover:bg-secondary text-white"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <Mail className="w-5 h-5" />
            {googleLoading ? 'Loading...' : 'Sign in with Google'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-primary hover:text-primary/80 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
