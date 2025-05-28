
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIMessageRequest {
  type: 'sweet_message' | 'mood_suggestion' | 'reminder_suggestion';
  context?: {
    mood?: string;
    recentMood?: string;
    [key: string]: any;
  };
}

export const useAIMessageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateMessage = async (request: AIMessageRequest): Promise<string | null> => {
    setLoading(true);
    try {
      console.log('Generating AI message with request:', request);
      
      // Get the current session to ensure we have auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No active session found');
      }
      
      const { data, error } = await supabase.functions.invoke('generate-ai-message', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data?.message) {
        throw new Error('No message generated');
      }

      console.log('Generated message:', data.message);
      return data.message;

    } catch (error: any) {
      console.error('Error generating AI message:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI message. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateMessage,
    loading
  };
};
