
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EmailSuggestion {
  email: string;
  name?: string;
  lastUsed: string;
}

export const useEmailSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('assigned_to_email, assigned_to_name, updated_at')
        .eq('user_id', user.id)
        .not('assigned_to_email', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Create unique suggestions map
      const uniqueSuggestions = new Map<string, EmailSuggestion>();
      
      data?.forEach(task => {
        if (task.assigned_to_email && !uniqueSuggestions.has(task.assigned_to_email)) {
          uniqueSuggestions.set(task.assigned_to_email, {
            email: task.assigned_to_email,
            name: task.assigned_to_name || undefined,
            lastUsed: task.updated_at
          });
        }
      });

      setSuggestions(Array.from(uniqueSuggestions.values()));
    } catch (error) {
      console.error('Error fetching email suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
  }, [user]);

  const filterSuggestions = (query: string): EmailSuggestion[] => {
    if (!query.trim()) return suggestions.slice(0, 5);
    
    const lowercaseQuery = query.toLowerCase();
    return suggestions.filter(suggestion => 
      suggestion.email.toLowerCase().includes(lowercaseQuery) ||
      suggestion.name?.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 5);
  };

  return {
    suggestions,
    filterSuggestions,
    loading,
    refreshSuggestions: fetchSuggestions
  };
};
