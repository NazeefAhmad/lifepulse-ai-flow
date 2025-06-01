
import React, { useState } from 'react';
import { Plus, CheckSquare, DollarSign, Heart, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuickActionsProps {
  onDataUpdated?: () => void;
}

const QuickActions = ({ onDataUpdated }: QuickActionsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [quickTask, setQuickTask] = useState('');
  const [quickExpense, setQuickExpense] = useState({ amount: '', description: '' });
  const [quickFocus, setQuickFocus] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleQuickTask = async () => {
    if (!quickTask.trim() || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: quickTask,
          priority: 'medium',
          status: 'pending'
        }]);

      if (error) throw error;

      setQuickTask('');
      onDataUpdated?.();
      toast({
        title: "Task Added! ✅",
        description: "Quick task has been added to your list.",
      });
    } catch (error) {
      console.error('Error adding quick task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExpense = async () => {
    if (!quickExpense.amount || !quickExpense.description || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          user_id: user.id,
          amount: parseFloat(quickExpense.amount),
          description: quickExpense.description,
          category: 'quick-add'
        }]);

      if (error) throw error;

      setQuickExpense({ amount: '', description: '' });
      onDataUpdated?.();
      toast({
        title: "Expense Logged! 💰",
        description: "Quick expense has been recorded.",
      });
    } catch (error) {
      console.error('Error adding quick expense:', error);
      toast({
        title: "Error",
        description: "Failed to log expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFocus = async () => {
    if (!quickFocus || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('focus_sessions')
        .insert([{
          user_id: user.id,
          duration_minutes: parseInt(quickFocus)
        }]);

      if (error) throw error;

      setQuickFocus('');
      onDataUpdated?.();
      toast({
        title: "Focus Session Logged! 🎯",
        description: `${quickFocus} minutes of focus time recorded.`,
      });
    } catch (error) {
      console.error('Error adding focus session:', error);
      toast({
        title: "Error",
        description: "Failed to log focus session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMood = async (mood: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('mood_checkins')
        .insert([{
          user_id: user.id,
          mood: mood
        }]);

      if (error) throw error;

      onDataUpdated?.();
      toast({
        title: "Mood Logged! 😊",
        description: `Mood set to ${mood}.`,
      });
    } catch (error) {
      console.error('Error logging mood:', error);
      toast({
        title: "Error",
        description: "Failed to log mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-4 border-white"
          size="lg"
        >
          <Plus className={`h-8 w-8 transition-transform duration-300 ${showQuickActions ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="fixed bottom-28 right-6 z-50 w-96">
          <Card className="shadow-2xl border-2 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quick Actions
                </h3>
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              
              {/* Quick Task */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-green-700">Add Task</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="What needs to be done?"
                    value={quickTask}
                    onChange={(e) => setQuickTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickTask()}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleQuickTask} 
                    size="sm"
                    disabled={loading || !quickTask.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Quick Expense */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-orange-700">Log Expense</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="₹0"
                    value={quickExpense.amount}
                    onChange={(e) => setQuickExpense({ ...quickExpense, amount: e.target.value })}
                    className="w-24"
                    disabled={loading}
                  />
                  <Input
                    placeholder="What did you buy?"
                    value={quickExpense.description}
                    onChange={(e) => setQuickExpense({ ...quickExpense, description: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickExpense()}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleQuickExpense} 
                    size="sm"
                    disabled={loading || !quickExpense.amount || !quickExpense.description}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Quick Focus Session */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-blue-700">Log Focus Time</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={quickFocus}
                    onChange={(e) => setQuickFocus(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickFocus()}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleQuickFocus} 
                    size="sm"
                    disabled={loading || !quickFocus}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Log
                  </Button>
                </div>
              </div>

              {/* Quick Mood */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <Heart className="h-4 w-4 text-pink-600" />
                  </div>
                  <span className="font-semibold text-pink-700">How are you feeling?</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { emoji: '😄', mood: 'happy', label: 'Happy' },
                    { emoji: '😊', mood: 'content', label: 'Content' },
                    { emoji: '😐', mood: 'neutral', label: 'Neutral' },
                    { emoji: '😔', mood: 'sad', label: 'Sad' },
                    { emoji: '😫', mood: 'stressed', label: 'Stressed' }
                  ].map(({ emoji, mood, label }) => (
                    <Button
                      key={mood}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickMood(mood)}
                      disabled={loading}
                      className="text-2xl p-3 hover:scale-110 transition-transform"
                      title={label}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default QuickActions;
