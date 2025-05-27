
import React from 'react';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AIInsights = () => {
  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Brain className="h-5 w-5" />
          Today's AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-800">Great productivity momentum!</p>
              <p className="text-sm text-gray-600">You've completed 75% of your tasks. Consider tackling that important presentation next.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-800">Schedule optimization</p>
              <p className="text-sm text-gray-600">Your most productive hours are 10 AM - 12 PM. Block this time for deep work tomorrow.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
