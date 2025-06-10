
import React, { useState, useEffect } from 'react';
import { Clock, Target, DollarSign, BookOpen, Calendar, Heart, CheckSquare, Timer, TrendingUp, Zap, Coffee, Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import MoodCheckIn from './MoodCheckIn';

interface BentoDashboardProps {
  onModuleClick: (module: string) => void;
}

const BentoDashboard = ({ onModuleClick }: BentoDashboardProps) => {
  const { user } = useAuth();
  const { data, refreshData } = useDashboardData();
  const {
    isActive,
    isPaused,
    timeLeft,
    currentSession,
    sessionCount,
    totalFocusTime,
    formatTime,
    progress,
    startTimer,
    pauseTimer,
    stopTimer
  } = usePomodoroContext();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bentoItems = [
    // Hero Focus Timer Card - Premium Design
    {
      id: 'focus-timer',
      className: 'col-span-2 row-span-3 relative overflow-hidden',
      content: (
        <div className="h-full relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 bg-yellow-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Timer className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Focus Mode</h2>
                  <p className="text-white/80 text-sm">Deep work sessions</p>
                </div>
              </div>
              {isActive && (
                <Badge className="bg-green-500/80 backdrop-blur-sm text-white border-0 animate-pulse px-4 py-2">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
                  {isPaused ? 'Paused' : 'Active'}
                </Badge>
              )}
            </div>
            
            {/* Timer Display */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-7xl font-bold font-mono mb-6 tracking-tight">
                {formatTime(timeLeft)}
              </div>
              
              {/* Progress Ring */}
              <div className="relative mb-8">
                <div className="w-48 h-48 relative">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 2.51} 251`}
                      className="transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1">
                        {currentSession === 'focus' ? 'Focus' : 'Break'}
                      </div>
                      <div className="text-sm opacity-80">
                        Session #{sessionCount + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls & Stats */}
            <div className="space-y-6">
              {/* Timer Controls */}
              <div className="flex justify-center gap-4">
                {!isActive ? (
                  <Button 
                    onClick={startTimer}
                    className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm px-8 py-3 text-lg"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Focus
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={pauseTimer}
                      className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm px-6"
                      variant="outline"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button 
                      onClick={stopTimer}
                      className="bg-red-500/80 hover:bg-red-600/80 text-white px-6"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
                  <div className="text-sm opacity-80">Today's Focus</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold">{sessionCount}</div>
                  <div className="text-sm opacity-80">Sessions</div>
                </div>
              </div>

              <Button 
                onClick={() => onModuleClick('focus')} 
                className="w-full bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm py-3"
                variant="outline"
              >
                <Zap className="h-4 w-4 mr-2" />
                Advanced Focus Mode
              </Button>
            </div>
          </div>
        </div>
      )
    },

    // Quick Stats Cards - Beautiful & Functional
    {
      id: 'tasks-today',
      className: 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckSquare className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white text-xs px-3 py-1 backdrop-blur-sm">
              {data?.tasksToday?.total - data?.tasksToday?.completed || 0} left
            </Badge>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold mb-1">{data?.tasksToday?.completed || 0}</div>
            <div className="text-emerald-100 text-sm">Tasks Completed</div>
            <div className="text-xs text-emerald-200 mt-1">
              {data?.tasksToday?.total || 0} total today
            </div>
          </div>
          <Button 
            onClick={() => onModuleClick('tasks')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm relative z-10"
            variant="ghost"
          >
            <Target className="h-4 w-4 mr-2" />
            Manage Tasks
          </Button>
        </div>
      )
    },

    {
      id: 'expenses-today',
      className: 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white text-xs px-3 py-1 backdrop-blur-sm">Today</Badge>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold mb-1">${data?.todaysSpend || 0}</div>
            <div className="text-green-100 text-sm">Spent Today</div>
            <div className="text-xs text-green-200 mt-1">Track expenses</div>
          </div>
          <Button 
            onClick={() => onModuleClick('expenses')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm relative z-10"
            variant="ghost"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      )
    },

    // Time & Date Card - Elegant
    {
      id: 'time-date',
      className: 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
      content: (
        <div className="h-full flex flex-col justify-center text-white p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
          <div className="relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl inline-block mb-4 backdrop-blur-sm">
              <Clock className="h-8 w-8 mx-auto" />
            </div>
            <div className="text-4xl font-bold mb-2">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
            <div className="text-orange-100 text-sm font-medium">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      )
    },

    // Journal Card - Creative
    {
      id: 'journal',
      className: 'bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white text-xs px-3 py-1 backdrop-blur-sm">Write</Badge>
          </div>
          <div className="relative z-10">
            <div className="text-xl font-bold mb-1">Micro Journal</div>
            <div className="text-amber-100 text-sm">Capture your thoughts</div>
            <div className="text-xs text-amber-200 mt-1">Daily reflections</div>
          </div>
          <Button 
            onClick={() => onModuleClick('journal')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm relative z-10"
            variant="ghost"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Write Entry
          </Button>
        </div>
      )
    },

    // Mood Check-in - Enhanced
    {
      id: 'mood-checkin',
      className: 'col-span-2 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600',
      content: (
        <div className="h-full p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
          <div className="relative z-10">
            <MoodCheckIn onMoodUpdated={refreshData} />
          </div>
        </div>
      )
    },

    // Planner Card - Modern
    {
      id: 'planner',
      className: 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-6 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mb-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white text-xs px-3 py-1 backdrop-blur-sm">Plan</Badge>
          </div>
          <div className="relative z-10">
            <div className="text-xl font-bold mb-1">Daily Planner</div>
            <div className="text-indigo-100 text-sm">Organize your day</div>
            <div className="text-xs text-indigo-200 mt-1">Time blocking</div>
          </div>
          <Button 
            onClick={() => onModuleClick('planner')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm relative z-10"
            variant="ghost"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Plan Day
          </Button>
        </div>
      )
    },

    // Relationship Care - Warm
    {
      id: 'relationship',
      className: 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mt-8"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Heart className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span className="text-xs font-medium">AI</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-xl font-bold mb-1">Relationships</div>
            <div className="text-red-100 text-sm">AI-powered care</div>
            <div className="text-xs text-red-200 mt-1">Smart messages</div>
          </div>
          <Button 
            onClick={() => onModuleClick('relationship')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm relative z-10"
            variant="ghost"
          >
            <Heart className="h-4 w-4 mr-2" />
            Send Love
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[160px] sm:auto-rows-[180px]">
      {bentoItems.map((item) => (
        <Card
          key={item.id}
          className={`${item.className} ${item.className.includes('col-span') ? item.className : ''} border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer overflow-hidden group`}
          onClick={() => item.id.includes('-') ? onModuleClick(item.id.split('-')[0]) : onModuleClick(item.id)}
        >
          <CardContent className="p-0 h-full">
            {item.content}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BentoDashboard;
