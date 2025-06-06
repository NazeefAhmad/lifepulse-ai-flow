
import React from 'react';
import { CheckSquare, DollarSign, BookOpen, Calendar, Heart, Brain, Zap, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModuleGridProps {
  onModuleClick: (module: string) => void;
}

const ModuleGrid = ({ onModuleClick }: ModuleGridProps) => {
  const modules = [
    {
      id: 'tasks',
      title: 'Task Manager',
      description: 'Organize and track your daily tasks',
      icon: CheckSquare,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      features: ['Smart Priorities', 'Due Dates', 'Progress Tracking']
    },
    {
      id: 'expenses',
      title: 'Expense Logger',
      description: 'Track your spending and budget',
      icon: DollarSign,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'from-orange-50 to-amber-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      features: ['Category Tracking', 'Budget Alerts', 'Spending Insights']
    },
    {
      id: 'journal',
      title: 'Micro Journal',
      description: 'Reflect on your day and thoughts',
      icon: BookOpen,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      features: ['Daily Reflections', 'Mood Tracking', 'Gratitude Practice']
    },
    {
      id: 'planner',
      title: 'Daily Planner',
      description: 'Plan and schedule your day',
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      features: ['Time Blocking', 'Schedule Sync', 'Goal Setting']
    },
    {
      id: 'relationship',
      title: 'Relationship Care',
      description: 'Nurture your relationships',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-50',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-200',
      features: ['Sweet Messages', 'Mood Sharing', 'Care Reminders']
    },
    {
      id: 'ai-insights',
      title: 'AI Insights',
      description: 'Get personalized insights and suggestions',
      icon: Brain,
      color: 'from-cyan-500 to-teal-600',
      bgColor: 'from-cyan-50 to-teal-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      features: ['Smart Analysis', 'Recommendations', 'Pattern Recognition'],
      comingSoon: true
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Life Modules</h2>
        <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
          <Zap className="h-3 w-3 mr-1" />
          Powered by AI
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon;
          
          return (
            <Card 
              key={module.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br ${module.bgColor} ${module.borderColor} border-2 group ${module.comingSoon ? 'opacity-75' : ''}`}
              onClick={() => !module.comingSoon && onModuleClick(module.id)}
            >
              <CardContent className="p-6">
                {module.comingSoon && (
                  <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Coming Soon
                  </Badge>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${module.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <Target className={`h-5 w-5 ${module.textColor} opacity-60`} />
                </div>
                
                <h3 className={`text-xl font-bold ${module.textColor} mb-2 group-hover:text-opacity-80 transition-colors`}>
                  {module.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {module.description}
                </p>
                
                <div className="space-y-2">
                  {module.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${module.color}`}></div>
                      <span className="text-xs text-gray-600 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${module.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleGrid;
