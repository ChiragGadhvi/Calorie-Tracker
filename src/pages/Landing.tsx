
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, UtensilsCrossed, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Auth from './Auth';
import { useIsMobile } from '@/hooks/use-mobile';

const PricingCard = ({ 
  tier, 
  price, 
  meals, 
  isPopular 
}: { 
  tier: string; 
  price: string; 
  meals: number;
  isPopular?: boolean;
}) => (
  <div className={`rounded-lg p-6 ${isPopular ? 'bg-primary text-white ring-2 ring-primary' : 'bg-white'}`}>
    <h3 className="text-xl font-semibold mb-2">{tier}</h3>
    <p className="text-3xl font-bold mb-4">
      {price} <span className="text-sm font-normal">/month</span>
    </p>
    <ul className="space-y-3 mb-6">
      <li className="flex items-center gap-2">
        <Check className="h-4 w-4 flex-shrink-0" />
        <span>Analyze up to {meals} meals per day</span>
      </li>
      <li className="flex items-center gap-2">
        <Check className="h-4 w-4 flex-shrink-0" />
        <span>Nutritional insights</span>
      </li>
      <li className="flex items-center gap-2">
        <Check className="h-4 w-4 flex-shrink-0" />
        <span>Progress tracking</span>
      </li>
    </ul>
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className={`w-full ${isPopular ? 'bg-white text-primary hover:bg-gray-100' : ''}`}
          variant={isPopular ? 'outline' : 'default'}
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Auth />
      </DialogContent>
    </Dialog>
  </div>
);

const Landing = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 sm:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-center mb-6">
              <UtensilsCrossed className="h-16 w-16 text-primary" />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
              Calorie Tracker
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto px-4 leading-relaxed">
              Track your nutrition effortlessly. Just snap a photo of your meal and let our AI handle the rest.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <PricingCard 
            tier="Free" 
            price="$0" 
            meals={1}
          />
          <PricingCard 
            tier="Pro" 
            price="$9.99" 
            meals={3}
            isPopular
          />
          <PricingCard 
            tier="Pro Plus" 
            price="$19.99" 
            meals={5}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-center max-w-4xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick & Easy</h3>
            <p className="text-gray-600">Snap a photo and get instant nutritional info</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">Accurate food recognition and analysis</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your nutrition goals effortlessly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
