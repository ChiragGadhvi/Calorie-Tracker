
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Auth from './Auth';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/5 rounded-full">
              <UtensilsCrossed className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            NutriSnap
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Track your nutrition effortlessly with AI-powered meal analysis. Simply take a photo of your food, and let our app handle the rest.
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size={isMobile ? "lg" : "default"}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <Auth />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Landing;
