
import React from 'react';
import { Check, Clock, Heart, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const QuickStats = () => {
  return (
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
  );
};

export default QuickStats;
