import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Rocket, Globe, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Meals with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Effortlessly track your nutrition using our advanced AI-powered meal recognition system. Just snap a photo and let our app do the rest.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Recognition</h3>
            <p className="text-gray-600">
              Instantly identify meals and their nutritional content with our advanced AI technology.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your daily calories and protein intake with beautiful visualizations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600">
              Join a community of health-conscious individuals sharing their journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;