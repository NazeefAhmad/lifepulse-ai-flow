
import React from 'react';
import { Check, Clock, Heart, TrendingUp, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboardData';

const QuickStats = () => {
  const { data, loading, refreshData } = useDashboardData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const tasksProgress = data.tasksToday.total > 0 ? (data.tasksToday.completed / data.tasksToday.total) * 100 : 0;
  const focusProgress = Math.min((data.focusTime / 8) * 100, 100); // 8 hours target
  const moodProgress = (data.moodScore / 10) * 100;
  const spendProgress = Math.min((data.todaysSpend / 1000) * 100, 100); // ₹1000 budget

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Today's Overview</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-3 w-3" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-green-600 font-medium">Tasks Today</p>
                <p className="text-3xl font-bold text-green-800">
                  {data.tasksToday.completed}/{data.tasksToday.total}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Check className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <Progress value={tasksProgress} className="h-2 mb-2" />
            <p className="text-xs text-green-600">
              {tasksProgress.toFixed(0)}% completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-blue-600 font-medium">Focus Time</p>
                <p className="text-3xl font-bold text-blue-800">{data.focusTime}h</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <Progress value={focusProgress} className="h-2 mb-2" />
            <p className="text-xs text-blue-600">
              Target: 8h daily
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-purple-600 font-medium">Mood Score</p>
                <p className="text-3xl font-bold text-purple-800">{data.moodScore}/10</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Heart className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <Progress value={moodProgress} className="h-2 mb-2" />
            <p className="text-xs text-purple-600">
              Based on recent check-ins
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-orange-600 font-medium">Today's Spend</p>
                <p className="text-3xl font-bold text-orange-800">₹{data.todaysSpend}</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-700" />
              </div>
            </div>
            <Progress value={spendProgress} className="h-2 mb-2" />
            <p className="text-xs text-orange-600">
              Budget: ₹1000 daily
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickStats;
