import React, { useState } from 'react';
import { Heart, Brain, MessageCircle, Calendar, Gift, ArrowLeft, Plus, Send, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useRelationshipData } from '@/hooks/useRelationshipData';
import { useAIMessageGeneration } from '@/hooks/useAIMessageGeneration';
import { useToast } from '@/hooks/use-toast';

const RelationshipCare = () => {
  const { user, signOut } = useAuth();
  const { sweetMessages, moodCheckins, reminders, loading, addSweetMessage, addMoodCheckin, addReminder } = useRelationshipData();
  const { generateMessage, loading: aiLoading } = useAIMessageGeneration();
  const { toast } = useToast();
  
  const [customMessage, setCustomMessage] = useState('');
  const [newMood, setNewMood] = useState('');
  const [newMoodNote, setNewMoodNote] = useState('');
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderType, setNewReminderType] = useState('general');

  const handleGenerateAIMessage = async (type: 'sweet_message' | 'mood_suggestion' | 'reminder_suggestion', context?: any) => {
    const message = await generateMessage({ type, context });
    if (message) {
      if (type === 'sweet_message') {
        await addSweetMessage(message, true);
      } else if (type === 'reminder_suggestion') {
        setNewReminderTitle(message);
        toast({
          title: "AI Suggestion Generated!",
          description: "Check the reminder form below - I've added a suggestion for you.",
        });
      }
    }
  };

  const handleSendMessage = async (message: string, isAi = false) => {
    await addSweetMessage(message, isAi);
    if (!isAi) {
      setCustomMessage('');
    }
  };

  const handleAddMoodCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMood || !newMoodNote) return;
    
    await addMoodCheckin(newMood, newMoodNote);
    setNewMood('');
    setNewMoodNote('');
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle || !newReminderDate) return;
    
    await addReminder(newReminderTitle, newReminderDate, newReminderType);
    setNewReminderTitle('');
    setNewReminderDate('');
    setNewReminderType('general');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'date': return <Heart className="h-4 w-4" />;
      case 'special': return <Gift className="h-4 w-4" />;
      case 'holiday': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'date': return 'bg-pink-100 text-pink-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'holiday': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy': return 'bg-green-100 text-green-800';
      case 'loved': return 'bg-pink-100 text-pink-800';
      case 'excited': return 'bg-yellow-100 text-yellow-800';
      case 'stressed': return 'bg-orange-100 text-orange-800';
      case 'sad': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysAway = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="h-8 w-8 animate-pulse text-pink-500 mx-auto mb-4" />
          <p>Loading your relationship data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relationship Care</h2>
          <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || 'there'}!</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>

      {/* AI-Powered Sweet Message Generator */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Sparkles className="h-5 w-5" />
            AI Sweet Messages
          </CardTitle>
          <CardDescription>
            Get personalized sweet messages powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Generation Controls */}
          <div className="flex gap-3 flex-wrap">
            <Button 
              size="sm" 
              onClick={() => handleGenerateAIMessage('sweet_message')}
              disabled={aiLoading}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
              Generate Sweet Message
            </Button>
            
            {moodCheckins.length > 0 && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleGenerateAIMessage('sweet_message', { recentMood: moodCheckins[0]?.mood })}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Heart className="h-4 w-4 mr-1" />}
                Based on Recent Mood
              </Button>
            )}
          </div>
          
          {/* Custom Message */}
          <div className="p-4 bg-white rounded-lg border border-pink-100">
            <label className="text-sm font-medium mb-2 block">Create Your Own Message</label>
            <Textarea
              placeholder="Write a personalized message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mb-3"
            />
            <Button 
              size="sm" 
              onClick={() => handleSendMessage(customMessage)}
              disabled={!customMessage.trim()}
            >
              <Heart className="h-4 w-4 mr-1" />
              Save Message
            </Button>
          </div>

          {/* Recent Messages */}
          {sweetMessages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Your Recent Messages</h4>
              {sweetMessages.slice(0, 3).map((message) => (
                <div key={message.id} className="p-3 bg-white rounded-lg border border-pink-100">
                  <p className="text-gray-700 text-sm">{message.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {message.is_ai_generated && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Smart Reminders
          </CardTitle>
          <CardDescription>
            AI-powered suggestions for important dates and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {reminders.map((reminder) => {
              const daysAway = getDaysAway(reminder.date);
              return (
                <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getEventColor(reminder.type)}`}>
                      {getEventIcon(reminder.type)}
                    </div>
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-gray-500">{reminder.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {daysAway === 0 ? 'Today' : daysAway > 0 ? `${daysAway} days away` : `${Math.abs(daysAway)} days ago`}
                  </Badge>
                </div>
              );
            })}
          </div>
          
          {/* Add New Reminder Form with AI Suggestions */}
          <form onSubmit={handleAddReminder} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Add New Reminder</h4>
              <Button 
                type="button"
                size="sm" 
                variant="outline"
                onClick={() => handleGenerateAIMessage('reminder_suggestion')}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                AI Suggestion
              </Button>
            </div>
            <Input
              placeholder="Reminder title"
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              required
            />
            <Input
              type="date"
              value={newReminderDate}
              onChange={(e) => setNewReminderDate(e.target.value)}
              required
            />
            <Select value={newReminderType} onValueChange={setNewReminderType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="special">Special</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mood Check-ins with AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Mood Check-ins
          </CardTitle>
          <CardDescription>
            Track your relationship feelings with AI insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {moodCheckins.map((checkIn) => (
              <div key={checkIn.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">{checkIn.date}</span>
                  <Badge className={getMoodColor(checkIn.mood)}>
                    {checkIn.mood}
                  </Badge>
                </div>
                <p className="text-gray-700">{checkIn.note}</p>
              </div>
            ))}
          </div>
          
          {/* Add New Mood Check-in Form */}
          <form onSubmit={handleAddMoodCheckin} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Add Mood Check-in</h4>
            <Select value={newMood} onValueChange={setNewMood}>
              <SelectTrigger>
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Happy">Happy</SelectItem>
                <SelectItem value="Loved">Loved</SelectItem>
                <SelectItem value="Excited">Excited</SelectItem>
                <SelectItem value="Content">Content</SelectItem>
                <SelectItem value="Stressed">Stressed</SelectItem>
                <SelectItem value="Sad">Sad</SelectItem>
                <SelectItem value="Anxious">Anxious</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="How are things going? Any thoughts to share..."
              value={newMoodNote}
              onChange={(e) => setNewMoodNote(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={!newMood || !newMoodNote}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Add Check-in
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enhanced AI Relationship Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-5 w-5" />
            AI Relationship Insights
          </CardTitle>
          <CardDescription>
            Personalized patterns and suggestions based on your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moodCheckins.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Recent Mood Pattern</h4>
                <p className="text-sm text-gray-600">
                  Your most recent mood was "{moodCheckins[0]?.mood}". 
                  {moodCheckins[0]?.mood.toLowerCase() === 'happy' || moodCheckins[0]?.mood.toLowerCase() === 'loved' 
                    ? " That's wonderful! Keep nurturing those positive feelings."
                    : " Consider planning something special to brighten your relationship."
                  }
                </p>
                {(moodCheckins[0]?.mood.toLowerCase() === 'stressed' || moodCheckins[0]?.mood.toLowerCase() === 'sad') && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => handleGenerateAIMessage('mood_suggestion', { mood: moodCheckins[0]?.mood })}
                    disabled={aiLoading}
                  >
                    {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    Get AI Suggestion
                  </Button>
                )}
              </div>
            )}
            
            {reminders.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Upcoming Events</h4>
                <p className="text-sm text-gray-600">
                  You have {reminders.filter(r => getDaysAway(r.date) >= 0).length} upcoming reminders. 
                  Stay on top of these important moments to show you care!
                </p>
              </div>
            )}
            
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">AI Message Activity</h4>
              <p className="text-sm text-gray-600">
                You've saved {sweetMessages.length} messages so far 
                ({sweetMessages.filter(m => m.is_ai_generated).length} AI-generated). 
                {sweetMessages.length === 0 
                  ? "Start by generating some AI sweet messages to build your collection!"
                  : "Great job staying thoughtful! Your AI-powered messages are making your relationship stronger."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelationshipCare;
