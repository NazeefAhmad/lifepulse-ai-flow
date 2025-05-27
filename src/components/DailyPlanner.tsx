
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DailyPlannerProps {
  onBack: () => void;
}

const DailyPlanner = ({ onBack }: DailyPlannerProps) => {
  const [events, setEvents] = useState([
    { id: 1, title: 'Team meeting', time: '09:00', type: 'work' },
    { id: 2, title: 'Lunch with Sarah', time: '12:30', type: 'personal' },
    { id: 3, title: 'Gym workout', time: '18:00', type: 'health' }
  ]);
  const [newEvent, setNewEvent] = useState('');
  const [newTime, setNewTime] = useState('');

  const addEvent = () => {
    if (newEvent.trim() && newTime) {
      setEvents([...events, {
        id: Date.now(),
        title: newEvent,
        time: newTime,
        type: 'personal'
      }]);
      setNewEvent('');
      setNewTime('');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-green-100 text-green-800';
      case 'health': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Planner</h2>
          <p className="text-gray-600">{currentDate}</p>
        </div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Event title"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              className="flex-1"
            />
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-32"
            />
            <Button onClick={addEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>
            {events.length} events planned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.sort((a, b) => a.time.localeCompare(b.time)).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{event.time}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                </div>
                <Badge className={getTypeColor(event.type)}>
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyPlanner;
