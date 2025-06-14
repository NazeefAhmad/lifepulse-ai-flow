import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check, Clock, AlertCircle, Trash2, Calendar, Download, Upload, Bell, Users, Wifi, WifiOff, Zap, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TypingIndicator from './TypingIndicator';
import EmailAutocomplete from './EmailAutocomplete';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  due_date?: string;
  google_event_id?: string;
  created_at: string;
  updated_at: string;
  assigned_to_email?: string;
  assigned_to_name?: string;
}

interface TaskManagerProps {
  onBack: () => void;
}

const TaskManager = ({ onBack }: TaskManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, createTaskEvent, importTasksFromCalendar, bulkExportTasks } = useGoogleCalendar();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [assignedToEmail, setAssignedToEmail] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [syncToGoogle, setSyncToGoogle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isTyping, setIsTyping] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedTasks: Task[] = (data || []).map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status as 'pending' | 'in-progress' | 'completed'
      }));
      
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTaskAssignmentEmail = async (taskData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-task-assignment', {
        body: {
          taskTitle: taskData.title,
          taskDescription: taskData.description,
          assignedToEmail: taskData.assigned_to_email,
          assignedToName: taskData.assigned_to_name,
          assignedByEmail: user?.email,
          dueDate: taskData.due_date,
          priority: taskData.priority
        }
      });

      if (error) throw error;
      
      toast({
        title: "Task Assigned! 📧",
        description: `Assignment email sent to ${taskData.assigned_to_email}`,
      });
    } catch (error) {
      console.error('Error sending assignment email:', error);
      toast({
        title: "Email Failed",
        description: "Task created but email notification failed to send.",
        variant: "destructive",
      });
    }
  };

  const splitTasksFromText = (text: string): string[] => {
    const delimiters = ['\n', ';', ',', '|', '•', '-', '*'];
    let tasks = [text];
    
    delimiters.forEach(delimiter => {
      tasks = tasks.flatMap(task => 
        task.split(delimiter).map(t => t.trim()).filter(t => t.length > 0)
      );
    });
    
    return tasks.filter(task => task.length > 2);
  };

  const handleTaskInput = (value: string) => {
    setNewTask(value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const addBulkTasks = async () => {
    if (!newTask.trim() || !user) return;
    
    try {
      setLoading(true);
      
      const tasksToCreate = splitTasksFromText(newTask);
      
      if (tasksToCreate.length > 1) {
        toast({
          title: `✨ Creating ${tasksToCreate.length} tasks...`,
          description: "Processing your bulk task creation",
        });
      }
      
      const createdTasks = [];
      let hasGoogleSync = false;
      
      for (const taskTitle of tasksToCreate) {
        let googleEventId = null;
        
        if (syncToGoogle && isConnected && newDueDate) {
          const googleEvent = await createTaskEvent({
            title: taskTitle,
            dueDate: newDueDate,
            priority: newPriority
          });
          
          if (googleEvent) {
            googleEventId = googleEvent.id;
            hasGoogleSync = true;
          }
        }

        const taskData = {
          user_id: user.id,
          title: taskTitle,
          description: newDescription || null,
          priority: newPriority,
          status: 'pending',
          due_date: newDueDate || null,
          google_event_id: googleEventId,
          assigned_to_email: assignedToEmail || null,
          assigned_to_name: assignedToName || null
        };

        const { data, error } = await supabase
          .from('tasks')
          .insert([taskData])
          .select()
          .single();

        if (error) throw error;

        const newTaskData: Task = {
          ...data,
          priority: data.priority as 'low' | 'medium' | 'high',
          status: data.status as 'pending' | 'in-progress' | 'completed'
        };

        createdTasks.push(newTaskData);
        
        if (assignedToEmail) {
          await sendTaskAssignmentEmail({
            ...taskData,
            assigned_to_email: assignedToEmail,
            assigned_to_name: assignedToName
          });
        }
      }

      setTasks([...createdTasks, ...tasks]);
      
      setNewTask('');
      setNewDescription('');
      setNewDueDate('');
      setAssignedToEmail('');
      setAssignedToName('');
      
      toast({
        title: `🎉 ${createdTasks.length} Task${createdTasks.length > 1 ? 's' : ''} Created!`,
        description: hasGoogleSync ? "Tasks created and synced to Google Calendar." : "Tasks created successfully.",
      });
    } catch (error) {
      console.error('Error adding tasks:', error);
      toast({
        title: "❌ Error",
        description: "Failed to create tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 
                       currentStatus === 'pending' ? 'in-progress' : 'completed';

      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus as 'pending' | 'in-progress' | 'completed' } : task
      ));

      if (newStatus === 'completed') {
        toast({
          title: "Task Completed! 🎉",
          description: "Great job finishing this task!",
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Task Deleted",
        description: "Task has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Simple Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              {isTyping && <TypingIndicator />}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isConnected && (
              <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                <Calendar className="h-3 w-3 mr-1" />
                Synced
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Add Task */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="What needs to be done? (separate multiple tasks with commas)"
                  value={newTask}
                  onChange={(e) => handleTaskInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addBulkTasks()}
                  className="text-lg font-medium bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  onClick={addBulkTasks} 
                  disabled={!newTask.trim() || loading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Advanced Options - Collapsible */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date</label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Assign To</label>
                  <EmailAutocomplete
                    emailValue={assignedToEmail}
                    nameValue={assignedToName}
                    onEmailChange={setAssignedToEmail}
                    onNameChange={setAssignedToName}
                    emailPlaceholder="Email address"
                    namePlaceholder="Name"
                  />
                </div>
              </div>

              {splitTasksFromText(newTask).length > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    ✨ Will create {splitTasksFromText(newTask).length} tasks
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simple Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'in-progress', 'completed'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status as any)}
                className="capitalize"
              >
                {status === 'all' ? 'All' : status.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredTasks.map((task) => (
                <Card key={task.id} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="p-2 hover:bg-gray-50 rounded-full flex-shrink-0"
                      >
                        {getStatusIcon(task.status)}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          {task.google_event_id && (
                            <Calendar className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {task.due_date && (
                            <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                          {task.assigned_to_email && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.assigned_to_name || task.assigned_to_email}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredTasks.length === 0 && (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No tasks found</h3>
                    <p className="text-gray-500">
                      {searchTerm || filterStatus !== 'all' 
                        ? "Try adjusting your search or filters." 
                        : "Create your first task to get started! ✨"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
