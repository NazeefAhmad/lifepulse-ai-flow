
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
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get tasks for today
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id)
        .or(`due_date.eq.${today},due_date.is.null`)
        .order('created_at', { ascending: false });

      const completedTasks = tasksData?.filter(task => task.status === 'completed').length || 0;
      const totalTasks = tasksData?.length || 0;

      // Get focus time for today (in hours)
      const { data: focusData } = await supabase
        .from('focus_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .eq('date', today);

      const totalFocusMinutes = focusData?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
      const focusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

      // Get mood score (average from recent check-ins)
      const { data: moodData } = await supabase
        .from('mood_checkins')
        .select('mood')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

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

      // Get today's spending
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('date', today);

      const todaysSpend = expensesData?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      setData({
        tasksToday: { completed: completedTasks, total: totalTasks },
        focusTime: focusHours,
        moodScore: Math.round(avgMoodScore * 10) / 10,
        todaysSpend: Math.round(todaysSpend)
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
