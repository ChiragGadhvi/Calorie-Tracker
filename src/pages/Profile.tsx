
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Settings, Upload, Mail, Calendar, Trophy, Activity, Heart, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import { Progress } from '@/components/ui/progress';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
    };
    getUser();
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  // Example statistics
  const stats = [
    { icon: Trophy, label: "Achievement Points", value: "2,500", progress: 75 },
    { icon: Activity, label: "Active Days", value: "45", progress: 90 },
    { icon: Heart, label: "Health Score", value: "85", progress: 85 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {stats.map(({ icon: Icon, label, value, progress }) => (
              <Card key={label} className="bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="text-lg font-semibold">{value}</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-1" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="w-full space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate('/goals')}
                >
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Goals Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Preferences</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">30-Day Streak</p>
                        <p className="text-sm text-gray-600">Logged meals for 30 consecutive days</p>
                      </div>
                    </div>
                    <Progress value={80} className="w-20 h-1" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Goal Crusher</p>
                        <p className="text-sm text-gray-600">Hit protein goals 10 times</p>
                      </div>
                    </div>
                    <Progress value={60} className="w-20 h-1" />
                  </div>
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
