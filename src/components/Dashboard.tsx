
import React from 'react';
import { Plus, Brain, Heart, BookOpen, DollarSign, Bell, Check, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import QuickStats from '@/components/dashboard/QuickStats';
import ModuleGrid from '@/components/dashboard/ModuleGrid';
import AIInsights from '@/components/dashboard/AIInsights';

interface DashboardProps {
  setActiveModule: (module: string) => void;
}

const Dashboard = ({ setActiveModule }: DashboardProps) => {
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good morning! Ready to sync your life? ✨</h1>
        <p className="text-blue-100">{currentDate}</p>
      </div>

      <QuickStats />
      <ModuleGrid setActiveModule={setActiveModule} />
      <AIInsights />
    </div>
  );
};

export default Dashboard;
