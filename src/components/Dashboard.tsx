
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuickStats from '@/components/dashboard/QuickStats';
import ModuleGrid from '@/components/dashboard/ModuleGrid';
import AIInsights from '@/components/dashboard/AIInsights';
import QuickActions from '@/components/dashboard/QuickActions';
import GoogleCalendarIntegration from '@/components/GoogleCalendarIntegration';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardProps {
  setActiveModule: (module: string) => void;
}

const Dashboard = ({ setActiveModule }: DashboardProps) => {
  const { refreshData } = useDashboardData();
  
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! ☀️";
    if (hour < 17) return "Good afternoon! 🌤️";
    return "Good evening! 🌙";
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{getGreeting()}</h1>
              <p className="text-blue-100 text-lg">Ready to sync your life and boost productivity?</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{currentTime}</p>
              <p className="text-blue-100">{currentDate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">✨ All systems connected</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🚀 Ready to achieve goals</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Quick Stats with better spacing */}
      <QuickStats />
      
      {/* Google Calendar Integration with improved design */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl">
            📅 Calendar Integration Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <GoogleCalendarIntegration />
        </CardContent>
      </Card>

      {/* Module Grid with better spacing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🎯 Life Management Modules
        </h2>
        <ModuleGrid setActiveModule={setActiveModule} />
      </div>

      {/* AI Insights */}
      <AIInsights />
      
      {/* Enhanced Quick Actions */}
      <QuickActions onDataUpdated={refreshData} />
    </div>
  );
};

export default Dashboard;
