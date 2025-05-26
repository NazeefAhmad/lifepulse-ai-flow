
import React, { useState } from 'react';
import { Plus, Check, Clock, AlertCircle, Brain, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const TaskManager = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete project presentation', priority: 'high', completed: false, aiSuggested: true },
    { id: 2, title: 'Review code for API integration', priority: 'medium', completed: true, aiSuggested: false },
    { id: 3, title: 'Call mom about weekend plans', priority: 'low', completed: false, aiSuggested: true },
    { id: 4, title: 'Submit expense reports', priority: 'medium', completed: false, aiSuggested: false },
  ]);

  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        title: newTask,
        priority: 'medium',
        completed: false,
        aiSuggested: false
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Check className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Task Manager</h2>
          <p className="text-gray-600">AI-prioritized tasks for maximum productivity</p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Add Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-5 w-5" />
            AI Task Suggestions
          </CardTitle>
          <CardDescription>
            Based on your patterns, here are some suggested tasks for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium">Schedule 1-on-1 with team lead</p>
              <p className="text-sm text-gray-600">You haven't had a check-in this week</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium">Plan weekend trip with girlfriend</p>
              <p className="text-sm text-gray-600">It's been a while since your last adventure together</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`transition-all duration-200 ${task.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                    {task.aiSuggested && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <Brain className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)}
                      <span className="ml-1 capitalize">{task.priority}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
