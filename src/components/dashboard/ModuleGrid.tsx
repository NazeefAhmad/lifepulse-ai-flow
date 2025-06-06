import React from 'react';
import { CheckSquare, DollarSign, BookOpen, Calendar, Heart, TrendingUp, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ModuleGridProps {
  onModuleClick: (module: string) => void;
}

const ModuleGrid = ({ onModuleClick }: ModuleGridProps) => {
  const modules = [
    {
      id: 'tasks',
      title: 'Smart Tasks',
      description: 'AI-powered task management with assignment capabilities',
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'focus',
      title: 'Focus Mode',
      description: 'Pomodoro timer with productivity tracking',
      icon: Timer,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'expenses',
      title: 'Smart Expenses',
      description: 'Track spending with intelligent categorization',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      description: 'Visual reports and productivity analytics',
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'journal',
      title: 'Micro Journal',
      description: 'Quick thoughts and daily reflections',
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'planner',
      title: 'Daily Planner',
      description: 'Organize your day with time blocks',
      icon: Calendar,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'relationship',
      title: 'Relationship Care',
      description: 'Strengthen bonds with AI-generated messages',
      icon: Heart,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {modules.map((module) => (
        <Card
          key={module.id}
          className={`transition-all transform hover:scale-105 cursor-pointer ${module.bgColor} ${module.borderColor} border-2 shadow-md`}
          onClick={() => onModuleClick(module.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`text-4xl font-bold bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                <module.icon className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{module.title}</h3>
            <p className="text-gray-600">{module.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModuleGrid;
