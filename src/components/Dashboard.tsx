import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import BentoDashboard from '@/components/BentoDashboard';
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

  if (activeView !== 'dashboard') {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Your intelligent life dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="transition-all hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-center bg-white/50 p-3 rounded-lg border">
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xl font-bold text-gray-700">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Dashboard */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Your Life at a Glance</h2>
            <div className="text-sm text-gray-500">
              Real-time updates • Auto-sync enabled
            </div>
          </div>
          
          <BentoDashboard onModuleClick={handleModuleClick} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
