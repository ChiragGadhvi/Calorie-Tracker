
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Activity, Leaf, Heart, Apple, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Auth from './Auth';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section - Mobile Optimized */}
      <div className="container mx-auto px-4 py-8 sm:py-20 flex min-h-screen items-center">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-center space-x-4 mb-6">
              <UtensilsCrossed className="h-12 w-12 text-primary" />
              <Apple className="h-12 w-12 text-green-500" />
              <Heart className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
              NutriSnap
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
              Transform your nutrition journey with AI-powered meal tracking. Simply snap a photo and let our app do the rest.
            </p>
            <div className="flex justify-center pt-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
            <Card className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-slideUp">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center items-center h-14 w-14 rounded-full bg-green-50 mx-auto">
                  <Camera className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Snap & Track</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Take a photo of your meal and get instant nutrition information powered by advanced AI.
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-slideUp" 
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center items-center h-14 w-14 rounded-full bg-blue-50 mx-auto">
                  <Activity className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Track Progress</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Monitor your nutrition goals with beautiful visualizations and detailed insights.
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-slideUp" 
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center items-center h-14 w-14 rounded-full bg-purple-50 mx-auto">
                  <Leaf className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Stay Healthy</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Get personalized recommendations and insights to maintain a balanced diet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
