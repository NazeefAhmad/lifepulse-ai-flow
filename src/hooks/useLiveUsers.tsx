
import { useState, useEffect } from 'react';

export const useLiveUsers = () => {
  const [liveUsersCount, setLiveUsersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveUsers = async () => {
      try {
        const response = await fetch('https://hoocup.onrender.com/users');
        if (!response.ok) {
          throw new Error('Failed to fetch live users');
        }
        const data = await response.json();
        // Assuming the API returns a number or an object with count
        const count = typeof data === 'number' ? data : data.count || data.total || 0;
        setLiveUsersCount(count);
        setError(null);
      } catch (err) {
        console.error('Error fetching live users:', err);
        setError('Failed to load live users');
        setLiveUsersCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveUsers();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { liveUsersCount, loading, error };
};
