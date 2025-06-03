
import React from 'react';
import { Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GoogleCalendarSetup = () => {
  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Calendar className="h-5 w-5" />
          Google Calendar Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To use Google Calendar integration, you need to set up your own Google API credentials.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h4 className="font-semibold">Setup Steps:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to the Google Cloud Console</li>
            <li>Create a new project or select an existing one</li>
            <li>Enable the Google Calendar API</li>
            <li>Create credentials (OAuth 2.0 Client ID)</li>
            <li>Add your domain to authorized origins</li>
            <li>Add your API key and Client ID to environment variables</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Required Environment Variables:</h4>
          <code className="block bg-gray-100 p-2 rounded text-sm">
            VITE_GOOGLE_API_KEY=your_api_key_here<br/>
            VITE_GOOGLE_CLIENT_ID=your_client_id_here
          </code>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('https://console.developers.google.com/', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Google Cloud Console
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://developers.google.com/calendar/api/quickstart/js', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Setup Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSetup;
