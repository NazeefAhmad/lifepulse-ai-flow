import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Clock, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  syncedToGoogle?: boolean;
}

interface TaskManagerProps {
  onBack: () => void;
}

const TaskManager = ({ onBack }: TaskManagerProps) => {
  const { toast } = useToast();
  const { isConnected, createTaskEvent } = useGoogleCalendar();
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project presentation',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2025-05-30',
      createdAt: '2025-05-28'
    },
    {
      id: '2',
      title: 'Review quarterly reports',
      priority: 'medium',
      status: 'pending',
      dueDate: '2025-05-29',
      createdAt: '2025-05-28'
    },
    {
      id: '3',
      title: 'Team meeting preparation',
      priority: 'high',
      status: 'pending',
      createdAt: '2025-05-28'
    }
  ]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [syncToGoogle, setSyncToGoogle] = useState(false);

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      priority: newPriority,
      status: 'pending',
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Sync to Google Calendar if enabled
    if (syncToGoogle && isConnected && newDueDate) {
      const googleEvent = await createTaskEvent({
        title: newTask,
        dueDate: newDueDate,
        priority: newPriority
      });
      
      if (googleEvent) {
        task.syncedToGoogle = true;
        toast({
          title: "Task Added & Synced",
          description: "Task added to your list and Google Calendar.",
        });
      }
    } else {
      toast({
        title: "Task Added",
        description: "Your task has been added successfully.",
      });
    }
    
    setTasks([task, ...tasks]);
    setNewTask('');
    setNewDueDate('');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Task has been removed from your list.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Smart Task Manager</h1>
        {isConnected && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Calendar className="h-3 w-3 mr-1" />
            Google Calendar Connected
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter task description..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <Input
                type="date"
                placeholder="Due date (optional)"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="flex-1"
              />
              
              {isConnected && (
                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={syncToGoogle}
                    onChange={(e) => setSyncToGoogle(e.target.checked)}
                    className="rounded"
                  />
                  Sync to Google Calendar
                </label>
              )}
              
              <Button onClick={addTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`transition-all ${task.status === 'completed' ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTaskStatus(task.id)}
                    className="p-1"
                  >
                    {getStatusIcon(task.status)}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                        {task.title}
                      </p>
                      {task.syncedToGoogle && (
                        <Calendar className="h-4 w-4 text-green-600" title="Synced to Google Calendar" />
                      )}
                    </div>
                    {task.dueDate && (
                      <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                    )}
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
