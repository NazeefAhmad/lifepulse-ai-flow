
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SweetMessage {
  id: string;
  content: string;
  is_ai_generated: boolean;
  created_at: string;
}

export interface MoodCheckin {
  id: string;
  mood: string;
  note: string;
  date: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: string;
  created_at: string;
}

export const useRelationshipData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sweetMessages, setSweetMessages] = useState<SweetMessage[]>([]);
  const [moodCheckins, setMoodCheckins] = useState<MoodCheckin[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [messagesResponse, moodsResponse, remindersResponse] = await Promise.all([
        supabase.from('sweet_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('mood_checkins').select('*').order('date', { ascending: false }),
        supabase.from('relationship_reminders').select('*').order('date', { ascending: true })
      ]);

      if (messagesResponse.error) throw messagesResponse.error;
      if (moodsResponse.error) throw moodsResponse.error;
      if (remindersResponse.error) throw remindersResponse.error;

      setSweetMessages(messagesResponse.data || []);
      setMoodCheckins(moodsResponse.data || []);
      setReminders(remindersResponse.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addSweetMessage = async (content: string, isAiGenerated = false) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sweet_messages')
        .insert({
          user_id: user.id,
          content,
          is_ai_generated: isAiGenerated
        })
        .select()
        .single();

      if (error) throw error;

      setSweetMessages(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Message saved successfully!",
      });
    } catch (error: any) {
      console.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "Failed to save message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addMoodCheckin = async (mood: string, note: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mood_checkins')
        .insert({
          user_id: user.id,
          mood,
          note
        })
        .select()
        .single();

      if (error) throw error;

      setMoodCheckins(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Mood check-in saved successfully!",
      });
    } catch (error: any) {
      console.error('Error adding mood checkin:', error);
      toast({
        title: "Error",
        description: "Failed to save mood check-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addReminder = async (title: string, date: string, type: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('relationship_reminders')
        .insert({
          user_id: user.id,
          title,
          date,
          type
        })
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      toast({
        title: "Success",
        description: "Reminder added successfully!",
      });
    } catch (error: any) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    sweetMessages,
    moodCheckins,
    reminders,
    loading,
    addSweetMessage,
    addMoodCheckin,
    addReminder,
    refetch: fetchData
  };
};
