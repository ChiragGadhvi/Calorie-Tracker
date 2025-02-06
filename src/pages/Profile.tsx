
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex flex-col items-center space-y-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/goals')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Goals Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Profile;
