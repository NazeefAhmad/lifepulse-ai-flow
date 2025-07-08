
import React from 'react';
import { Calendar, Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface CompactCalendarConnectProps {
  onCalendarClick?: () => void;
}

const CompactCalendarConnect = ({ onCalendarClick }: CompactCalendarConnectProps) => {
  const { isConnected, loading, signInToGoogle, credentialsSet, isSyncing } = useGoogleCalendar();

  if (!credentialsSet) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
        <Settings className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Calendar setup needed</span>
        <Button variant="ghost" size="sm" onClick={onCalendarClick}>
          Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
      <Calendar className="h-4 w-4 text-blue-600" />
      {isConnected ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Calendar Connected</span>
          <Badge variant="secondary" className={`${isSyncing ? 'animate-pulse bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {isSyncing ? 'Syncing...' : 'Real-time Sync'}
          </Badge>
        </>
      ) : (
        <>
          <span className="text-sm text-blue-700">Connect Calendar</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signInToGoogle}
            disabled={loading}
            className="text-blue-600 hover:bg-blue-100"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        </>
      )}
    </div>
  );
};

export default CompactCalendarConnect;
