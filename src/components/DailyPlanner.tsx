
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Plus, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  time: string;
  duration: string;
  location?: string;
  type: 'meeting' | 'task' | 'personal' | 'break';
}

interface DailyPlannerProps {
  onBack: () => void;
}

const DailyPlanner = ({ onBack }: DailyPlannerProps) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Morning Standup',
      time: '09:00',
      duration: '30 min',
      location: 'Conference Room A',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Project Review',
      time: '10:30',
      duration: '1 hour',
      type: 'task'
    },
    {
      id: '3',
      title: 'Lunch Break',
      time: '12:30',
      duration: '1 hour',
      type: 'break'
    },
    {
      id: '4',
      title: 'Team Meeting',
      time: '14:00',
      duration: '45 min',
      location: 'Zoom',
      type: 'meeting'
    },
    {
      id: '5',
      title: 'Gym Session',
      time: '18:00',
      duration: '1 hour',
      location: 'Local Gym',
      type: 'personal'
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    duration: '',
    location: '',
    type: 'task' as Event['type']
  });

  const addEvent = () => {
    if (!newEvent.title || !newEvent.time) {
      toast({
        title: "Error",
        description: "Please fill in title and time.",
        variant: "destructive",
      });
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent
    };

    setEvents([...events, event].sort((a, b) => a.time.localeCompare(b.time)));
    setNewEvent({
      title: '',
      time: '',
      duration: '',
      location: '',
      type: 'task'
    });
    
    toast({
      title: "Event Added",
      description: "Your event has been added to the schedule.",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'task': return 'bg-green-100 text-green-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'break': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Daily Planner</h1>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-blue-800">
            <Calendar className="h-5 w-5" />
            {getCurrentDate()}
          </div>
          <p className="text-blue-600 mt-1">You have {events.length} events scheduled today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <Input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
            <Input
              placeholder="Duration (e.g., 1 hour)"
              value={newEvent.duration}
              onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
            />
            <Input
              placeholder="Location (optional)"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="task">Task</option>
              <option value="meeting">Meeting</option>
              <option value="personal">Personal</option>
              <option value="break">Break</option>
            </select>
            <Button onClick={addEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {event.duration && <span>Duration: {event.duration}</span>}
                      {event.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Badge className={getTypeColor(event.type)}>
                  {event.type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyPlanner;
