
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Plus, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface Event {
  id: string;
  title: string;
  time: string;
  duration: string;
  location?: string;
  type: 'meeting' | 'task' | 'personal' | 'break';
  isGoogleEvent?: boolean;
  googleEventId?: string;
}

interface DailyPlannerProps {
  onBack: () => void;
}

const DailyPlanner = ({ onBack }: DailyPlannerProps) => {
  const { toast } = useToast();
  const { isConnected, createCalendarEvent, getUpcomingEvents } = useGoogleCalendar();
  
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
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    duration: '',
    location: '',
    type: 'task' as Event['type'],
    syncToGoogle: false
  });

  useEffect(() => {
    if (isConnected) {
      loadGoogleEvents();
    }
  }, [isConnected]);

  const loadGoogleEvents = async () => {
    try {
      const googleEvents = await getUpcomingEvents(10);
      const today = new Date().toDateString();
      
      const todayEvents = googleEvents
        .filter((event: any) => {
          const eventDate = new Date(event.start.dateTime || event.start.date).toDateString();
          return eventDate === today;
        })
        .map((event: any) => ({
          id: `google-${event.id}`,
          title: event.summary,
          time: new Date(event.start.dateTime || event.start.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          duration: calculateDuration(event.start.dateTime, event.end.dateTime),
          location: event.location,
          type: 'meeting' as Event['type'],
          isGoogleEvent: true,
          googleEventId: event.id
        }));

      // Merge with existing local events, avoiding duplicates
      setEvents(prevEvents => {
        const localEvents = prevEvents.filter(e => !e.isGoogleEvent);
        return [...localEvents, ...todayEvents].sort((a, b) => a.time.localeCompare(b.time));
      });
    } catch (error) {
      console.error('Error loading Google events:', error);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const addEvent = async () => {
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

    // If sync to Google Calendar is enabled and connected
    if (newEvent.syncToGoogle && isConnected) {
      const today = new Date().toISOString().split('T')[0];
      const startDateTime = new Date(`${today}T${newEvent.time}`);
      const durationMinutes = parseDuration(newEvent.duration);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

      const googleEvent = {
        summary: newEvent.title,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: newEvent.location,
        description: `Created from LifeSync AI - ${newEvent.type}`
      };

      const createdEvent = await createCalendarEvent(googleEvent);
      if (createdEvent) {
        event.isGoogleEvent = true;
        event.googleEventId = createdEvent.id;
      }
    }

    setEvents([...events, event].sort((a, b) => a.time.localeCompare(b.time)));
    setNewEvent({
      title: '',
      time: '',
      duration: '',
      location: '',
      type: 'task',
      syncToGoogle: false
    });
    
    toast({
      title: "Event Added",
      description: newEvent.syncToGoogle && isConnected ? 
        "Event added to both local planner and Google Calendar." :
        "Event added to your schedule.",
    });
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) * (duration.includes('hour') ? 60 : 1) : 60;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-gray-100 text-black border-black';
      case 'task': return 'bg-gray-100 text-black border-black';
      case 'personal': return 'bg-gray-100 text-black border-black';
      case 'break': return 'bg-gray-100 text-black border-black';
      default: return 'bg-gray-100 text-black border-black';
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-black text-black hover:bg-black hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-black">Daily Planner</h1>
        </div>

        <Card className="bg-white border-black shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-black">
              <Calendar className="h-5 w-5" />
              {getCurrentDate()}
            </div>
            <p className="text-gray-600 mt-1">
              You have {events.length} events scheduled today
              {isConnected && " (synced with Google Calendar)"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-black shadow-sm">
          <CardHeader>
            <CardTitle className="text-black">Add New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="border-black focus:ring-black"
              />
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="border-black focus:ring-black"
              />
              <Input
                placeholder="Duration (e.g., 1 hour)"
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                className="border-black focus:ring-black"
              />
              <Input
                placeholder="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="border-black focus:ring-black"
              />
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                className="px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              >
                <option value="task">Task</option>
                <option value="meeting">Meeting</option>
                <option value="personal">Personal</option>
                <option value="break">Break</option>
              </select>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={addEvent} 
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
                {isConnected && (
                  <label className="flex items-center gap-2 text-sm text-black">
                    <input
                      type="checkbox"
                      checked={newEvent.syncToGoogle}
                      onChange={(e) => setNewEvent({ ...newEvent, syncToGoogle: e.target.checked })}
                      className="rounded border-black focus:ring-black"
                    />
                    Sync to Google
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="bg-white border-black shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-black">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-black">{event.title}</h3>
                        {event.isGoogleEvent && (
                          <Badge variant="outline" className="text-xs border-black text-black">
                            <Calendar className="h-3 w-3 mr-1" />
                            Google
                          </Badge>
                        )}
                      </div>
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
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    {event.isGoogleEvent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://calendar.google.com/calendar/event?eid=${event.googleEventId}`, '_blank')}
                        className="text-black hover:bg-gray-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
