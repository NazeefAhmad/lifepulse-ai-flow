
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface MessageRequest {
  type: string;
  context?: any;
}

export const useAIMessageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateMessage = async (request: MessageRequest): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-message', {
        body: request
      });

      if (error) {
        console.error('AI generation error:', error);
        toast({
          title: "AI Generation Failed",
          description: "Failed to generate AI message. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      return data?.message || null;
    } catch (error) {
      console.error('Error generating AI message:', error);
      toast({
        title: "Error",
        description: "An error occurred while generating the message.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateMessage, loading };
};
