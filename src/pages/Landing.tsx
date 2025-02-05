import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              Snap, Track, and Stay Healthy!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your nutrition journey with AI-powered meal tracking. Simply snap a photo and let our app do the rest.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary hover:bg-primary/5"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp">
              <h3 className="text-xl font-semibold mb-3 text-primary">Snap & Track</h3>
              <p className="text-gray-600">
                Take a photo of your meal and get instant nutrition information powered by advanced AI technology.
              </p>
            </div>
            <div 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp" 
              style={{ animationDelay: "0.2s" }}
            >
              <h3 className="text-xl font-semibold mb-3 text-primary">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your nutrition goals with beautiful visualizations and detailed insights into your eating habits.
              </p>
            </div>
            <div 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slideUp" 
              style={{ animationDelay: "0.4s" }}
            >
              <h3 className="text-xl font-semibold mb-3 text-primary">Stay Healthy</h3>
              <p className="text-gray-600">
                Get personalized recommendations and insights to maintain a balanced, healthy diet tailored to your goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;