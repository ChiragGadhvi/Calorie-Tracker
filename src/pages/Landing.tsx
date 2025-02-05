import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Activity, LineChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Auth from './Auth';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section - Mobile Optimized */}
      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">
              NutriSnap
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Transform your nutrition journey with AI-powered meal tracking. Simply snap a photo and let our app do the rest.
            </p>
            <div className="flex justify-center pt-2 sm:pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size={isMobile ? "default" : "lg"}
                    className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <Auth />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Mobile Optimized */}
      <div className="bg-white py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-gray-900" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">Snap & Track</h3>
                <p className="text-sm sm:text-base text-gray-600 text-center">
                  Take a photo of your meal and get instant nutrition information powered by advanced AI technology.
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp" 
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <Activity className="h-8 w-8 sm:h-12 sm:w-12 text-gray-900" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">Track Progress</h3>
                <p className="text-sm sm:text-base text-gray-600 text-center">
                  Monitor your nutrition goals with beautiful visualizations and detailed insights into your eating habits.
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp" 
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <LineChart className="h-8 w-8 sm:h-12 sm:w-12 text-gray-900" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">Stay Healthy</h3>
                <p className="text-sm sm:text-base text-gray-600 text-center">
                  Get personalized recommendations and insights to maintain a balanced, healthy diet tailored to your goals.
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