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
      <div className="container mx-auto px-4 py-8 sm:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              NutriSnap
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
              Transform your nutrition journey with AI-powered meal tracking. Simply snap a photo and let our app do the rest.
            </p>
            <div className="flex justify-center pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size={isMobile ? "lg" : "default"}
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8"
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
      </div>

      {/* Features Section - Mobile Optimized */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp border-0">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center items-center h-14 w-14 rounded-full bg-gray-50 mx-auto">
                  <Camera className="h-7 w-7 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center">Snap & Track</h3>
                <p className="text-base text-gray-600 text-center leading-relaxed">
                  Take a photo of your meal and get instant nutrition information powered by advanced AI technology.
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp border-0" 
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center items-center h-14 w-14 rounded-full bg-gray-50 mx-auto">
                  <Activity className="h-7 w-7 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center">Track Progress</h3>
                <p className="text-base text-gray-600 text-center leading-relaxed">
                  Monitor your nutrition goals with beautiful visualizations and detailed insights into your eating habits.
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp border-0" 
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center items-center h-14 w-14 rounded-full bg-gray-50 mx-auto">
                  <LineChart className="h-7 w-7 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center">Stay Healthy</h3>
                <p className="text-base text-gray-600 text-center leading-relaxed">
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