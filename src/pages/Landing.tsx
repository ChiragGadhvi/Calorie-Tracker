import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Activity, LineChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Auth from './Auth';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              NutriSnap
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your nutrition journey with AI-powered meal tracking. Simply snap a photo and let our app do the rest.
            </p>
            <div className="flex justify-center pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

      {/* Features Section */}
      <div className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary text-center">Snap & Track</h3>
                <p className="text-gray-600 text-center">
                  Take a photo of your meal and get instant nutrition information powered by advanced AI technology.
                </p>
              </CardContent>
            </Card>
            <Card 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp" 
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <Activity className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary text-center">Track Progress</h3>
                <p className="text-gray-600 text-center">
                  Monitor your nutrition goals with beautiful visualizations and detailed insights into your eating habits.
                </p>
              </CardContent>
            </Card>
            <Card 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp" 
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <LineChart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary text-center">Stay Healthy</h3>
                <p className="text-gray-600 text-center">
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