
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PomodoroProvider } from '@/contexts/PomodoroContext';
import TaskManager from '@/components/TaskManager';
import DailyPlanner from '@/components/DailyPlanner';
import MicroJournal from '@/components/MicroJournal';
import ExpenseLogger from '@/components/ExpenseLogger';
import RelationshipCare from '@/components/RelationshipCare';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';
import FloatingPomodoroWidget from '@/components/FloatingPomodoroWidget';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm animate-pulse">
            <span className="text-white font-bold text-xl">✨</span>
          </div>
          <p className="text-slate-700 text-lg">Getting things ready for you...</p>
          <p className="text-slate-500 text-sm mt-2">Just a moment! 😊</p>
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
        return <DailyPlanner onBack={() => setActiveModule('dashboard')} />;
      case 'journal':
        return <MicroJournal onBack={() => setActiveModule('dashboard')} />;
      case 'expenses':
        return <ExpenseLogger onBack={() => setActiveModule('dashboard')} />;
      case 'relationship':
        return <RelationshipCare onBack={() => setActiveModule('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <PomodoroProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <Navigation 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveModule()}
        </main>

        {/* Floating Pomodoro Widget */}
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
