import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentialsSet, setCredentialsSet] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('google_calendar_token');
    const savedExpiry = localStorage.getItem('google_calendar_token_expiry');
    
    if (savedToken && savedExpiry) {
      const expiryTime = parseInt(savedExpiry);
      if (Date.now() < expiryTime) {
        setAccessToken(savedToken);
        setTokenExpiry(expiryTime);
        setIsConnected(true);
      } else {
        // Token expired, clear it
        localStorage.removeItem('google_calendar_token');
        localStorage.removeItem('google_calendar_token_expiry');
      }
    }
  }, []);

  // Auto-refresh token before expiry and set up real-time sync
  useEffect(() => {
    if (tokenExpiry && accessToken) {
      const timeUntilExpiry = tokenExpiry - Date.now();
      const refreshTime = Math.max(0, timeUntilExpiry - 300000); // Refresh 5 mins before expiry
      
      const refreshTimer = setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);

      return () => clearTimeout(refreshTimer);
    }
  }, [tokenExpiry, accessToken]);

  // Set up real-time sync interval when connected
  useEffect(() => {
    if (isConnected && accessToken) {
      const syncInterval = setInterval(() => {
        syncCalendarEvents();
      }, 30000); // Sync every 30 seconds

      // Initial sync
      syncCalendarEvents();

      return () => clearInterval(syncInterval);
    }
  }, [isConnected, accessToken]);

  const saveToken = (token: string, expiresIn: number) => {
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem('google_calendar_token', token);
    localStorage.setItem('google_calendar_token_expiry', expiryTime.toString());
    setAccessToken(token);
    setTokenExpiry(expiryTime);
    setIsConnected(true);
  };

  const clearToken = () => {
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_calendar_token_expiry');
    setAccessToken(null);
    setTokenExpiry(null);
    setIsConnected(false);
  };

  const refreshAccessToken = async () => {
    try {
      if (window.google?.accounts?.oauth2) {
        const { data: credentials } = await supabase.functions.invoke('get-google-credentials');
        
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: credentials.clientId,
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: (response: any) => {
            if (response.access_token) {
              saveToken(response.access_token, response.expires_in || 3600);
            }
          },
        });
        
        tokenClient.requestAccessToken({ prompt: '' }); // Silent refresh
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearToken();
    }
  };

  const initializeGapi = useCallback(async () => {
    if (typeof window !== 'undefined' && window.gapi) {
      try {
        const { data: credentials, error } = await supabase.functions.invoke('get-google-credentials');
        
        if (error || !credentials?.credentialsSet) {
          console.log('Google API credentials not configured');
          setCredentialsSet(false);
          return;
        }

        await new Promise((resolve) => window.gapi.load('client', resolve));
        
        await window.gapi.client.init({
          apiKey: credentials.apiKey,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });

        setCredentialsSet(true);
      } catch (error) {
        console.error('Error initializing Google API:', error);
        toast({
          title: "Google Calendar Setup Error",
          description: "Failed to initialize Google Calendar integration.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    const loadGoogleServices = () => {
      if (!window.gapi) {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = () => {
          const gisScript = document.createElement('script');
          gisScript.src = 'https://accounts.google.com/gsi/client';
          gisScript.onload = initializeGapi;
          document.head.appendChild(gisScript);
        };
        document.head.appendChild(gapiScript);
      } else {
        initializeGapi();
      }
    };

    loadGoogleServices();
  }, [initializeGapi]);

  const signInToGoogle = async () => {
    if (!credentialsSet) {
      toast({
        title: "Setup Required",
        description: "Google API credentials need to be configured first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: credentials } = await supabase.functions.invoke('get-google-credentials');
      
      if (window.google?.accounts?.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: credentials.clientId,
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: (response: any) => {
            if (response.access_token) {
              saveToken(response.access_token, response.expires_in || 3600);
              toast({
                title: "Google Calendar Connected",
                description: "Successfully connected to your Google Calendar.",
              });
            }
            setLoading(false);
          },
        });
        
        tokenClient.requestAccessToken();
      }
    } catch (error) {
      console.error('Error signing in to Google:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const signOutFromGoogle = async () => {
    try {
      if (accessToken && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(accessToken);
      }
      clearToken();
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Calendar.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const createCalendarEvent = async (event: CalendarEvent) => {
    if (!isConnected || !accessToken) {
      toast({
        title: "Not Connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return null;
    }

    // Check if token is about to expire and refresh if needed
    if (tokenExpiry && Date.now() > tokenExpiry - 300000) {
      await refreshAccessToken();
    }

    try {
      const response = await window.gapi.client.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        method: 'POST',
        body: event,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      toast({
        title: "Event Created",
        description: "Event successfully added to your Google Calendar.",
      });

      return response.result;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      
      // If unauthorized, try to refresh token
      if (error.status === 401) {
        await refreshAccessToken();
        return createCalendarEvent(event); // Retry once
      }
      
      toast({
        title: "Event Creation Failed",
        description: "Failed to create calendar event. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const createTaskEvent = async ({ title, dueDate, priority }: { title: string; dueDate: string; priority: string }) => {
    if (!isConnected || !dueDate) return null;

    const startDateTime = new Date(`${dueDate}T09:00:00`);
    const endDateTime = new Date(`${dueDate}T10:00:00`);

    const event = {
      summary: `📋 ${title}`,
      description: `Task Priority: ${priority}\n\nCreated by LifeSync`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    return await createCalendarEvent(event);
  };

  const createReminderEvent = async ({ title, date, type }: { title: string; date: string; type: string }) => {
    if (!isConnected || !date) return null;

    const startDateTime = new Date(`${date}T10:00:00`);
    const endDateTime = new Date(`${date}T10:30:00`);

    const event = {
      summary: `💕 ${title}`,
      description: `Reminder Type: ${type}\n\nCreated by LifeSync Relationship Care`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    return await createCalendarEvent(event);
  };

  const createDailyPlannerEvent = async ({ title, description, startTime, duration, date, location }: { 
    title: string; 
    description?: string; 
    startTime: string; 
    duration: number; 
    date: string;
    location?: string;
  }) => {
    if (!isConnected || !date || !startTime) return null;

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const event = {
      summary: `📅 ${title}`,
      description: description ? `${description}\n\nCreated by LifeSync Daily Planner` : 'Created by LifeSync Daily Planner',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: location
    };

    return await createCalendarEvent(event);
  };

  const getUpcomingEvents = async (maxResults = 10) => {
    if (!isConnected || !accessToken) return [];

    try {
      const response = await window.gapi.client.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        method: 'GET',
        params: {
          timeMin: new Date().toISOString(),
          maxResults: maxResults,
          singleEvents: true,
          orderBy: 'startTime',
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  };

  const importTasksFromCalendar = async (daysAhead = 7) => {
    if (!isConnected || !accessToken) {
      toast({
        title: "Not Connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return [];
    }

    try {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

      const response = await window.gapi.client.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        method: 'GET',
        params: {
          timeMin,
          timeMax,
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime',
          q: '#task',
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const events = response.result.items || [];
      
      const taskEvents = events.filter((event: any) => 
        event.summary?.includes('#task') || event.description?.includes('#task')
      );

      const importedTasks = taskEvents.map((event: any) => ({
        title: event.summary?.replace('#task', '').trim() || 'Imported Task',
        description: event.description?.replace('#task', '').trim() || '',
        due_date: event.start?.date || event.start?.dateTime?.split('T')[0],
        priority: event.description?.includes('high') ? 'high' : 
                 event.description?.includes('low') ? 'low' : 'medium',
        google_event_id: event.id,
        status: 'pending'
      }));

      toast({
        title: "Tasks Imported",
        description: `Found ${importedTasks.length} task(s) from Google Calendar.`,
      });

      return importedTasks;
    } catch (error) {
      console.error('Error importing tasks from calendar:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import tasks from Google Calendar.",
        variant: "destructive",
      });
      return [];
    }
  };

  const syncCalendarEvents = async () => {
    if (!isConnected || !accessToken || isSyncing) return;

    setIsSyncing(true);
    try {
      const events = await getUpcomingEvents(50);
      
      // Filter LifeSync created events
      const lifeSyncEvents = events.filter((event: any) => 
        event.description?.includes('Created by LifeSync') ||
        event.summary?.includes('📋') ||
        event.summary?.includes('💕') ||
        event.summary?.includes('📅')
      );

      // Sync with Supabase database
      for (const event of lifeSyncEvents) {
        if (event.summary?.includes('📋')) {
          // Handle task sync
          await syncTaskEvent(event);
        } else if (event.summary?.includes('💕')) {
          // Handle relationship reminder sync
          await syncReminderEvent(event);
        } else if (event.summary?.includes('📅')) {
          // Handle daily planner sync
          await syncDailyPlannerEvent(event);
        }
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error syncing calendar events:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncTaskEvent = async (event: any) => {
    try {
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('google_event_id', event.id)
        .single();

      if (!existingTask) return;

      // Check if event was modified in Google Calendar
      const eventUpdated = new Date(event.updated);
      const taskUpdated = new Date(existingTask.updated_at);

      if (eventUpdated > taskUpdated) {
        // Update task based on calendar event changes
        const { error } = await supabase
          .from('tasks')
          .update({
            title: event.summary?.replace('📋 ', '').replace(' #task', '') || existingTask.title,
            updated_at: new Date().toISOString()
          })
          .eq('google_event_id', event.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error syncing task event:', error);
    }
  };

  const syncReminderEvent = async (event: any) => {
    try {
      const { data: existingReminder } = await supabase
        .from('relationship_reminders')
        .select('*')
        .eq('title', event.summary?.replace('💕 ', ''))
        .single();

      if (existingReminder) return;

      // Create new reminder if it doesn't exist and was created externally
      if (!event.description?.includes('Created by LifeSync')) {
        const { error } = await supabase
          .from('relationship_reminders')
          .insert({
            title: event.summary?.replace('💕 ', '') || 'Imported Reminder',
            date: event.start?.date || event.start?.dateTime?.split('T')[0],
            type: 'imported',
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error syncing reminder event:', error);
    }
  };

  const syncDailyPlannerEvent = async (event: any) => {
    try {
      const { data: existingEvent } = await supabase
        .from('daily_events')
        .select('*')
        .eq('google_event_id', event.id)
        .single();

      if (!existingEvent) return;

      const eventUpdated = new Date(event.updated);
      const dbEventUpdated = new Date(existingEvent.created_at);

      if (eventUpdated > dbEventUpdated) {
        const { error } = await supabase
          .from('daily_events')
          .update({
            title: event.summary?.replace('📅 ', '') || existingEvent.title,
            description: event.description?.replace('\n\nCreated by LifeSync Daily Planner', '') || existingEvent.description,
            location: event.location || existingEvent.location
          })
          .eq('google_event_id', event.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error syncing daily planner event:', error);
    }
  };

  const bulkExportTasks = async (tasks: any[]) => {
    if (!isConnected || !accessToken || tasks.length === 0) {
      toast({
        title: "Cannot Export",
        description: "Please connect to Google Calendar and select tasks to export.",
        variant: "destructive",
      });
      return [];
    }

    try {
      const exportPromises = tasks.map(async (task) => {
        if (task.google_event_id) return null;

        const startDateTime = task.due_date ? 
          new Date(`${task.due_date}T09:00:00`) : 
          new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        const event = {
          summary: `📋 ${task.title} #task`,
          description: `${task.description || ''}\n\nPriority: ${task.priority}\nStatus: ${task.status}\n\nCreated by LifeSync`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        };

        return await createCalendarEvent(event);
      });

      const results = await Promise.all(exportPromises);
      const successCount = results.filter(result => result !== null).length;

      toast({
        title: "Bulk Export Complete",
        description: `Successfully exported ${successCount} of ${tasks.length} tasks to Google Calendar.`,
      });

      return results;
    } catch (error) {
      console.error('Error bulk exporting tasks:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export tasks to Google Calendar.",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    isConnected,
    loading,
    credentialsSet,
    isSyncing,
    lastSyncTime,
    signInToGoogle,
    signOutFromGoogle,
    createCalendarEvent,
    createTaskEvent,
    createReminderEvent,
    createDailyPlannerEvent,
    getUpcomingEvents,
    importTasksFromCalendar,
    bulkExportTasks,
    syncCalendarEvents
  };
};
