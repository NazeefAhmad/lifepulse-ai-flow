
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, MapPin, Calendar, Trash2, Edit3, Sparkles, Check, PlayCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TypingIndicator from './TypingIndicator';

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
  status?: 'todo' | 'in-progress' | 'done';
}

interface DailyPlannerManagerProps {
  onBack: () => void;
}

const DailyPlannerManager = ({ onBack }: DailyPlannerManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, createDailyPlannerEvent, isSyncing, bulkExportTasks } = useGoogleCalendar();
  
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
  const [isTyping, setIsTyping] = useState(false);

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
      
      // Type cast the data to ensure proper types and add default status
      const typedEvents: DailyEvent[] = (data || []).map(event => ({
        ...event,
        event_type: event.event_type as 'meeting' | 'task' | 'personal' | 'break',
        status: (event.status as 'todo' | 'in-progress' | 'done') || 'todo'
      }));
      
      setEvents(typedEvents);
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

  const splitEventsFromText = (text: string): string[] => {
    // Split by common delimiters that indicate separate events
    const delimiters = ['\n', ';', ',', '|', '•', '-', '*'];
    let events = [text];
    
    delimiters.forEach(delimiter => {
      events = events.flatMap(event => 
        event.split(delimiter).map(e => e.trim()).filter(e => e.length > 0)
      );
    });
    
    // Filter out very short events (likely not meaningful)
    return events.filter(event => event.length > 2);
  };

  const handleEventInput = (value: string) => {
    setNewEvent({ ...newEvent, title: value });
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
    
    // Check if input contains multiple events
    const potentialEvents = splitEventsFromText(value);
    if (potentialEvents.length > 1) {
      console.log(`Will create ${potentialEvents.length} events:`, potentialEvents);
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    try {
      const statusCycle = ['todo', 'in-progress', 'done'];
      const currentIndex = statusCycle.indexOf(currentStatus || 'todo');
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

      const { error } = await supabase
        .from('daily_events')
        .update({ 
          status: nextStatus
        })
        .eq('id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setEvents(events.map(event => 
        event.id === eventId ? { ...event, status: nextStatus as 'todo' | 'in-progress' | 'done' } : event
      ));

      if (nextStatus === 'done') {
        toast({
          title: "Event Completed! 🎉",
          description: "Great job finishing this event!",
        });
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast({
        title: "Error",
        description: "Failed to update event status.",
        variant: "destructive",
      });
    }
  };

  const addBulkEvents = async () => {
    if (!newEvent.title.trim() || !newEvent.start_time || !user) return;
    
    try {
      setLoading(true);
      
      const eventsToCreate = splitEventsFromText(newEvent.title);
      console.log('Creating bulk events:', eventsToCreate);
      
      if (eventsToCreate.length > 1) {
        toast({
          title: `Creating ${eventsToCreate.length} events...`,
          description: "Processing your bulk event creation",
        });
      }
      
      const createdEvents = [];
      let hasGoogleSync = false;
      
      for (const eventTitle of eventsToCreate) {
        let googleEventId = null;
        
        // Create Google Calendar event if sync is enabled
        if (newEvent.syncToGoogle && isConnected) {
          const googleEvent = await createDailyPlannerEvent({
            title: eventTitle,
            description: newEvent.description,
            startTime: newEvent.start_time,
            duration: newEvent.duration_minutes,
            date: selectedDate,
            location: newEvent.location
          });
          
          if (googleEvent) {
            googleEventId = googleEvent.id;
            hasGoogleSync = true;
          }
        }

        const { data, error } = await supabase
          .from('daily_events')
          .insert([{
            user_id: user.id,
            title: eventTitle,
            description: newEvent.description || null,
            start_time: newEvent.start_time,
            duration_minutes: newEvent.duration_minutes,
            location: newEvent.location || null,
            event_type: newEvent.event_type,
            date: selectedDate,
            google_event_id: googleEventId,
            status: 'todo'
          }])
          .select()
          .single();

        if (error) throw error;

        // Type cast the new event
        const newEventData: DailyEvent = {
          ...data,
          event_type: data.event_type as 'meeting' | 'task' | 'personal' | 'break',
          status: 'todo'
        };

        createdEvents.push(newEventData);
      }

      setEvents([...createdEvents, ...events]);
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
        title: `${createdEvents.length} Event${createdEvents.length > 1 ? 's' : ''} Added! ✨`,
        description: hasGoogleSync ? "Events added and synced to Google Calendar." : "Events added successfully.",
      });
    } catch (error) {
      console.error('Error adding events:', error);
      toast({
        title: "Error",
        description: "Failed to add events. Please try again.",
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

  const bulkSyncToGoogle = async () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return;
    }

    const eventsToSync = events.filter(event => !event.google_event_id);
    
    if (eventsToSync.length === 0) {
      toast({
        title: "All Synced!",
        description: "All events are already synced with Google Calendar.",
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: `Syncing ${eventsToSync.length} Events...`,
        description: "Uploading events to Google Calendar",
      });

      let syncedCount = 0;
      for (const event of eventsToSync) {
        try {
          const googleEvent = await createDailyPlannerEvent({
            title: event.title,
            description: event.description,
            startTime: event.start_time,
            duration: event.duration_minutes,
            date: event.date,
            location: event.location
          });

          if (googleEvent) {
            // Update the database with Google Event ID
            const { error } = await supabase
              .from('daily_events')
              .update({ google_event_id: googleEvent.id })
              .eq('id', event.id);

            if (!error) {
              syncedCount++;
              // Update local state
              setEvents(prev => prev.map(e => 
                e.id === event.id ? { ...e, google_event_id: googleEvent.id } : e
              ));
            }
          }
        } catch (error) {
          console.error(`Failed to sync event ${event.title}:`, error);
        }
      }

      toast({
        title: `Sync Complete! 🎉`,
        description: `Successfully synced ${syncedCount} of ${eventsToSync.length} events to Google Calendar.`,
      });
    } catch (error) {
      console.error('Error during bulk sync:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync events to Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <Check className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default: return <Circle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-50 border-green-200';
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
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
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                Daily Planner
              </h1>
              {isTyping && <TypingIndicator />}
            </div>
            <p className="text-gray-600 mt-1">Plan your day with smart bulk event creation and status tracking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isConnected && (
            <>
              <Badge variant="outline" className={`${isSyncing ? 'animate-pulse bg-blue-100 text-blue-800' : 'bg-green-50 text-green-700 border-green-200'}`}>
                <Calendar className="h-3 w-3 mr-1" />
                {isSyncing ? 'Syncing...' : 'Google Calendar Connected'}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={bulkSyncToGoogle}
                disabled={loading || isSyncing}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {isSyncing ? 'Syncing...' : `Sync All to Google (${events.filter(e => !e.google_event_id).length})`}
              </Button>
            </>
          )}
        </div>
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
        {isConnected && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            {events.filter(e => e.google_event_id).length} synced to Google
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Todo: {events.filter(e => (e.status || 'todo') === 'todo').length}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            In Progress: {events.filter(e => e.status === 'in-progress').length}
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Done: {events.filter(e => e.status === 'done').length}
          </Badge>
        </div>
      </div>

      
      <Card className="border-2 border-dashed border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Event(s)
          </CardTitle>
          <p className="text-sm text-purple-600">
            💡 Tip: Paste multiple events separated by new lines, commas, or semicolons to create them all at once!
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="What's on your schedule? ✨ (supports bulk creation)"
                  value={newEvent.title}
                  onChange={(e) => handleEventInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBulkEvents()}
                  className="font-medium"
                />
                {splitEventsFromText(newEvent.title).length > 1 && (
                  <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded border border-purple-200">
                    Will create {splitEventsFromText(newEvent.title).length} events
                  </div>
                )}
              </div>
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
                  onClick={addBulkEvents} 
                  disabled={!newEvent.title.trim() || !newEvent.start_time || loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {splitEventsFromText(newEvent.title).length > 1 
                    ? `Create ${splitEventsFromText(newEvent.title).length} Events` 
                    : 'Add Event'}
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
            <Card key={event.id} className={`transition-all border-2 hover:shadow-md ${getStatusColor(event.status || 'todo')} ${
              event.status === 'done' ? 'opacity-75' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEventStatus(event.id, event.status || 'todo')}
                      className="p-2 hover:bg-white/50 rounded-full"
                    >
                      {getStatusIcon(event.status || 'todo')}
                    </Button>
                    
                    <div className="flex flex-col items-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">{formatTime(event.start_time)}</span>
                      <span className="text-xs text-gray-500">{event.duration_minutes}m</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${event.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {event.title}
                        </h3>
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
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                      <Badge className={getStatusBadgeColor(event.status || 'todo')}>
                        {event.status || 'todo'}
                      </Badge>
                    </div>
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
