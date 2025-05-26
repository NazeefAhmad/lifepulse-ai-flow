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

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
        return <TaskManager />;
      case 'planner':
        return <DailyPlanner />;
      case 'journal':
        return <MicroJournal />;
      case 'expenses':
        return <ExpenseLogger />;
      case 'relationship':
        return <RelationshipCare />;
      default:
        return <Dashboard />;
    }
  };

  const Dashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good morning! Ready to sync your life? ✨</h1>
        <p className="text-blue-100">{currentDate}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Tasks Today</p>
                <p className="text-2xl font-bold text-green-800">6/8</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Focus Time</p>
                <p className="text-2xl font-bold text-blue-800">4.2h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={60} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Mood Score</p>
                <p className="text-2xl font-bold text-purple-800">8.5/10</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Today's Spend</p>
                <p className="text-2xl font-bold text-orange-800">₹340</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={40} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          icon={<Check className="h-6 w-6" />}
          title="Smart Task Manager"
          description="AI-prioritized tasks for maximum productivity"
          color="green"
          onClick={() => setActiveModule('tasks')}
          status="3 urgent tasks"
        />
        
        <ModuleCard
          icon={<Brain className="h-6 w-6" />}
          title="Daily Planner"
          description="AI-optimized schedule for your day"
          color="blue"
          onClick={() => setActiveModule('planner')}
          status="Next: Team Meeting at 2 PM"
        />
        
        <ModuleCard
          icon={<Heart className="h-6 w-6" />}
          title="Relationship Care"
          description="Nurture your relationships with AI insights"
          color="pink"
          onClick={() => setActiveModule('relationship')}
          status="Send a sweet message today"
        />
        
        <ModuleCard
          icon={<BookOpen className="h-6 w-6" />}
          title="Micro Journal"
          description="Quick daily reflections with AI summaries"
          color="purple"
          onClick={() => setActiveModule('journal')}
          status="Today's mood: Great!"
        />
        
        <ModuleCard
          icon={<DollarSign className="h-6 w-6" />}
          title="Expense Logger"
          description="Track spending with smart categorization"
          color="orange"
          onClick={() => setActiveModule('expenses')}
          status="₹340 spent today"
        />
        
        <ModuleCard
          icon={<Bell className="h-6 w-6" />}
          title="Smart Reminders"
          description="Never miss what matters most"
          color="indigo"
          onClick={() => {}}
          status="2 reminders set"
        />
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Brain className="h-5 w-5" />
            Today's AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-800">Great productivity momentum!</p>
                <p className="text-sm text-gray-600">You've completed 75% of your tasks. Consider tackling that important presentation next.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-800">Schedule optimization</p>
                <p className="text-sm text-gray-600">Your most productive hours are 10 AM - 12 PM. Block this time for deep work tomorrow.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ModuleCard = ({ icon, title, description, color, onClick, status }) => {
    const colorMap = {
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    };

    return (
      <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1" onClick={onClick}>
        <CardHeader className="pb-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white mb-3`}>
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LifeSync AI
              </h1>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveModule('dashboard')}
              className={activeModule === 'dashboard' ? 'bg-blue-50 border-blue-200' : ''}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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
