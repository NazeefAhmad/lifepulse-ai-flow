
import React, { useState } from 'react';
import { Clock, Brain, Coffee, Calendar, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DailyPlanner = () => {
  const timeSlots = [
    { time: '9:00 AM', title: 'Morning Coffee & Planning', type: 'break', duration: '30 min' },
    { time: '9:30 AM', title: 'Deep Work: Project Development', type: 'focus', duration: '2 hours' },
    { time: '11:30 AM', title: 'Team Standup Meeting', type: 'meeting', duration: '30 min' },
    { time: '12:00 PM', title: 'Email & Administrative Tasks', type: 'admin', duration: '1 hour' },
    { time: '1:00 PM', title: 'Lunch Break', type: 'break', duration: '1 hour' },
    { time: '2:00 PM', title: 'Client Presentation Prep', type: 'focus', duration: '1.5 hours' },
    { time: '3:30 PM', title: 'Code Review Session', type: 'collaboration', duration: '1 hour' },
    { time: '4:30 PM', title: 'Personal Tasks & Planning', type: 'personal', duration: '30 min' },
    { time: '5:00 PM', title: 'Gym / Exercise', type: 'health', duration: '1 hour' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'focus': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'break': return 'bg-green-100 text-green-800 border-green-200';
      case 'admin': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'collaboration': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'personal': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'health': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Planner</h2>
          <p className="text-gray-600">AI-optimized schedule for maximum productivity</p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* AI Optimization Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Brain className="h-5 w-5" />
            AI Schedule Optimization
          </CardTitle>
          <CardDescription>
            Your schedule has been optimized based on your energy patterns and priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-green-100">
              <p className="font-medium text-green-800">Peak Focus Time</p>
              <p className="text-sm text-gray-600">9:30 AM - 11:30 AM</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium text-blue-800">Productivity Score</p>
              <p className="text-sm text-gray-600">87% (Excellent)</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <p className="font-medium text-purple-800">Free Time</p>
              <p className="text-sm text-gray-600">1.5 hours available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">{slot.time}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{slot.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getTypeColor(slot.type)}`}>
                      {slot.type}
                    </Badge>
                    <span className="text-xs text-gray-500">{slot.duration}</span>
                  </div>
                </div>
                {slot.type === 'focus' && (
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Coffee className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-4">
          <div className="text-center">
            <Brain className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="font-medium">Reschedule with AI</p>
            <p className="text-xs text-gray-500">Optimize for new priorities</p>
          </div>
        </Button>
        
        <Button variant="outline" className="h-auto p-4">
          <div className="text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="font-medium">Add Time Block</p>
            <p className="text-xs text-gray-500">Schedule new activity</p>
          </div>
        </Button>
        
        <Button variant="outline" className="h-auto p-4">
          <div className="text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="font-medium">View Weekly</p>
            <p className="text-xs text-gray-500">See full week plan</p>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default DailyPlanner;
