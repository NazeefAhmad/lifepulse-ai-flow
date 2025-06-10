
import React, { useState, useEffect } from 'react';
import { Clock, Target, DollarSign, BookOpen, Calendar, Heart, CheckSquare, Timer, TrendingUp, Zap, Coffee } from 'lucide-react';
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
    timeLeft,
    currentSession,
    sessionCount,
    totalFocusTime,
    formatTime,
    progress,
    startTimer
  } = usePomodoroContext();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bentoItems = [
    // Large focus timer card
    {
      id: 'focus-timer',
      className: 'col-span-2 row-span-2 bg-gradient-to-br from-purple-500 to-purple-700',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="h-6 w-6" />
            <span className="text-lg font-semibold">Focus Mode</span>
            {isActive && <Badge variant="secondary" className="animate-pulse bg-white/20 text-white">Active</Badge>}
          </div>
          
          <div className="text-center flex-1 flex flex-col justify-center">
            <div className="text-5xl font-mono font-bold mb-4">
              {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="h-3 mb-4 bg-white/20" />
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {currentSession === 'focus' ? 'Focus Session' : 'Break Time'}
              </Badge>
              {currentSession === 'break' && <Coffee className="h-4 w-4 text-orange-300" />}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Today's Focus</span>
              <span className="font-semibold">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Sessions</span>
              <span className="font-semibold">{sessionCount}</span>
            </div>
            <Button 
              onClick={() => onModuleClick('focus')} 
              className="w-full bg-white/20 hover:bg-white/30 border-white/30"
              variant="outline"
            >
              Open Focus Mode
            </Button>
          </div>
        </div>
      )
    },

    // Quick stats cards
    {
      id: 'tasks-today',
      className: 'bg-gradient-to-br from-blue-500 to-blue-600',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-4">
          <div className="flex items-center justify-between">
            <CheckSquare className="h-6 w-6" />
            <Badge className="bg-white/20 text-white text-xs">{data?.tasksToday?.total - data?.tasksToday?.completed || 0}</Badge>
          </div>
          <div>
            <div className="text-2xl font-bold">{data?.tasksToday?.completed || 0}</div>
            <div className="text-sm opacity-90">Tasks Done</div>
          </div>
          <Button 
            onClick={() => onModuleClick('tasks')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white"
            variant="ghost"
          >
            View Tasks
          </Button>
        </div>
      )
    },

    {
      id: 'expenses-today',
      className: 'bg-gradient-to-br from-green-500 to-green-600',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="h-6 w-6" />
            <Badge className="bg-white/20 text-white text-xs">Today</Badge>
          </div>
          <div>
            <div className="text-2xl font-bold">${data?.todaysSpend || 0}</div>
            <div className="text-sm opacity-90">Spent Today</div>
          </div>
          <Button 
            onClick={() => onModuleClick('expenses')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white"
            variant="ghost"
          >
            Track Expense
          </Button>
        </div>
      )
    },

    // Time and date card
    {
      id: 'time-date',
      className: 'bg-gradient-to-br from-orange-500 to-red-500',
      content: (
        <div className="h-full flex flex-col justify-center text-white p-4 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
          <div className="text-sm opacity-90">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      )
    },

    // Journal card
    {
      id: 'journal',
      className: 'bg-gradient-to-br from-amber-500 to-orange-500',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-4">
          <div className="flex items-center justify-between">
            <BookOpen className="h-6 w-6" />
            <Badge className="bg-white/20 text-white text-xs">Write</Badge>
          </div>
          <div>
            <div className="text-lg font-semibold">Micro Journal</div>
            <div className="text-sm opacity-90">Capture thoughts</div>
          </div>
          <Button 
            onClick={() => onModuleClick('journal')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white"
            variant="ghost"
          >
            Write Entry
          </Button>
        </div>
      )
    },

    // Mood check-in (spans 2 columns)
    {
      id: 'mood-checkin',
      className: 'col-span-2 bg-gradient-to-br from-pink-500 to-purple-500',
      content: (
        <div className="h-full p-4">
          <MoodCheckIn onMoodUpdated={refreshData} />
        </div>
      )
    },

    // Calendar/Planner
    {
      id: 'planner',
      className: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-4">
          <div className="flex items-center justify-between">
            <Calendar className="h-6 w-6" />
            <Badge className="bg-white/20 text-white text-xs">Today</Badge>
          </div>
          <div>
            <div className="text-lg font-semibold">Daily Planner</div>
            <div className="text-sm opacity-90">Organize your day</div>
          </div>
          <Button 
            onClick={() => onModuleClick('planner')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white"
            variant="ghost"
          >
            Plan Day
          </Button>
        </div>
      )
    },

    // Relationship care
    {
      id: 'relationship',
      className: 'bg-gradient-to-br from-red-500 to-pink-500',
      content: (
        <div className="h-full flex flex-col justify-between text-white p-4">
          <div className="flex items-center justify-between">
            <Heart className="h-6 w-6" />
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-semibold">Relationships</div>
            <div className="text-sm opacity-90">AI-powered care</div>
          </div>
          <Button 
            onClick={() => onModuleClick('relationship')} 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white"
            variant="ghost"
          >
            Send Message
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px] sm:auto-rows-[140px]">
      {bentoItems.map((item) => (
        <Card
          key={item.id}
          className={`${item.className} ${item.className.includes('col-span') ? item.className : ''} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden`}
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
