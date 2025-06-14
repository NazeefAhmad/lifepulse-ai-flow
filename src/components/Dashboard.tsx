import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Plus } from 'lucide-react';
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

interface DashboardProps {
  onModuleClick: (module: string) => void;
}

const Dashboard = ({ onModuleClick }: DashboardProps) => {
  const { user } = useAuth();
  const { data, loading, refreshData } = useDashboardData();
  const isMobile = useIsMobile();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'expenses' | 'journal' | 'planner' | 'relationship' | 'calendar' | 'focus'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshData();
  }, [user]);

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
    onModuleClick(module);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveView('dashboard')} 
                size={isMobile ? "sm" : "default"} 
                className="border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-800 rounded-xl shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-3xl font-bold text-slate-800">
                {isMobile ? 'Calendar' : 'Your Calendar Connection'}
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
    <div className="h-full bg-white">
      {/* Notion-style Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user?.email?.split('@')[0] || 'Friend'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationSystem />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-600 hover:bg-gray-100"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <ClassicDashboard onModuleClick={handleModuleClick} />
      </div>
      
      <ForceUpdater />
    </div>
  );
};

export default Dashboard;
