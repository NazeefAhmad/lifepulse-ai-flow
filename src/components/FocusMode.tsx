
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, Timer, Target, Coffee, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FocusModeProps {
  onBack: () => void;
}

interface FocusSession {
  id?: string;
  task_title: string;
  duration_minutes: number;
  completed: boolean;
  date: string;
}

const FocusMode = ({ onBack }: FocusModeProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [customDuration, setCustomDuration] = useState(25);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const FOCUS_DURATION = customDuration * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  useEffect(() => {
    if (user) {
      loadTasks();
      loadRecentSessions();
      loadTodaysFocusTime();
    }
  }, [user]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
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
  }, [isActive, isPaused]);

  const loadTasks = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    setTasks(data || []);
  };

  const loadRecentSessions = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(5);
    
    setRecentSessions(data || []);
  };

  const loadTodaysFocusTime = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('focus_sessions')
      .select('duration_minutes')
      .eq('user_id', user.id)
      .eq('date', today);
    
    const total = data?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
    setTotalFocusTime(total);
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    playNotificationSound();
    
    if (currentSession === 'focus') {
      // Log the focus session
      await logFocusSession();
      setSessionCount(prev => prev + 1);
      
      // Determine break type
      const isLongBreak = (sessionCount + 1) % 4 === 0;
      setCurrentSession('break');
      setTimeLeft(isLongBreak ? LONG_BREAK : SHORT_BREAK);
      
      toast({
        title: "🎉 Focus Session Complete!",
        description: `Great work! Time for a ${isLongBreak ? 'long' : 'short'} break.`,
      });
    } else {
      // Break completed
      setCurrentSession('focus');
      setTimeLeft(FOCUS_DURATION);
      
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
        duration_minutes: customDuration,
        date: new Date().toISOString().split('T')[0],
        task_title: selectedTask || 'General Focus',
        completed: true
      };

      const { error } = await supabase
        .from('focus_sessions')
        .insert([sessionData]);

      if (error) throw error;

      // Update task progress if a task was selected
      if (selectedTask && tasks.find(t => t.title === selectedTask)) {
        const task = tasks.find(t => t.title === selectedTask);
        await supabase
          .from('tasks')
          .update({ status: 'in-progress' })
          .eq('id', task.id);
      }

      setTotalFocusTime(prev => prev + customDuration);
      loadRecentSessions();

    } catch (error) {
      console.error('Error logging focus session:', error);
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    if (currentSession === 'focus' && !selectedTask) {
      toast({
        title: "Select a Task",
        description: "Please select a task to focus on.",
        variant: "destructive",
      });
      return;
    }
    
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(currentSession === 'focus' ? FOCUS_DURATION : SHORT_BREAK);
  };

  const resetSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentSession('focus');
    setTimeLeft(FOCUS_DURATION);
    setSessionCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentSession === 'focus' 
    ? ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100
    : ((SHORT_BREAK - timeLeft) / SHORT_BREAK) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Focus Mode
              </h1>
              <p className="text-gray-600">Pomodoro Timer & Productivity Tracker</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Today's Focus Time</div>
            <div className="text-2xl font-bold text-purple-600">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
          </div>
        </div>

        {/* Main Timer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Timer className="h-6 w-6 text-purple-600" />
                {currentSession === 'focus' ? 'Focus Session' : 'Break Time'}
                {currentSession === 'break' && <Coffee className="h-5 w-5 text-orange-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-8xl font-mono font-bold text-purple-600 mb-4">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={progress} className="h-3 mb-4" />
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={currentSession === 'focus' ? 'default' : 'secondary'}>
                    Session {sessionCount + 1}
                  </Badge>
                  <Badge variant="outline">
                    {currentSession === 'focus' ? `${customDuration} min focus` : 'Break'}
                  </Badge>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isActive ? (
                  <Button onClick={startTimer} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" variant="outline">
                    <Pause className="h-5 w-5 mr-2" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
                
                <Button onClick={stopTimer} size="lg" variant="destructive">
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
                
                <Button onClick={resetSession} size="lg" variant="outline">
                  Reset Session
                </Button>
              </div>

              {/* Task Selection */}
              {currentSession === 'focus' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Focus Task</label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isActive}
                  >
                    <option value="">Select a task to focus on...</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.title}>
                        {task.title}
                      </option>
                    ))}
                    <option value="General Focus">General Focus (No specific task)</option>
                  </select>
                </div>
              )}

              {/* Duration Settings */}
              {!isActive && currentSession === 'focus' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Focus Duration (minutes)</label>
                  <div className="flex gap-2">
                    {[15, 25, 45, 60].map((duration) => (
                      <Button
                        key={duration}
                        variant={customDuration === duration ? "default" : "outline"}
                        onClick={() => {
                          setCustomDuration(duration);
                          setTimeLeft(duration * 60);
                        }}
                        size="sm"
                      >
                        {duration}m
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Today's Progress */}
            <Card className="bg-white border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sessions Completed</span>
                    <span className="font-semibold">{sessionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Focus Time</span>
                    <span className="font-semibold">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Goal Progress</span>
                    <span className="font-semibold">{Math.min(Math.round((totalFocusTime / 480) * 100), 100)}%</span>
                  </div>
                  <Progress value={Math.min((totalFocusTime / 480) * 100, 100)} className="h-2" />
                  <p className="text-xs text-gray-500">Daily goal: 8 hours</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="bg-white border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentSessions.length > 0 ? (
                    recentSessions.map((session, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                        <div className="text-sm">
                          <div className="font-medium">{session.task_title}</div>
                          <div className="text-gray-500">{session.duration_minutes} min</div>
                        </div>
                        <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                          {session.completed ? "✓" : "⏸"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent sessions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
