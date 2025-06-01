
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DashboardData {
  tasksToday: { completed: number; total: number };
  focusTime: number;
  moodScore: number;
  todaysSpend: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    tasksToday: { completed: 0, total: 0 },
    focusTime: 0,
    moodScore: 0,
    todaysSpend: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get mood score (average from recent check-ins)
      const { data: moodData } = await supabase
        .from('mood_checkins')
        .select('mood')
        .eq('user_id', user?.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      // Calculate mood score (simplified mapping)
      let avgMoodScore = 7.5; // default
      if (moodData && moodData.length > 0) {
        const moodScores = moodData.map(m => {
          switch (m.mood) {
            case 'happy': return 9;
            case 'excited': return 10;
            case 'content': return 8;
            case 'neutral': return 6;
            case 'sad': return 4;
            case 'stressed': return 3;
            default: return 7;
          }
        });
        avgMoodScore = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
      }

      // For tasks, focus time, and spending - we'll use placeholder data for now
      // since these tables might not exist yet
      setData({
        tasksToday: { completed: 6, total: 8 }, // placeholder
        focusTime: 4.2, // placeholder hours
        moodScore: Math.round(avgMoodScore * 10) / 10,
        todaysSpend: 340 // placeholder
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to default values
      setData({
        tasksToday: { completed: 0, total: 0 },
        focusTime: 0,
        moodScore: 7.5,
        todaysSpend: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refreshData: loadDashboardData };
};
