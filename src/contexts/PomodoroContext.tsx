
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PomodoroState {
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number;
  currentSession: 'focus' | 'break';
  sessionCount: number;
  selectedTask: string;
  customDuration: number;
  totalFocusTime: number;
}

interface PomodoroContextType extends PomodoroState {
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetSession: () => void;
  setSelectedTask: (task: string) => void;
  setCustomDuration: (duration: number) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoroContext must be used within PomodoroProvider');
  }
  return context;
};

export const PomodoroProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<PomodoroState>({
    isActive: false,
    isPaused: false,
    timeLeft: 25 * 60,
    currentSession: 'focus',
    sessionCount: 0,
    selectedTask: '',
    customDuration: 25,
    totalFocusTime: 0
  });

  const FOCUS_DURATION = state.customDuration * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  // Load today's focus time
  const loadTodaysFocusTime = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('focus_sessions')
      .select('duration_minutes')
      .eq('user_id', user.id)
      .eq('date', today);
    
    const total = data?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
    setState(prev => ({ ...prev, totalFocusTime: total }));
  };

  useEffect(() => {
    if (user) {
      loadTodaysFocusTime();
    }
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            handleSessionComplete();
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.isPaused]);

  const handleSessionComplete = async () => {
    setState(prev => ({ ...prev, isActive: false }));
    playNotificationSound();
    
    if (state.currentSession === 'focus') {
      await logFocusSession();
      const newSessionCount = state.sessionCount + 1;
      const isLongBreak = newSessionCount % 4 === 0;
      
      setState(prev => ({
        ...prev,
        sessionCount: newSessionCount,
        currentSession: 'break',
        timeLeft: isLongBreak ? LONG_BREAK : SHORT_BREAK
      }));
      
      toast({
        title: "🎉 Focus Session Complete!",
        description: `Great work! Time for a ${isLongBreak ? 'long' : 'short'} break.`,
      });
    } else {
      setState(prev => ({
        ...prev,
        currentSession: 'focus',
        timeLeft: FOCUS_DURATION
      }));
      
      toast({
        title: "Break Over! 💪",
        description: "Ready for another focus session?",
      });
    }
  };

  const logFocusSession = async () => {
    if (!user) return;
    
    try {
      const sessionData = {
        user_id: user.id,
        duration_minutes: state.customDuration,
        date: new Date().toISOString().split('T')[0]
      };

      await supabase.from('focus_sessions').insert([sessionData]);
      setState(prev => ({ ...prev, totalFocusTime: prev.totalFocusTime + state.customDuration }));
    } catch (error) {
      console.error('Error logging focus session:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  const startTimer = () => {
    if (state.currentSession === 'focus' && !state.selectedTask) {
      toast({
        title: "Select a Task",
        description: "Please select a task to focus on.",
        variant: "destructive",
      });
      return;
    }
    
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));
  };

  const pauseTimer = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const stopTimer = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeLeft: prev.currentSession === 'focus' ? FOCUS_DURATION : SHORT_BREAK
    }));
  };

  const resetSession = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      currentSession: 'focus',
      timeLeft: FOCUS_DURATION,
      sessionCount: 0
    }));
  };

  const setSelectedTask = (task: string) => {
    setState(prev => ({ ...prev, selectedTask: task }));
  };

  const setCustomDuration = (duration: number) => {
    setState(prev => ({
      ...prev,
      customDuration: duration,
      timeLeft: duration * 60
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = state.currentSession === 'focus' 
    ? ((FOCUS_DURATION - state.timeLeft) / FOCUS_DURATION) * 100
    : ((SHORT_BREAK - state.timeLeft) / SHORT_BREAK) * 100;

  return (
    <PomodoroContext.Provider value={{
      ...state,
      startTimer,
      pauseTimer,
      stopTimer,
      resetSession,
      setSelectedTask,
      setCustomDuration,
      formatTime,
      progress
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};
