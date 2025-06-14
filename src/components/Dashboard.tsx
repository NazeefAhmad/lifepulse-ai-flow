
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import ClassicDashboard from '@/components/ClassicDashboard';
import TaskManager from './TaskManager';
import ExpenseLogger from './ExpenseLogger';
import MicroJournal from './MicroJournal';
import GoogleCalendarIntegration from './GoogleCalendarIntegration';
import DailyPlannerManager from './DailyPlannerManager';
import RelationshipCare from './RelationshipCare';
import FocusMode from './FocusMode';
import NotificationSystem from './NotificationSystem';
import ForceUpdater from './ForceUpdater';
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
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setActiveView('dashboard')} size={isMobile ? "sm" : "default"} className="border-black text-black hover:bg-black hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-3xl font-bold text-black">
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 p-6 bg-white rounded-lg border border-black shadow-sm">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-black">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Your personal dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <NotificationSystem />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-center bg-gray-100 p-3 rounded-lg border border-black">
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xl font-bold text-black">
                  Mood Score: {data?.moodScore || '7.5'}/10
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <ClassicDashboard onModuleClick={handleModuleClick} />
      </div>
      
      {/* Force Updater - only shows when update is available */}
      <ForceUpdater />
    </div>
  );
};

export default Dashboard;
