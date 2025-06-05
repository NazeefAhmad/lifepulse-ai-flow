
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
  const { toast } = useToast();

  const initializeGapi = useCallback(async () => {
    if (typeof window !== 'undefined' && window.gapi) {
      try {
        // Get credentials from Supabase edge function
        const { data: credentials, error } = await supabase.functions.invoke('get-google-credentials');
        
        if (error || !credentials?.credentialsSet) {
          console.log('Google API credentials not configured');
          setCredentialsSet(false);
          return;
        }

        // Initialize Google API client
        await new Promise((resolve) => window.gapi.load('client', resolve));
        
        await window.gapi.client.init({
          apiKey: credentials.apiKey,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });

        // Initialize Google Identity Services
        if (window.google?.accounts?.oauth2) {
          window.google.accounts.oauth2.initTokenClient({
            client_id: credentials.clientId,
            scope: 'https://www.googleapis.com/auth/calendar',
            callback: (response: any) => {
              if (response.access_token) {
                setAccessToken(response.access_token);
                setIsConnected(true);
                toast({
                  title: "Google Calendar Connected",
                  description: "Successfully connected to your Google Calendar.",
                });
              }
            },
          });
        }

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
      // Load Google API
      if (!window.gapi) {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = () => {
          // Load Google Identity Services
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
              setAccessToken(response.access_token);
              setIsConnected(true);
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
      setAccessToken(null);
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
    if (!isConnected || !accessToken) {
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
