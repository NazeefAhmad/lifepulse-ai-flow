
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PomodoroProvider } from '@/contexts/PomodoroContext';
import TaskManager from '@/components/TaskManager';
import DailyPlannerManager from '@/components/DailyPlannerManager';
import MicroJournal from '@/components/MicroJournal';
import ExpenseLogger from '@/components/ExpenseLogger';
import RelationshipCare from '@/components/RelationshipCare';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import NotionSidebar from '@/components/NotionSidebar';
import FloatingPomodoroWidget from '@/components/FloatingPomodoroWidget';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'tasks':
        return <TaskManager onBack={() => setActiveModule('dashboard')} />;
      case 'planner':
        return <DailyPlannerManager onBack={() => setActiveModule('dashboard')} />;
      case 'journal':
        return <MicroJournal onBack={() => setActiveModule('dashboard')} />;
      case 'expenses':
        return <ExpenseLogger onBack={() => setActiveModule('dashboard')} />;
      case 'relationship':
        return <RelationshipCare onBack={() => setActiveModule('dashboard')} />;
      default:
        return <Dashboard onModuleClick={setActiveModule} />;
    }
  };

  return (
    <PomodoroProvider>
      <div className="flex h-screen bg-white">
        <NotionSidebar 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-12' : 'ml-60'}`}>
          <div className="flex-1 overflow-auto">
            {renderActiveModule()}
          </div>
        </main>

        <FloatingPomodoroWidget />
      </div>
    </PomodoroProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
