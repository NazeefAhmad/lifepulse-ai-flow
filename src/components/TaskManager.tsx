import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check, Clock, AlertCircle, Trash2, Calendar, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
}

interface TaskManagerProps {
  onBack: () => void;
}

const TaskManager = ({ onBack }: TaskManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isConnected, createTaskEvent } = useGoogleCalendar();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [syncToGoogle, setSyncToGoogle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

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
      
      // Type cast to ensure proper types
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

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    
    try {
      setLoading(true);
      
      let googleEventId = null;
      
      // Create Google Calendar event if sync is enabled
      if (syncToGoogle && isConnected && newDueDate) {
        const googleEvent = await createTaskEvent({
          title: newTask,
          dueDate: newDueDate,
          priority: newPriority
        });
        
        if (googleEvent) {
          googleEventId = googleEvent.id;
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: newTask,
          description: newDescription || null,
          priority: newPriority,
          status: 'pending',
          due_date: newDueDate || null,
          google_event_id: googleEventId
        }])
        .select()
        .single();

      if (error) throw error;

      // Type cast the new task
      const newTaskData: Task = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high',
        status: data.status as 'pending' | 'in-progress' | 'completed'
      };

      setTasks([newTaskData, ...tasks]);
      setNewTask('');
      setNewDescription('');
      setNewDueDate('');
      
      toast({
        title: "Task Added",
        description: googleEventId ? "Task added and synced to Google Calendar." : "Task added successfully.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
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
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Task Manager
          </h1>
        </div>
        
        {isConnected && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Calendar className="h-3 w-3 mr-1" />
            Google Calendar Connected
          </Badge>
        )}
      </div>
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Task title..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="font-medium"
              />
              <Input
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              
              {isConnected && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={syncToGoogle}
                    onChange={(e) => setSyncToGoogle(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Sync to Google Calendar
                </label>
              )}
              
              <Button 
                onClick={addTask} 
                disabled={!newTask.trim() || loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className={`transition-all border-2 ${getStatusColor(task.status)} ${
                task.status === 'completed' ? 'opacity-75' : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="p-2 hover:bg-white/50 rounded-full"
                    >
                      {getStatusIcon(task.status)}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        {task.google_event_id && (
                          <Calendar className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {task.due_date && (
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        )}
                        <span>•</span>
                        <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      
                      <Badge variant="outline" className="capitalize">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredTasks.length === 0 && !loading && (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                    ? "Try adjusting your filters or search term." 
                    : "Start by adding your first task!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManager;
