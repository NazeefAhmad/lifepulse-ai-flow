
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
        request: (params: any) => Promise<any>;
      };
    };
  }
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authInstance, setAuthInstance] = useState<any>(null);
  const { toast } = useToast();

  const loadGoogleAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window.gapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  };

  const initializeGoogleCalendar = useCallback(async () => {
    try {
      console.log('Loading Google API...');
      await loadGoogleAPI();
      
      console.log('Initializing auth2...');
      return new Promise<void>((resolve, reject) => {
        window.gapi.load('auth2', async () => {
          try {
            const auth = await window.gapi.auth2.init({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
              scope: 'https://www.googleapis.com/auth/calendar'
            });

            console.log('Auth2 initialized:', auth);
            setAuthInstance(auth);
            
            const isSignedIn = auth.isSignedIn.get();
            console.log('Is signed in:', isSignedIn);
            setIsConnected(isSignedIn);

            if (isSignedIn) {
              await initializeGAPIClient();
            }
            
            resolve();
          } catch (error) {
            console.error('Error in auth2 init:', error);
            reject(error);
          }
        });
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

  const initializeGAPIClient = async () => {
    return new Promise<void>((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar'
          });
          console.log('GAPI client initialized');
          resolve();
        } catch (error) {
          console.error('Error initializing GAPI client:', error);
          reject(error);
        }
      });
    });
  };

  const signInToGoogle = async () => {
    setLoading(true);
    try {
      console.log('Starting sign in process...');
      
      if (!authInstance) {
        console.log('Auth instance not found, initializing...');
        await initializeGoogleCalendar();
      }

      const currentAuthInstance = authInstance || window.gapi.auth2.getAuthInstance();
      
      if (!currentAuthInstance) {
        throw new Error('Failed to get auth instance');
      }

      console.log('Attempting to sign in...');
      await currentAuthInstance.signIn();
      
      setIsConnected(true);
      await initializeGAPIClient();

      toast({
        title: "Connected!",
        description: "Successfully connected to Google Calendar.",
      });
    } catch (error) {
      console.error('Error signing in to Google:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please check your API credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOutFromGoogle = async () => {
    try {
      const currentAuthInstance = authInstance || window.gapi.auth2.getAuthInstance();
      if (currentAuthInstance) {
        await currentAuthInstance.signOut();
        setIsConnected(false);
        setAuthInstance(null);
        
        toast({
          title: "Disconnected",
          description: "Successfully disconnected from Google Calendar.",
        });
      }
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
      const response = await window.gapi.client.request({
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
      const response = await window.gapi.client.request({
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
