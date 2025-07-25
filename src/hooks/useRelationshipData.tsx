
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface SweetMessage {
  id: string;
  content: string;
  created_at: string;
  is_ai_generated: boolean;
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  type: string;
}

export const useRelationshipData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sweetMessages, setSweetMessages] = useState<SweetMessage[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load sweet messages
      const { data: messages } = await supabase
        .from('sweet_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (messages) setSweetMessages(messages);

      // Load reminders
      const { data: reminderData } = await supabase
        .from('relationship_reminders')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: true });

      if (reminderData) setReminders(reminderData);
    } catch (error) {
      console.error('Error loading relationship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSweetMessage = async (content: string, isAiGenerated = false) => {
    try {
      const { error } = await supabase
        .from('sweet_messages')
        .insert({
          user_id: user?.id,
          content,
          is_ai_generated: isAiGenerated
        });

      if (error) throw error;

      toast({
        title: "Message Saved",
        description: "Your sweet message has been saved.",
      });

      loadData();
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "Failed to save message.",
        variant: "destructive",
      });
    }
  };

  const addReminder = async (title: string, date: string, type: string) => {
    try {
      const { error } = await supabase
        .from('relationship_reminders')
        .insert({
          user_id: user?.id,
          title,
          date,
          type
        });

      if (error) throw error;

      toast({
        title: "Reminder Added",
        description: "Your reminder has been saved.",
      });

      loadData();
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to save reminder.",
        variant: "destructive",
      });
    }
  };

  return {
    sweetMessages,
    reminders,
    loading,
    addSweetMessage,
    addReminder
  };
};
