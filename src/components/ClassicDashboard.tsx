
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
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Today</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.tasksToday?.completed || 0}/{data?.tasksToday?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.tasksToday?.total ? Math.round((data.tasksToday.completed / data.tasksToday.total) * 100) : 0}% completed
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Focus Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
            <p className="text-xs text-muted-foreground">Today's sessions: {sessionCount}</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {liveUsersLoading ? '...' : liveUsersCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Online now</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mood Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.moodScore || '7.5'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Recent average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Focus Timer */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="h-6 w-6" />
                <div>
                  <CardTitle>Focus Timer</CardTitle>
                  <p className="text-sm text-muted-foreground">Pomodoro technique</p>
                </div>
              </div>
              {isActive && (
                <Badge variant={isPaused ? "secondary" : "default"}>
                  {isPaused ? 'Paused' : 'Active'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold mb-4">
                {formatTime(timeLeft)}
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {currentSession === 'focus' ? 'Focus Session' : 'Break Time'} #{sessionCount + 1}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              {!isActive ? (
                <Button onClick={startTimer} className="px-8">
                  <Play className="h-4 w-4 mr-2" />
                  Start Focus
                </Button>
              ) : (
                <>
                  <Button onClick={pauseTimer} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={stopTimer} variant="destructive">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>

            <Button 
              onClick={() => onModuleClick('focus')} 
              variant="outline" 
              className="w-full"
            >
              Advanced Focus Settings
            </Button>
          </CardContent>
        </Card>

        {/* Mood Check-in */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mood Check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodCheckIn onMoodUpdated={refreshData} />
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onModuleClick('tasks')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage your daily tasks and projects</p>
            <Button variant="outline" size="sm" className="w-full">
              Open Tasks
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onModuleClick('expenses')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Expenses
            </Title>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Track your daily expenses</p>
            <Button variant="outline" size="sm" className="w-full">
              Add Expense
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onModuleClick('journal')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Write your thoughts and reflections</p>
            <Button variant="outline" size="sm" className="w-full">
              New Entry
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onModuleClick('planner')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Planner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Plan your day and schedule</p>
            <Button variant="outline" size="sm" className="w-full">
              Open Planner
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Relationship Care */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Relationship Care
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stay connected with your loved ones</p>
              <p className="text-xs text-muted-foreground mt-1">AI-powered message suggestions</p>
            </div>
            <Button onClick={() => onModuleClick('relationship')} variant="outline">
              Send Love
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassicDashboard;
