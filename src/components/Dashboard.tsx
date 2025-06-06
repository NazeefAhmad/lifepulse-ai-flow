
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading, refreshData } = useDashboardData();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'expenses' | 'journal' | 'planner' | 'relationship' | 'calendar'>('dashboard');

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleModuleClick = (module: string) => {
    setActiveView(module as 'dashboard' | 'tasks' | 'expenses' | 'journal' | 'planner' | 'relationship' | 'calendar');
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Google Calendar Integration</h1>
        </div>
        <GoogleCalendarIntegration />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your life today</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Enhanced Top Section with Mood Check-in and Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-2">
              <MoodCheckIn onMoodUpdated={refreshData} />
            </div>
            <div className="lg:col-span-1">
              <CompactCalendarConnect onCalendarClick={handleCalendarClick} />
            </div>
            <div className="lg:col-span-1 flex items-center justify-center">
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">{new Date().getDate()}</div>
                <div className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
          </div>

          <QuickStats />
        </div>

        <ModuleGrid onModuleClick={handleModuleClick} />
        <QuickActions onDataUpdated={refreshData} />
      </div>
    </div>
  );
};

export default Dashboard;
