import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check, Clock, AlertCircle, Trash2, Calendar, Sparkles, Download, Upload, Bell, Users, Wifi, WifiOff, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TaskFilters from './TaskFilters';
import TypingIndicator from './TypingIndicator';
import NoInternetScreen from './NoInternetScreen';
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
  const { preferences: notificationPrefs, updatePreferences } = useTaskNotifications();
  
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
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
  // New filter state
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [dueDateStart, setDueDateStart] = useState('');
  const [dueDateEnd, setDueDateEnd] = useState('');
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

  const handleImportFromCalendar = async () => {
    try {
      const importedTasks = await importTasksFromCalendar();
      
      if (importedTasks.length > 0) {
        // Add imported tasks to database
        const tasksToInsert = importedTasks.map(task => ({
          ...task,
          user_id: user?.id
        }));

        const { data, error } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();

        if (error) throw error;

        // Update local state
        const newTasks: Task[] = (data || []).map(task => ({
          ...task,
          priority: task.priority as 'low' | 'medium' | 'high',
          status: task.status as 'pending' | 'in-progress' | 'completed'
        }));

        setTasks([...newTasks, ...tasks]);
      }
    } catch (error) {
      console.error('Error importing tasks:', error);
      toast({
        title: "Import Error",
        description: "Failed to import tasks from Google Calendar.",
        variant: "destructive",
      });
    }
  };

  const handleBulkExport = async () => {
    const unSyncedTasks = tasks.filter(task => !task.google_event_id && task.status !== 'completed');
    if (unSyncedTasks.length === 0) {
      toast({
        title: "No Tasks to Export",
        description: "All tasks are already synced or completed.",
      });
      return;
    }

    await bulkExportTasks(unSyncedTasks);
    // Refresh tasks to get updated google_event_ids
    await loadTasks();
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
    // Split by common delimiters that indicate separate tasks
    const delimiters = ['\n', ';', ',', '|', '•', '-', '*'];
    let tasks = [text];
    
    delimiters.forEach(delimiter => {
      tasks = tasks.flatMap(task => 
        task.split(delimiter).map(t => t.trim()).filter(t => t.length > 0)
      );
    });
    
    // Filter out very short tasks (likely not meaningful)
    return tasks.filter(task => task.length > 2);
  };

  const handleTaskInput = (value: string) => {
    setNewTask(value);
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
    
    // Check if input contains multiple tasks
    const potentialTasks = splitTasksFromText(value);
    if (potentialTasks.length > 1) {
      // Show preview of how many tasks will be created
      console.log(`Will create ${potentialTasks.length} tasks:`, potentialTasks);
    }
  };

  const addBulkTasks = async () => {
    if (!newTask.trim() || !user) return;
    
    try {
      setLoading(true);
      
      const tasksToCreate = splitTasksFromText(newTask);
      console.log('Creating bulk tasks:', tasksToCreate);
      
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
        
        // Send assignment email if task is assigned to someone
        if (assignedToEmail) {
          await sendTaskAssignmentEmail({
            ...taskData,
            assigned_to_email: assignedToEmail,
            assigned_to_name: assignedToName
          });
        }
      }

      setTasks([...createdTasks, ...tasks]);
      
      // Reset form
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
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = !assigneeFilter || 
                           task.assigned_to_email?.toLowerCase().includes(assigneeFilter.toLowerCase()) ||
                           task.assigned_to_name?.toLowerCase().includes(assigneeFilter.toLowerCase());
    
    let matchesDateRange = true;
    if (dueDateStart || dueDateEnd) {
      const taskDate = task.due_date ? new Date(task.due_date) : null;
      if (taskDate) {
        const startDate = dueDateStart ? new Date(dueDateStart) : null;
        const endDate = dueDateEnd ? new Date(dueDateEnd) : null;
        
        if (startDate && taskDate < startDate) matchesDateRange = false;
        if (endDate && taskDate > endDate) matchesDateRange = false;
      } else {
        matchesDateRange = false; // Exclude tasks without due dates when date filter is active
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDateRange;
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPriority('all');
    setAssigneeFilter('');
    setDueDateStart('');
    setDueDateEnd('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Simplified Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-blue-600" />
                  Task Manager
                </h1>
                {isTyping && <TypingIndicator />}
              </div>
              <p className="text-gray-600 text-sm mt-1">Organize and track your tasks efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Network status */}
            <div className="flex items-center gap-2 text-sm">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {isConnected && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportFromCalendar}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
            
            {isConnected && (
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                <Calendar className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Simplified Add Task Card */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add New Task
            </CardTitle>
            <p className="text-sm text-gray-600">
              💡 Tip: Separate multiple tasks with commas or new lines to create them all at once
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="What needs to be done?"
                  value={newTask}
                  onChange={(e) => handleTaskInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addBulkTasks()}
                  className="font-medium bg-white border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
                {splitTasksFromText(newTask).length > 1 && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    ✨ Will create {splitTasksFromText(newTask).length} tasks
                  </div>
                )}
              </div>
              <Input
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            
            {/* Enhanced Assignment Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Assign Task (Optional)</span>
              </div>
              <EmailAutocomplete
                emailValue={assignedToEmail}
                nameValue={assignedToName}
                onEmailChange={setAssignedToEmail}
                onNameChange={setAssignedToName}
                emailPlaceholder="Type email to see suggestions..."
                namePlaceholder="Assignee name"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-sm"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
              
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-auto"
              />
              
              {isConnected && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={syncToGoogle}
                    onChange={(e) => setSyncToGoogle(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <Calendar className="h-4 w-4" />
                  Sync to Calendar
                </label>
              )}
              
              <Button 
                onClick={addBulkTasks} 
                disabled={!newTask.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                {splitTasksFromText(newTask).length > 1 
                  ? `Create ${splitTasksFromText(newTask).length} Tasks` 
                  : assignedToEmail ? 'Create & Assign' : 'Create Task'}
              </Button>
            </div>

            {assignedToEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>{assignedToName || assignedToEmail}</strong> will receive an email notification
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simplified Filter Section */}
        <TaskFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onStatusChange={(value) => setFilterStatus(value as 'all' | 'pending' | 'in-progress' | 'completed')}
          filterPriority={filterPriority}
          onPriorityChange={(value) => setFilterPriority(value as 'all' | 'low' | 'medium' | 'high')}
          assigneeFilter={assigneeFilter}
          onAssigneeChange={setAssigneeFilter}
          dueDateStart={dueDateStart}
          onDueDateStartChange={setDueDateStart}
          dueDateEnd={dueDateEnd}
          onDueDateEndChange={setDueDateEnd}
          filteredCount={filteredTasks.length}
          totalCount={tasks.length}
          onClearFilters={clearAllFilters}
        />

        {/* Simplified Tasks List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`transition-all bg-white border border-gray-200 hover:shadow-md ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="p-2 hover:bg-gray-50 rounded-full"
                      >
                        {getStatusIcon(task.status)}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'} truncate`}>
                            {task.title}
                          </h3>
                          {task.google_event_id && (
                            <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                          {task.assigned_to_email && (
                            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full flex-shrink-0">
                              <Users className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-blue-700 truncate max-w-24">
                                {task.assigned_to_name || task.assigned_to_email}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {task.due_date && (
                            <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                          {task.due_date && <span>•</span>}
                          <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority}
                        </Badge>
                        
                        <Badge variant="outline" className="capitalize text-xs">
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTasks.length === 0 && !loading && (
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No tasks found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                      ? "Try adjusting your filters or search term." 
                      : "Create your first task to get started! ✨"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
