
import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TaskManagerProps {
  onBack: () => void;
}

const TaskManager = ({ onBack }: TaskManagerProps) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review project proposal', completed: false, priority: 'high' },
    { id: 2, title: 'Call dentist for appointment', completed: false, priority: 'medium' },
    { id: 3, title: 'Buy groceries', completed: true, priority: 'low' }
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        title: newTask,
        completed: false,
        priority: 'medium'
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Manager</h2>
          <p className="text-gray-600">Stay organized and productive</p>
        </div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            {tasks.filter(t => !t.completed).length} pending, {tasks.filter(t => t.completed).length} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTask(task.id)}
                  className={task.completed ? 'bg-green-100 border-green-300' : ''}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManager;
