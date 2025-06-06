
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Calendar, Clock, Target, Heart, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsInsightsProps {
  onBack: () => void;
}

interface AnalyticsData {
  focusData: any[];
  moodData: any[];
  taskData: any[];
  expenseData: any[];
  weeklyStats: any;
  monthlyStats: any;
}

const AnalyticsInsights = ({ onBack }: AnalyticsInsightsProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [data, setData] = useState<AnalyticsData>({
    focusData: [],
    moodData: [],
    taskData: [],
    expenseData: [],
    weeklyStats: {},
    monthlyStats: {}
  });

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'quarter':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Load focus sessions data
      const { data: focusData } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      // Load mood data
      const { data: moodData } = await supabase
        .from('mood_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      // Load tasks data
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      // Load expense data
      const { data: expenseData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      // Process data for charts
      const processedData = processAnalyticsData({
        focusData: focusData || [],
        moodData: moodData || [],
        taskData: taskData || [],
        expenseData: expenseData || []
      });

      setData(processedData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (rawData: any) => {
    // Process focus data by day
    const focusDataByDay = rawData.focusData.reduce((acc: any, session: any) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = { date, totalMinutes: 0, sessions: 0 };
      }
      acc[date].totalMinutes += session.duration_minutes;
      acc[date].sessions += 1;
      return acc;
    }, {});

    // Process mood data
    const moodDataByDay = rawData.moodData.reduce((acc: any, mood: any) => {
      const date = mood.date;
      const moodScore = getMoodScore(mood.mood);
      if (!acc[date]) {
        acc[date] = { date, mood: moodScore, count: 1 };
      } else {
        acc[date].mood = (acc[date].mood * acc[date].count + moodScore) / (acc[date].count + 1);
        acc[date].count += 1;
      }
      return acc;
    }, {});

    // Process task completion data
    const taskDataByDay = rawData.taskData.reduce((acc: any, task: any) => {
      const date = task.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, created: 0, completed: 0 };
      }
      acc[date].created += 1;
      if (task.status === 'completed') {
        acc[date].completed += 1;
      }
      return acc;
    }, {});

    // Process expense data
    const expenseDataByDay = rawData.expenseData.reduce((acc: any, expense: any) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      acc[date].amount += parseFloat(expense.amount);
      acc[date].count += 1;
      return acc;
    }, {});

    // Calculate weekly/monthly stats
    const totalFocusTime = rawData.focusData.reduce((sum: number, session: any) => sum + session.duration_minutes, 0);
    const totalTasks = rawData.taskData.length;
    const completedTasks = rawData.taskData.filter((task: any) => task.status === 'completed').length;
    const totalExpenses = rawData.expenseData.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);
    const avgMood = rawData.moodData.length > 0 
      ? rawData.moodData.reduce((sum: number, mood: any) => sum + getMoodScore(mood.mood), 0) / rawData.moodData.length 
      : 0;

    return {
      focusData: Object.values(focusDataByDay),
      moodData: Object.values(moodDataByDay),
      taskData: Object.values(taskDataByDay),
      expenseData: Object.values(expenseDataByDay),
      weeklyStats: {
        totalFocusTime,
        totalTasks,
        completedTasks,
        totalExpenses,
        avgMood,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      },
      monthlyStats: {
        totalFocusTime,
        totalTasks,
        completedTasks,
        totalExpenses,
        avgMood
      }
    };
  };

  const getMoodScore = (mood: string) => {
    const moodScores: { [key: string]: number } = {
      'excellent': 10,
      'good': 8,
      'neutral': 6,
      'low': 4,
      'stressed': 2
    };
    return moodScores[mood] || 6;
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff8042'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics & Insights
              </h1>
              <p className="text-gray-600">Track your productivity patterns and progress</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {['week', 'month', 'quarter'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                onClick={() => setTimeRange(range as 'week' | 'month' | 'quarter')}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Focus Time</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {Math.floor(data.weeklyStats.totalFocusTime / 60)}h {data.weeklyStats.totalFocusTime % 60}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Task Completion</p>
                  <p className="text-3xl font-bold text-green-800">
                    {data.weeklyStats.completionRate?.toFixed(0) || 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg Mood</p>
                  <p className="text-3xl font-bold text-purple-800">
                    {data.weeklyStats.avgMood?.toFixed(1) || 0}/10
                  </p>
                </div>
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Total Expenses</p>
                  <p className="text-3xl font-bold text-orange-800">
                    ₹{data.weeklyStats.totalExpenses?.toFixed(0) || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="focus" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="focus">Focus Trends</TabsTrigger>
            <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
            <TabsTrigger value="tasks">Task Analytics</TabsTrigger>
            <TabsTrigger value="expenses">Expense Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="focus">
            <Card>
              <CardHeader>
                <CardTitle>Focus Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.focusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="totalMinutes" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mood">
            <Card>
              <CardHeader>
                <CardTitle>Mood Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.moodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#82ca9d" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Creation vs Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.taskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="created" fill="#ffc658" name="Created" />
                    <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Daily Spending Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsInsights;
