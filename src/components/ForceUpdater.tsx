
import React, { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ForceUpdater = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30000);
    checkForUpdates(); // Initial check
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      // In a real app, you'd check against your backend/CDN for new versions
      const lastUpdateCheck = localStorage.getItem('lastUpdateCheck');
      const now = Date.now();
      
      // Simulate update available every 5 minutes for demo
      if (!lastUpdateCheck || now - parseInt(lastUpdateCheck) > 300000) {
        setUpdateAvailable(true);
        localStorage.setItem('lastUpdateCheck', now.toString());
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear localStorage except for important data
      const keysToKeep = ['supabase.auth.token', 'user-preferences'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
          localStorage.removeItem(key);
        }
      });
      
      toast({
        title: "Update Complete! 🎉",
        description: "The app has been refreshed with the latest version.",
      });
      
      // Force reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error during force update:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the app. Please refresh manually.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setUpdateAvailable(false);
    }
  };

  if (!updateAvailable && !isUpdating) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-2 border-blue-200 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          Update Available
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          A new version of the app is available. Update now for the latest features and improvements.
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={handleForceUpdate}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update Now'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setUpdateAvailable(false)}
            disabled={isUpdating}
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForceUpdater;
