
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NoInternetScreenProps {
  onRetry: () => void;
}

const NoInternetScreen = ({ onRetry }: NoInternetScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-2 border-gray-200 shadow-xl">
        <CardContent className="text-center p-8 space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <WifiOff className="h-8 w-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">No Internet Connection</h2>
            <p className="text-gray-600">
              Please check your internet connection and try again.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <div className="text-sm text-gray-500">
              <p>Make sure you're connected to:</p>
              <ul className="mt-2 space-y-1">
                <li>• Wi-Fi or mobile data</li>
                <li>• VPN (if required)</li>
                <li>• Stable network connection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoInternetScreen;
