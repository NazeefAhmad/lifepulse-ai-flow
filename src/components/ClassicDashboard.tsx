
import React, { useState, useEffect } from 'react';
import { Clock, Target, DollarSign, BookOpen, Calendar, Heart, CheckSquare, Timer, TrendingUp, Play, Pause, RotateCcw, Users, ArrowRight } from 'lucide-react';
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
      {/* Quick Stats - Notion style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 hover:shadow-sm transition-shadow bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Today</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {data?.tasksToday?.completed || 0}/{data?.tasksToday?.total || 0}
                </p>
              </div>
              <CheckSquare className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-sm transition-shadow bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Time</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                </p>
              </div>
              <Timer className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-sm transition-shadow bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Community</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {liveUsersLoading ? '...' : liveUsersCount.toLocaleString()}
                </p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-sm transition-shadow bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wellbeing</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {data?.moodScore || '7.5'}/10
                </p>
              </div>
              <Heart className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Timer - Notion style */}
        <Card className="lg:col-span-2 border border-gray-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Timer className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg font-semibold">Focus Session</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Stay concentrated and productive</p>
                </div>
              </div>
              {isActive && (
                <Badge variant={isPaused ? "secondary" : "default"} className="bg-gray-100 text-gray-700 border-gray-200">
                  {isPaused ? 'Paused' : 'Active'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-semibold mb-4 text-gray-900">
                {formatTime(timeLeft)}
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-600">
                  {currentSession === 'focus' ? 'Focus Time' : 'Break Time'} • Session #{sessionCount + 1}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              {!isActive ? (
                <Button onClick={startTimer} className="bg-gray-900 text-white hover:bg-gray-800">
                  <Play className="h-4 w-4 mr-2" />
                  Start Focus
                </Button>
              ) : (
                <>
                  <Button onClick={pauseTimer} variant="outline" className="border-gray-300">
                    <Pause className="h-4 w-4 mr-2" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={stopTimer} variant="outline" className="border-gray-300 text-red-600 hover:text-red-700">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mood Check-in */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-lg font-semibold">How are you feeling?</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Share your mood</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MoodCheckIn onMoodUpdated={refreshData} />
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid - Notion Database style */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'tasks', title: 'Tasks', icon: CheckSquare, desc: 'Organize your to-dos' },
            { id: 'expenses', title: 'Expenses', icon: DollarSign, desc: 'Track your spending' },
            { id: 'journal', title: 'Journal', icon: BookOpen, desc: 'Capture your thoughts' },
            { id: 'planner', title: 'Daily Planner', icon: Calendar, desc: 'Plan your perfect day' },
            { id: 'relationship', title: 'Relationships', icon: Heart, desc: 'Nurture connections' },
          ].map((module) => (
            <Card 
              key={module.id}
              className="border border-gray-200 hover:shadow-sm transition-all cursor-pointer bg-white group"
              onClick={() => onModuleClick(module.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <module.icon className="h-4 w-4 text-gray-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-500">{module.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassicDashboard;
