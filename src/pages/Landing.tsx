
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Auth from './Auth';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background overflow-hidden">
      <div className="container mx-auto px-4 py-8 sm:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
              Calorie Tracker
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto px-4 leading-relaxed">
              Track your nutrition effortlessly. Just snap a photo of your meal and let our AI handle the rest.
            </p>

            <div className="flex justify-center mt-8">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg px-8 py-6 rounded-full button-gradient shadow-lg transform transition hover:scale-105">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-secondary border-border">
                  <Auth />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-center max-w-4xl mx-auto animate-slideUp animation-delay-400">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Quick & Easy</h3>
            <p className="text-gray-300">Snap a photo and get instant nutritional info</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-300">Accurate food recognition and analysis</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-gray-300">Monitor your nutrition goals effortlessly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
