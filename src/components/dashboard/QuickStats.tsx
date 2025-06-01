
import React from 'react';
import { Check, Clock, Heart, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboardData } from '@/hooks/useDashboardData';

const QuickStats = () => {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const tasksProgress = data.tasksToday.total > 0 ? (data.tasksToday.completed / data.tasksToday.total) * 100 : 0;
  const focusProgress = Math.min((data.focusTime / 8) * 100, 100); // Assuming 8 hours is target
  const moodProgress = (data.moodScore / 10) * 100;
  const spendProgress = Math.min((data.todaysSpend / 1000) * 100, 100); // Assuming ₹1000 is budget

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Tasks Today</p>
              <p className="text-2xl font-bold text-green-800">
                {data.tasksToday.completed}/{data.tasksToday.total}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <Progress value={tasksProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Focus Time</p>
              <p className="text-2xl font-bold text-blue-800">{data.focusTime}h</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <Progress value={focusProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Mood Score</p>
              <p className="text-2xl font-bold text-purple-800">{data.moodScore}/10</p>
            </div>
            <Heart className="h-8 w-8 text-purple-600" />
          </div>
          <Progress value={moodProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Today's Spend</p>
              <p className="text-2xl font-bold text-orange-800">₹{data.todaysSpend}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <Progress value={spendProgress} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
