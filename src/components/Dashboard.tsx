
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import QuickStats from '@/components/dashboard/QuickStats';
import ModuleGrid from '@/components/dashboard/ModuleGrid';
import QuickActions from '@/components/dashboard/QuickActions';
import MoodCheckIn from '@/components/MoodCheckIn';
import CompactCalendarConnect from '@/components/CompactCalendarConnect';
import TaskManager from './TaskManager';
import ExpenseLogger from './ExpenseLogger';
import MicroJournal from './MicroJournal';
import GoogleCalendarIntegration from './GoogleCalendarIntegration';
import DailyPlannerManager from './DailyPlannerManager';
import RelationshipCare from './RelationshipCare';
import FocusMode from './FocusMode';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading, refreshData } = useDashboardData();
  const isMobile = useIsMobile();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'expenses' | 'journal' | 'planner' | 'relationship' | 'calendar' | 'focus'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshData();
  }, [user]);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleModuleClick = (module: string) => {
    setActiveView(module as 'dashboard' | 'tasks' | 'expenses' | 'journal' | 'planner' | 'relationship' | 'calendar' | 'focus');
  };

  const handleCalendarClick = () => {
    setActiveView('calendar');
  };

  if (activeView === 'tasks') {
    return <TaskManager onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'expenses') {
    return <ExpenseLogger onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'journal') {
    return <MicroJournal onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'planner') {
    return <DailyPlannerManager onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'relationship') {
    return <RelationshipCare onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'calendar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setActiveView('dashboard')} size={isMobile ? "sm" : "default"}>
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isMobile ? 'Calendar' : 'Google Calendar Integration'}
            </h1>
          </div>
          <GoogleCalendarIntegration />
        </div>
      </div>
    );
  }

  if (activeView === 'focus') {
    return <FocusMode onBack={() => setActiveView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Enhanced Responsive Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-lg">L</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
                </h1>
                <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-base hidden sm:block">Here's your life dashboard for today</p>
                <p className="text-gray-600 mt-0.5 text-xs sm:hidden">Your dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Button
                variant="outline"
                size={isMobile ? "sm" : "sm"}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="transition-all hover:scale-105"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <div className="text-right bg-white/50 p-2 sm:p-3 rounded-lg border">
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-500 sm:hidden">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm sm:text-xl font-bold text-gray-700">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Responsive Quick Access Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="lg:col-span-3">
              <MoodCheckIn onMoodUpdated={refreshData} />
            </div>
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <CompactCalendarConnect onCalendarClick={handleCalendarClick} />
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{new Date().getDate()}</div>
                <div className="text-xs sm:text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                <div className="mt-1 sm:mt-2 text-xs text-gray-400">Today</div>
              </div>
            </div>
          </div>

          <QuickStats />
        </div>

        <div className="space-y-6 sm:space-y-8">
          <ModuleGrid onModuleClick={handleModuleClick} />
          <QuickActions onDataUpdated={refreshData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
