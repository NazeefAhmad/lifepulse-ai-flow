
import React from 'react';
import { CheckSquare, DollarSign, BookOpen, Calendar, Heart, Timer, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModuleGridProps {
  onModuleClick: (module: string) => void;
}

const ModuleGrid = ({ onModuleClick }: ModuleGridProps) => {
  const isMobile = useIsMobile();

  const modules = [
    {
      id: 'focus',
      title: 'Focus Mode',
      description: 'Pomodoro timer with analytics & insights',
      icon: Timer,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      badge: 'Enhanced',
      badgeColor: 'bg-purple-600'
    },
    {
      id: 'tasks',
      title: 'Smart Tasks',
      description: 'AI-powered task management with assignments',
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      badge: 'Popular',
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'expenses',
      title: 'Smart Expenses',
      description: 'Track spending with intelligent categorization',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      badge: 'Auto-Sort',
      badgeColor: 'bg-green-600'
    },
    {
      id: 'journal',
      title: 'Micro Journal',
      description: 'Quick thoughts and daily reflections',
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      badge: 'Daily',
      badgeColor: 'bg-orange-600'
    },
    {
      id: 'planner',
      title: 'Daily Planner',
      description: 'Organize your day with time blocks',
      icon: Calendar,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100',
      borderColor: 'border-pink-200',
      badge: 'Scheduler',
      badgeColor: 'bg-pink-600'
    },
    {
      id: 'relationship',
      title: 'Relationship Care',
      description: 'Strengthen bonds with AI-generated messages',
      icon: Heart,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
      badge: 'AI-Powered',
      badgeColor: 'bg-red-600'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Your Life Modules
        </h2>
        <p className="text-gray-600 text-sm sm:text-lg">Choose what you want to work on today</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {modules.map((module) => (
          <Card
            key={module.id}
            className={`group relative transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${module.bgColor} ${module.borderColor} border-2 shadow-lg overflow-hidden`}
            onClick={() => onModuleClick(module.id)}
          >
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              <Badge className={`text-white text-xs ${module.badgeColor}`}>
                {module.badge}
              </Badge>
            </div>
            
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <module.icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700" />
                </div>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-yellow-500 transition-colors duration-300" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                {module.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                {isMobile ? module.description.split(' ').slice(0, 6).join(' ') + '...' : module.description}
              </p>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:via-white/60 transition-all duration-300"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModuleGrid;
