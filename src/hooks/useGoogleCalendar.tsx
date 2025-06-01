
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

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

// Extend the global window object to include Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        request: (params: any) => Promise<any>;
        setToken: (token: any) => void;
      };
    };
  }
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ clientId: string; apiKey: string } | null>(null);
  const { toast } = useToast();

  const fetchCredentials = async () => {
    try {
      const { data: clientIdData } = await supabase.functions.invoke('get-secret', {
        body: { name: 'GOOGLE_CLIENT_ID' }
      });
      
      const { data: apiKeyData } = await supabase.functions.invoke('get-secret', {
        body: { name: 'GOOGLE_API_KEY' }
      });

      if (clientIdData?.value && apiKeyData?.value) {
        setCredentials({
          clientId: clientIdData.value,
          apiKey: apiKeyData.value
        });
        return { clientId: clientIdData.value, apiKey: apiKeyData.value };
      }
      
      throw new Error('Google credentials not found');
    } catch (error) {
      console.error('Error fetching Google credentials:', error);
      toast({
        title: "Credentials Error",
        description: "Failed to fetch Google API credentials. Please check your setup.",
        variant: "destructive",
      });
      return null;
    }
  };

  const loadGoogleIdentityServices = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window.google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  };

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
      console.log('Loading Google Identity Services...');
      await loadGoogleIdentityServices();
      
      console.log('Loading Google API...');
      await loadGoogleAPI();
      
      console.log('Fetching credentials...');
      const creds = credentials || await fetchCredentials();
      if (!creds) {
        throw new Error('No Google credentials available');
      }
      
      console.log('Initializing GAPI client...');
      return new Promise<void>((resolve, reject) => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: creds.apiKey,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
            
            console.log('Initializing OAuth token client...');
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: creds.clientId,
              scope: 'https://www.googleapis.com/auth/calendar',
              callback: (tokenResponse: any) => {
                console.log('Token received:', tokenResponse);
                if (tokenResponse.access_token) {
                  setAccessToken(tokenResponse.access_token);
                  window.gapi.client.setToken({ access_token: tokenResponse.access_token });
                  setIsConnected(true);
                  toast({
                    title: "Connected!",
                    description: "Successfully connected to Google Calendar.",
                  });
                }
              },
            });
            
            setTokenClient(client);
            console.log('Google Calendar initialization complete');
            resolve();
          } catch (error) {
            console.error('Error initializing GAPI client:', error);
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
  }, [toast, credentials]);

  const signInToGoogle = async () => {
    setLoading(true);
    try {
      console.log('Starting sign in process...');
      
      if (!tokenClient) {
        console.log('Token client not found, initializing...');
        await initializeGoogleCalendar();
      }

      const currentTokenClient = tokenClient || window.google?.accounts?.oauth2;
      
      if (!currentTokenClient) {
        throw new Error('Failed to get token client');
      }

      console.log('Requesting access token...');
      tokenClient.requestAccessToken();
      
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
      if (accessToken) {
        window.google.accounts.oauth2.revoke(accessToken, () => {
          console.log('Token revoked');
        });
      }
      
      setIsConnected(false);
      setAccessToken(null);
      window.gapi.client.setToken(null);
      
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
    if (!isConnected || !accessToken) return [];

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
