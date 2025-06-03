
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, MapPin, Calendar, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DailyEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  duration_minutes: number;
  location?: string;
  event_type: 'meeting' | 'task' | 'personal' | 'break';
  date: string;
  google_event_id?: string;
  created_at: string;
}

interface DailyPlannerManagerProps {
  onBack: () => void;
}

const DailyPlannerManager = ({ onBack }: DailyPlannerManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, createDailyPlannerEvent } = useGoogleCalendar();
  
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    duration_minutes: 60,
    location: '',
    event_type: 'task' as 'meeting' | 'task' | 'personal' | 'break',
    syncToGoogle: false
  });

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, selectedDate]);

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('daily_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: "Failed to load daily events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_time || !user) return;
    
    try {
      setLoading(true);
      
      let googleEventId = null;
      
      // Create Google Calendar event if sync is enabled
      if (newEvent.syncToGoogle && isConnected) {
        const googleEvent = await createDailyPlannerEvent({
          title: newEvent.title,
          description: newEvent.description,
          startTime: newEvent.start_time,
          duration: newEvent.duration_minutes,
          date: selectedDate,
          location: newEvent.location
        });
        
        if (googleEvent) {
          googleEventId = googleEvent.id;
        }
      }

      const { data, error } = await supabase
        .from('daily_events')
        .insert([{
          user_id: user.id,
          title: newEvent.title,
          description: newEvent.description || null,
          start_time: newEvent.start_time,
          duration_minutes: newEvent.duration_minutes,
          location: newEvent.location || null,
          event_type: newEvent.event_type,
          date: selectedDate,
          google_event_id: googleEventId
        }])
        .select()
        .single();

      if (error) throw error;

      setEvents([...events, data]);
      setNewEvent({
        title: '',
        description: '',
        start_time: '',
        duration_minutes: 60,
        location: '',
        event_type: 'task',
        syncToGoogle: false
      });
      
      toast({
        title: "Event Added",
        description: googleEventId ? "Event added and synced to Google Calendar." : "Event added successfully.",
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('daily_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "Event has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'task': return 'bg-green-100 text-green-800 border-green-200';
      case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'break': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Daily Planner
          </h1>
        </div>
        
        {isConnected && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Calendar className="h-3 w-3 mr-1" />
            Google Calendar Connected
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48"
        />
        <Badge variant="outline">
          {events.length} event{events.length !== 1 ? 's' : ''} scheduled
        </Badge>
      </div>

      <Card className="border-2 border-dashed border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Add New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Event title..."
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="font-medium"
              />
              <Input
                type="time"
                value={newEvent.start_time}
                onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
              />
            </div>
            
            <Textarea
              placeholder="Description (optional)"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={2}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <select
                value={newEvent.event_type}
                onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as any })}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="personal">Personal</option>
                <option value="break">Break</option>
              </select>
              
              <select
                value={newEvent.duration_minutes}
                onChange={(e) => setNewEvent({ ...newEvent, duration_minutes: parseInt(e.target.value) })}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
              
              <Input
                placeholder="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              
              <div className="flex items-center gap-4">
                {isConnected && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newEvent.syncToGoogle}
                      onChange={(e) => setNewEvent({ ...newEvent, syncToGoogle: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    Sync to Google
                  </label>
                )}
                
                <Button 
                  onClick={addEvent} 
                  disabled={!newEvent.title.trim() || !newEvent.start_time || loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="transition-all border-2 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col items-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">{formatTime(event.start_time)}</span>
                      <span className="text-xs text-gray-500">{event.duration_minutes}m</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{event.title}</h3>
                        {event.google_event_id && (
                          <Calendar className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {events.length === 0 && !loading && (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No events scheduled</h3>
                <p className="text-gray-500">Add your first event to start planning your day!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyPlannerManager;
