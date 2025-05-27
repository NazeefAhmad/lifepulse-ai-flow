
import React, { useState } from 'react';
import { Plus, Brain, Heart, BookOpen, DollarSign, Bell, Check, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import TaskManager from '@/components/TaskManager';
import DailyPlanner from '@/components/DailyPlanner';
import MicroJournal from '@/components/MicroJournal';
import ExpenseLogger from '@/components/ExpenseLogger';
import RelationshipCare from '@/components/RelationshipCare';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <p>Loading...</p>
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
        return <Dashboard setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveModule()}
      </main>
    </div>
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
