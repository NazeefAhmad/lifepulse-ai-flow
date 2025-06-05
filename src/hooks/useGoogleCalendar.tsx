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
  }
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentialsSet, setCredentialsSet] = useState(false);
  const { toast } = useToast();

  const initializeGapi = useCallback(async () => {
    if (typeof window !== 'undefined' && window.gapi) {
      try {
        await new Promise((resolve) => window.gapi.load('auth2:client', resolve));
        
        // Get credentials from Supabase edge function
        const { data: credentials, error } = await supabase.functions.invoke('get-google-credentials');
        
        if (error || !credentials?.credentialsSet) {
          console.log('Google API credentials not configured');
          setCredentialsSet(false);
          return;
        }
        
        await window.gapi.client.init({
          apiKey: credentials.apiKey,
          clientId: credentials.clientId,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar'
        });

        setCredentialsSet(true);
        const authInstance = window.gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();
        setIsConnected(isSignedIn);

        // Listen for sign-in state changes
        authInstance.isSignedIn.listen(setIsConnected);
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
    const loadGapi = () => {
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = initializeGapi;
        document.head.appendChild(script);
      } else {
        initializeGapi();
      }
    };

    loadGapi();
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
      if (!window.gapi?.auth2) {
        await initializeGapi();
      }
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsConnected(true);
      
      toast({
        title: "Google Calendar Connected",
        description: "Successfully connected to your Google Calendar.",
      });
    } catch (error) {
      console.error('Error signing in to Google:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please check your setup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOutFromGoogle = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsConnected(false);
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Calendar.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const createCalendarEvent = async (event: CalendarEvent) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await window.gapi.client.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        method: 'POST',
        body: event,
      });

      toast({
        title: "Event Created",
        description: "Event successfully added to your Google Calendar.",
      });

      return response.result;
    } catch (error) {
      console.error('Error creating calendar event:', error);
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
    if (!isConnected) return [];

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
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  };

  return {
    isConnected,
    loading,
    credentialsSet,
    signInToGoogle,
    signOutFromGoogle,
    createCalendarEvent,
    createTaskEvent,
    createReminderEvent,
    createDailyPlannerEvent,
    getUpcomingEvents
  };
};
