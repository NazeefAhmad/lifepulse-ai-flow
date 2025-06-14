import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, Timer, Target, Coffee, TrendingUp, BarChart3, Calendar as CalendarIcon, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [currentSession, setCurrentSession] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [customDuration, setCustomDuration] = useState(25);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalSessions: 0,
    avgSessionLength: 0,
    totalFocusTime: 0,
    completionRate: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const FOCUS_DURATION = customDuration * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  useEffect(() => {
    if (user) {
      loadTasks();
      loadRecentSessions();
      loadTodaysFocusTime();
      loadWeeklyAnalytics();
    }
  }, [user]);

  // Real-time updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !isActive) {
        loadRecentSessions();
        loadTodaysFocusTime();
        loadWeeklyAnalytics();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, isActive]);

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
      .limit(10);
    
    const transformedSessions: FocusSession[] = (data || []).map(session => ({
      id: session.id,
      task_title: 'Focus Session',
      duration_minutes: session.duration_minutes,
      completed: true,
      date: session.date
    }));
    
    setRecentSessions(transformedSessions);
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

  const loadWeeklyAnalytics = async () => {
    if (!user) return;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const { data } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data) {
      // Process data for charts
      const dailyData = data.reduce((acc: any, session: any) => {
        const date = session.date;
        if (!acc[date]) {
          acc[date] = { date, totalMinutes: 0, sessions: 0 };
        }
        acc[date].totalMinutes += session.duration_minutes;
        acc[date].sessions += 1;
        return acc;
      }, {});

      setWeeklyData(Object.values(dailyData));

      // Calculate stats
      const totalSessions = data.length;
      const totalMinutes = data.reduce((sum: number, session: any) => sum + session.duration_minutes, 0);
      const avgSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;

      setWeeklyStats({
        totalSessions,
        avgSessionLength,
        totalFocusTime: totalMinutes,
        completionRate: 100 // All logged sessions are considered completed
      });
    }
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

      // Refresh data after completion
      loadRecentSessions();
      loadTodaysFocusTime();
      loadWeeklyAnalytics();
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
        date: new Date().toISOString().split('T')[0]
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
    // Removed the mandatory task selection check
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Focus Mode & Analytics
              </h1>
              <p className="text-gray-600">Pomodoro Timer with Real-time Insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center p-3 bg-purple-50 rounded-lg border">
              <div className="text-sm text-purple-600 font-medium">Today's Focus</div>
              <div className="text-2xl font-bold text-purple-700">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border">
              <div className="text-sm text-blue-600 font-medium">Weekly Total</div>
              <div className="text-2xl font-bold text-blue-700">{Math.floor(weeklyStats.totalFocusTime / 60)}h</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="timer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="timer" className="data-[state=active]:bg-purple-100">
              <Timer className="h-4 w-4 mr-2" />
              Focus Timer
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-100">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics & Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced Timer Card */}
              <Card className={`lg:col-span-2 bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-xl ${
                isActive && !isPaused 
                  ? 'shadow-lg ring-2 ring-blue-100 ring-opacity-50 animate-pulse' 
                  : ''
              }`}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Timer className="h-6 w-6 text-purple-600" />
                    {currentSession === 'focus' ? 'Focus Session' : 'Break Time'}
                    {currentSession === 'break' && <Coffee className="h-5 w-5 text-orange-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer Display */}
                  <div className="text-center">
                    <div className={`text-8xl font-mono font-bold text-purple-600 mb-4 drop-shadow-lg ${
                      isActive && !isPaused 
                        ? 'drop-shadow-lg text-blue-600' 
                        : ''
                    }`}>
                      {formatTime(timeLeft)}
                    </div>
                    <Progress value={progress} className="h-4 mb-4" />
                    <div className="flex items-center justify-center gap-3">
                      <Badge variant={currentSession === 'focus' ? 'default' : 'secondary'} className="px-3 py-1">
                        Session {sessionCount + 1}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        {currentSession === 'focus' ? `${customDuration} min focus` : 'Break'}
                      </Badge>
                      {isActive && (
                        <Badge variant="destructive" className="animate-pulse">
                          {isPaused ? 'Paused' : 'Active'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Controls */}
                  <div className="flex justify-center gap-4">
                    {!isActive ? (
                      <Button onClick={startTimer} size="lg" className="bg-green-600 hover:bg-green-700 shadow-lg hover:scale-105 transition-all">
                        <Play className="h-5 w-5 mr-2" />
                        Start Focus
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} size="lg" variant="outline" className="hover:scale-105 transition-all">
                        <Pause className="h-5 w-5 mr-2" />
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                    )}
                    
                    <Button onClick={stopTimer} size="lg" variant="destructive" className="hover:scale-105 transition-all">
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </Button>
                    
                    <Button onClick={resetSession} size="lg" variant="outline" className="hover:scale-105 transition-all">
                      Reset Session
                    </Button>
                  </div>

                  {/* Task Selection */}
                  {currentSession === 'focus' && (
                    <div className="space-y-3 p-4 bg-purple-50 rounded-lg border">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Focus Task
                      </label>
                      <select
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
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
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Focus Duration (minutes)
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[15, 25, 45, 60, 90].map((duration) => (
                          <Button
                            key={duration}
                            variant={customDuration === duration ? "default" : "outline"}
                            onClick={() => {
                              setCustomDuration(duration);
                              setTimeLeft(duration * 60);
                            }}
                            size="sm"
                            className="hover:scale-105 transition-all"
                          >
                            {duration}m
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Side Panel */}
              <div className="space-y-6">
                {/* Today's Progress */}
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-purple-600" />
                      Today's Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sessions Completed</span>
                        <Badge variant="secondary" className="font-bold">{sessionCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Focus Time</span>
                        <span className="font-semibold text-purple-600">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Goal Progress</span>
                        <span className="font-semibold text-green-600">{Math.min(Math.round((totalFocusTime / 480) * 100), 100)}%</span>
                      </div>
                      <Progress value={Math.min((totalFocusTime / 480) * 100, 100)} className="h-2" />
                      <p className="text-xs text-gray-500">Daily goal: 8 hours</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Recent Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recentSessions.length > 0 ? (
                        recentSessions.map((session, index) => (
                          <div key={session.id || index} className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">{session.task_title}</div>
                              <div className="text-gray-500">{session.duration_minutes} min • {new Date(session.date).toLocaleDateString()}</div>
                            </div>
                            <Badge variant="default" className="text-xs bg-green-600">
                              ✓
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-8">
                          <Timer className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          No sessions yet today
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Weekly Stats Cards */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                      <p className="text-3xl font-bold text-blue-800">{weeklyStats.totalSessions}</p>
                    </div>
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Avg Session</p>
                      <p className="text-3xl font-bold text-green-800">{weeklyStats.avgSessionLength.toFixed(0)}m</p>
                    </div>
                    <Timer className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Weekly Focus</p>
                      <p className="text-3xl font-bold text-purple-800">{Math.floor(weeklyStats.totalFocusTime / 60)}h</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Success Rate</p>
                      <p className="text-3xl font-bold text-orange-800">{weeklyStats.completionRate.toFixed(0)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Focus Trend Chart */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Weekly Focus Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="totalMinutes" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.3}
                        name="Focus Minutes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FocusMode;
