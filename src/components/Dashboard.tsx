
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuickStats from '@/components/dashboard/QuickStats';
import ModuleGrid from '@/components/dashboard/ModuleGrid';
import AIInsights from '@/components/dashboard/AIInsights';
import QuickActions from '@/components/dashboard/QuickActions';
import GoogleCalendarIntegration from '@/components/GoogleCalendarIntegration';

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
      
      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleCalendarIntegration />
        </CardContent>
      </Card>

      <ModuleGrid setActiveModule={setActiveModule} />
      <AIInsights />
      
      {/* Quick Actions Floating Button */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
