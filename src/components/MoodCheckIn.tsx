
import React, { useState } from 'react';
import { Heart, Smile, Meh, Frown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MoodCheckInProps {
  onMoodUpdated?: () => void;
}

const MoodCheckIn = ({ onMoodUpdated }: MoodCheckInProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const moods = [
    { emoji: '😄', mood: 'excellent', label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
    { emoji: '😊', mood: 'good', label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
    { emoji: '😐', mood: 'neutral', label: 'Neutral', color: 'text-yellow-600', bg: 'bg-yellow-50 hover:bg-yellow-100' },
    { emoji: '😔', mood: 'low', label: 'Low', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
    { emoji: '😫', mood: 'stressed', label: 'Stressed', color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' }
  ];

  const handleMoodCheck = async (mood: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('mood_checkins')
        .insert([{
          user_id: user.id,
          mood: mood,
          date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;

      onMoodUpdated?.();
      toast({
        title: "Mood Logged! 💕",
        description: `Feeling ${mood} today. Take care of yourself!`,
      });
    } catch (error) {
      console.error('Error logging mood:', error);
      toast({
        title: "Error",
        description: "Failed to log mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-pink-100 p-2 rounded-full">
            <Heart className="h-4 w-4 text-pink-600" />
          </div>
          <h3 className="font-semibold text-pink-800">How are you feeling?</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {moods.map(({ emoji, mood, label, bg }) => (
            <Button
              key={mood}
              variant="ghost"
              size="sm"
              onClick={() => handleMoodCheck(mood)}
              disabled={loading}
              className={`${bg} flex flex-col items-center p-3 h-auto transition-all hover:scale-105`}
              title={label}
            >
              <span className="text-2xl mb-1">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodCheckIn;
