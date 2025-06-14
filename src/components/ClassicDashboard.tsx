
import React, { useState, useEffect } from 'react';
import { Clock, Target, DollarSign, BookOpen, Calendar, Heart, CheckSquare, Timer, TrendingUp, Play, Pause, RotateCcw, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLiveUsers } from '@/hooks/useLiveUsers';
import { useAuth } from '@/hooks/useAuth';
import MoodCheckIn from './MoodCheckIn';

interface ClassicDashboardProps {
  onModuleClick: (module: string) => void;
}

const ClassicDashboard = ({ onModuleClick }: ClassicDashboardProps) => {
  const { user } = useAuth();
  const { data, refreshData } = useDashboardData();
  const { liveUsersCount, loading: liveUsersLoading } = useLiveUsers();
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

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Today's Tasks</CardTitle>
            <CheckSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{data?.tasksToday?.completed || 0}/{data?.tasksToday?.total || 0}</div>
            <p className="text-xs text-gray-600">
              {data?.tasksToday?.total ? Math.round((data.tasksToday.completed / data.tasksToday.total) * 100) : 0}% completed 🎯
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Focus Time</CardTitle>
            <Timer className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
            <p className="text-xs text-gray-600">Sessions today: {sessionCount} 🧘‍♀️</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Community</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {liveUsersLoading ? '...' : liveUsersCount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Friends online 👥</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Wellbeing</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {data?.moodScore || '7.5'}/10
            </div>
            <p className="text-xs text-gray-600">
              Feeling good! 😊
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Focus Timer */}
        <Card className="lg:col-span-2 border-2 border-indigo-100 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-800 text-xl">Focus Session</CardTitle>
                  <p className="text-sm text-gray-600">Stay concentrated and productive</p>
                </div>
              </div>
              {isActive && (
                <Badge variant={isPaused ? "secondary" : "default"} className={`${isPaused ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"} rounded-full px-3 py-1`}>
                  {isPaused ? '⏸️ Paused' : '▶️ Active'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
              <div className="text-7xl font-mono font-bold mb-6 text-gray-800">
                {formatTime(timeLeft)}
              </div>
              <div className="space-y-3">
                <Progress value={progress} className="h-3 rounded-full" />
                <p className="text-base text-gray-600">
                  {currentSession === 'focus' ? '🎯 Focus Time' : '☕ Break Time'} • Session #{sessionCount + 1}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              {!isActive ? (
                <Button onClick={startTimer} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-2xl text-lg shadow-lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Focus 🚀
                </Button>
              ) : (
                <>
                  <Button onClick={pauseTimer} variant="outline" className="border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100 rounded-2xl px-6 py-3">
                    <Pause className="h-4 w-4 mr-2" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={stopTimer} className="bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600 rounded-2xl px-6 py-3">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>

            <Button 
              onClick={() => onModuleClick('focus')} 
              variant="outline" 
              className="w-full border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-2xl py-3"
            >
              Advanced Focus Settings ⚙️
            </Button>
          </CardContent>
        </Card>

        {/* Mood Check-in */}
        <Card className="border-2 border-pink-100 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              How are you feeling?
            </CardTitle>
            <p className="text-sm text-gray-600 ml-13">Share your mood with us</p>
          </CardHeader>
          <CardContent>
            <MoodCheckIn onMoodUpdated={refreshData} />
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:scale-105" onClick={() => onModuleClick('tasks')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Organize your day beautifully</p>
            <Button variant="outline" size="sm" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl">
              Let's Get Things Done! ✅
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:scale-105" onClick={() => onModuleClick('expenses')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Track spending mindfully</p>
            <Button variant="outline" size="sm" className="w-full border-2 border-green-200 text-green-700 hover:bg-green-100 rounded-xl">
              Add Expense 💰
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl hover:scale-105" onClick={() => onModuleClick('journal')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Capture your thoughts safely</p>
            <Button variant="outline" size="sm" className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-100 rounded-xl">
              Write Something ✍️
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl hover:scale-105" onClick={() => onModuleClick('planner')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Planner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Plan your perfect day</p>
            <Button variant="outline" size="sm" className="w-full border-2 border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl">
              Plan Today 📅
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Relationship Care */}
      <Card className="border-2 border-rose-100 shadow-lg bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            Relationship Care
          </CardTitle>
          <p className="text-sm text-gray-600 ml-15">Nurture your connections</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-gray-700 mb-2">Stay close to the people you love</p>
              <p className="text-sm text-gray-600">AI-powered thoughtful messages</p>
            </div>
            <Button onClick={() => onModuleClick('relationship')} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 rounded-2xl px-6 py-3 shadow-lg">
              Send Love 💝
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassicDashboard;
