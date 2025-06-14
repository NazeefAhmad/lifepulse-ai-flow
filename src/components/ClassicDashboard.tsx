import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  DollarSign, 
  BookOpen, 
  Calendar, 
  Heart, 
  Users, 
  Target, 
  Clock,
  Smile,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLiveUsers } from '@/hooks/useLiveUsers';
import { useDashboardData } from '@/hooks/useDashboardData';

interface ClassicDashboardProps {
  onModuleClick: (module: string) => void;
}

const ClassicDashboard = ({ onModuleClick }: ClassicDashboardProps) => {
  const { liveUsers } = useLiveUsers();
  const { data } = useDashboardData();

  const statsOverview = [
    {
      label: 'Live Users',
      value: liveUsers,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Tasks Completed',
      value: data?.taskStats?.completed || 0,
      icon: CheckSquare,
      color: 'text-green-500',
    },
    {
      label: 'Expenses This Month',
      value: `$${data?.totalExpenses || 0}`,
      icon: DollarSign,
      color: 'text-yellow-500',
    },
    {
      label: 'Journal Entries',
      value: data?.journalEntries || 0,
      icon: BookOpen,
      color: 'text-indigo-500',
    },
  ];

  const modules = [
    {
      icon: CheckSquare,
      title: 'Task Manager',
      description: 'Organize and track your daily tasks',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      onClick: () => onModuleClick('tasks'),
      stats: `${data?.taskStats?.total || 0} tasks`
    },
    {
      icon: Calendar,
      title: 'Simple Daily Planner',
      description: 'Plan your day with events and meetings',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      onClick: () => onModuleClick('planner'),
      stats: 'Today\'s schedule'
    },
    {
      icon: CalendarDays,
      title: 'Advanced Planner',
      description: 'Smart bulk event creation with Google sync',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      onClick: () => onModuleClick('planner-advanced'),
      stats: 'AI-powered'
    },
    {
      icon: DollarSign,
      title: 'Expense Logger',
      description: 'Track your spending and budgets',
      color: 'from-yellow-500 to-yellow-600',
      borderColor: 'border-yellow-200',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      onClick: () => onModuleClick('expenses'),
      stats: `$${data?.totalExpenses || 0} this month`
    },
    {
      icon: BookOpen,
      title: 'Micro Journal',
      description: 'Quick thoughts and daily reflections',
      color: 'from-indigo-500 to-indigo-600',
      borderColor: 'border-indigo-200',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      onClick: () => onModuleClick('journal'),
      stats: `${data?.journalEntries || 0} entries`
    },
    {
      icon: Heart,
      title: 'Relationship Care',
      description: 'Nurture your relationships with reminders',
      color: 'from-pink-500 to-pink-600',
      borderColor: 'border-pink-200',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      onClick: () => onModuleClick('relationship'),
      stats: `${data?.relationshipReminders || 0} reminders`
    }
  ];

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Stats Overview */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statsOverview.map((stat, index) => (
          <Card key={index} className="bg-white border-black shadow-sm">
            <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <div className="text-2xl font-semibold text-black">{stat.value}</div>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules */}
      {modules.map((module, index) => (
        <Card 
          key={index} 
          className={`bg-white border-black shadow-sm hover:shadow-md transition-shadow border-l-4 ${module.borderColor} cursor-pointer`}
          onClick={module.onClick}
        >
          <CardContent className="p-6 space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-black">{module.title}</h3>
                <p className="text-sm text-gray-500">{module.description}</p>
              </div>
              <module.icon className={`h-8 w-8 ${module.iconColor}`} />
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">{module.stats}</Badge>
              <ArrowRight className="h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClassicDashboard;
