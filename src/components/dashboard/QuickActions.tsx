
import React, { useState } from 'react';
import { Plus, CheckSquare, DollarSign, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  onTaskAdded?: (task: string) => void;
  onExpenseAdded?: (amount: number, description: string) => void;
  onMoodLogged?: (mood: string) => void;
}

const QuickActions = ({ onTaskAdded, onExpenseAdded, onMoodLogged }: QuickActionsProps) => {
  const { toast } = useToast();
  const [quickTask, setQuickTask] = useState('');
  const [quickExpense, setQuickExpense] = useState({ amount: '', description: '' });
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleQuickTask = () => {
    if (!quickTask.trim()) return;
    onTaskAdded?.(quickTask);
    setQuickTask('');
    toast({
      title: "Task Added",
      description: "Quick task has been added to your list.",
    });
  };

  const handleQuickExpense = () => {
    if (!quickExpense.amount || !quickExpense.description) return;
    onExpenseAdded?.(parseFloat(quickExpense.amount), quickExpense.description);
    setQuickExpense({ amount: '', description: '' });
    toast({
      title: "Expense Logged",
      description: "Quick expense has been recorded.",
    });
  };

  const handleQuickMood = (mood: string) => {
    onMoodLogged?.(mood);
    toast({
      title: "Mood Logged",
      description: `Mood set to ${mood}.`,
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          <Plus className={`h-6 w-6 transition-transform ${showQuickActions ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="fixed bottom-24 right-6 z-50 w-80">
          <Card className="shadow-xl border-2">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg">Quick Actions</h3>
              
              {/* Quick Task */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Add Task</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="What needs to be done?"
                    value={quickTask}
                    onChange={(e) => setQuickTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickTask()}
                    className="flex-1"
                  />
                  <Button onClick={handleQuickTask} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {/* Quick Expense */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Log Expense</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="₹0"
                    value={quickExpense.amount}
                    onChange={(e) => setQuickExpense({ ...quickExpense, amount: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    placeholder="Description"
                    value={quickExpense.description}
                    onChange={(e) => setQuickExpense({ ...quickExpense, description: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickExpense()}
                    className="flex-1"
                  />
                  <Button onClick={handleQuickExpense} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {/* Quick Mood */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium">Log Mood</span>
                </div>
                <div className="flex gap-1">
                  {['😄', '😊', '😐', '😔', '😞'].map((emoji, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickMood(['great', 'good', 'neutral', 'low', 'bad'][index])}
                      className="text-lg p-2"
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
