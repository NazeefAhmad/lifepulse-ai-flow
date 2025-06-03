import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ExternalLink, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import GoogleCalendarSetup from './GoogleCalendarSetup';

interface GoogleCalendarIntegrationProps {
  onEventCreated?: (event: any) => void;
}

const GoogleCalendarIntegration = ({ onEventCreated }: GoogleCalendarIntegrationProps) => {
  const {
    isConnected,
    loading,
    credentialsSet,
    signInToGoogle,
    signOutFromGoogle,
    createCalendarEvent,
    getUpcomingEvents
  } = useGoogleCalendar();

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    location: ''
  });

  useEffect(() => {
    if (isConnected) {
      loadUpcomingEvents();
    }
  }, [isConnected]);

  const loadUpcomingEvents = async () => {
    const events = await getUpcomingEvents(5);
    setUpcomingEvents(events);
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const startDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(newEvent.duration) * 60000);

    const event = {
      summary: newEvent.title,
      description: newEvent.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: newEvent.location
    };

    const createdEvent = await createCalendarEvent(event);
    if (createdEvent) {
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        location: ''
      });
      loadUpcomingEvents();
      onEventCreated?.(createdEvent);
    }
  };

  const formatEventTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!credentialsSet) {
    return <GoogleCalendarSetup />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Not Connected"}
              </Badge>
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUpcomingEvents}
                  disabled={loading}
                >
                  Refresh
                </Button>
              )}
            </div>
            {isConnected ? (
              <Button
                variant="outline"
                onClick={signOutFromGoogle}
                disabled={loading}
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={signInToGoogle}
                disabled={loading}
                size="sm"
              >
                Connect Calendar
              </Button>
            )}
          </div>

          {isConnected && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
                <select
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
                <Input
                  placeholder="Location (optional)"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>

              <Button
                onClick={handleCreateEvent}
                disabled={loading || !newEvent.title || !newEvent.date || !newEvent.time}
                className="w-full mb-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Calendar Event
              </Button>

              {upcomingEvents.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Upcoming Events</h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{event.summary}</p>
                          <p className="text-sm text-gray-600">
                            {formatEventTime(event.start.dateTime || event.start.date)}
                          </p>
                          {event.location && (
                            <p className="text-sm text-gray-500">{event.location}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(event.htmlLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCalendarIntegration;
