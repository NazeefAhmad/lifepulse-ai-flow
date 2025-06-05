
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface NotificationPreferences {
  id: string;
  task_reminders_enabled: boolean;
  reminder_days_before: number;
  reminder_hours_before: number;
}

export const useTaskNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotificationPreferences();
    }
  }, [user]);

  const loadNotificationPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default preferences
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert([{
            user_id: user.id,
            task_reminders_enabled: true,
            reminder_days_before: 1,
            reminder_hours_before: 24
          }])
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('id', preferences.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      toast({
        title: "Settings Updated",
        description: "Notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    }
  };

  const checkTasksNeedingReminders = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.rpc('get_tasks_needing_reminders');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking tasks needing reminders:', error);
      return [];
    }
  };

  const sendTaskReminder = async (taskData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-task-reminder', {
        body: {
          taskId: taskData.task_id,
          userId: taskData.user_id,
          taskTitle: taskData.title,
          dueDate: taskData.due_date,
          assignedToEmail: taskData.assigned_to_email,
          daysUntilDue: taskData.days_until_due
        }
      });

      if (error) throw error;

      // Record that reminder was sent
      await supabase
        .from('task_notifications')
        .insert([{
          task_id: taskData.task_id,
          user_id: taskData.user_id,
          notification_type: 'reminder'
        }]);

      return true;
    } catch (error) {
      console.error('Error sending task reminder:', error);
      return false;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    checkTasksNeedingReminders,
    sendTaskReminder
  };
};
