
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
}

// Extend the global window object to include gapi
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      auth2: {
        init: (config: any) => Promise<any>;
        getAuthInstance: () => any;
      };
      client: {
        init: (config: any) => Promise<void>;
        calendar?: {
          events: {
            insert: (params: any) => Promise<any>;
            list: (params: any) => Promise<any>;
          };
        };
      };
    };
  }
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initializeGoogleCalendar = useCallback(async () => {
    try {
      // Check if Google APIs are loaded
      if (typeof window.gapi === 'undefined') {
        // Load Google API script dynamically
        await loadGoogleAPI();
      }

      await window.gapi.load('auth2', async () => {
        const authInstance = await window.gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/calendar'
        });

        const isSignedIn = authInstance.isSignedIn.get();
        setIsConnected(isSignedIn);

        if (isSignedIn) {
          await window.gapi.load('client', async () => {
            await window.gapi.client.init({
              apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
              clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: 'https://www.googleapis.com/auth/calendar'
            });
          });
        }
      });
    } catch (error) {
      console.error('Error initializing Google Calendar:', error);
      toast({
        title: "Calendar Error",
        description: "Failed to initialize Google Calendar integration.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadGoogleAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  };

  const signInToGoogle = async () => {
    setLoading(true);
    try {
      await initializeGoogleCalendar();
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsConnected(true);
      
      await window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar'
        });
      });

      toast({
        title: "Connected!",
        description: "Successfully connected to Google Calendar.",
      });
    } catch (error) {
      console.error('Error signing in to Google:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar.",
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

    setLoading(true);
    try {
      // Use the gapi.client.request method instead of direct calendar property access
      const response = await (window.gapi.client as any).request({
        path: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        method: 'POST',
        body: event
      });

      toast({
        title: "Event Created",
        description: "Event successfully added to your Google Calendar.",
      });

      return response.result;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create calendar event.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingEvents = async (maxResults = 10) => {
    if (!isConnected) return [];

    try {
      // Use the gapi.client.request method instead of direct calendar property access
      const response = await (window.gapi.client as any).request({
        path: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        method: 'GET',
        params: {
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: maxResults,
          orderBy: 'startTime'
        }
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  };

  return {
    isConnected,
    loading,
    signInToGoogle,
    signOutFromGoogle,
    createCalendarEvent,
    getUpcomingEvents,
    initializeGoogleCalendar
  };
};
