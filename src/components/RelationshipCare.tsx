
import React, { useState } from 'react';
import { Heart, Brain, MessageCircle, Calendar, Gift, ArrowLeft, Plus, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useRelationshipData } from '@/hooks/useRelationshipData';
import { useToast } from '@/hooks/use-toast';

const RelationshipCare = () => {
  const { user, signOut } = useAuth();
  const { sweetMessages, moodCheckins, reminders, loading, addSweetMessage, addMoodCheckin, addReminder } = useRelationshipData();
  const { toast } = useToast();
  
  const [customMessage, setCustomMessage] = useState('');
  const [newMood, setNewMood] = useState('');
  const [newMoodNote, setNewMoodNote] = useState('');
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderType, setNewReminderType] = useState('general');

  const aiMessageSuggestions = [
    "Hey beautiful! Just thinking about how your smile brightens my entire day. Hope you're having an amazing time! ✨",
    "Missing you already! Can't wait to hear about your day when we talk tonight. You're incredible! 💕",
    "Random reminder: You're the best thing that happened to me. Hope your day is as wonderful as you are! 🌟",
    "Sending you virtual hugs and good vibes! Remember, I believe in you and everything you do! 🤗",
  ];

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

      {/* Sweet Message Generator */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Brain className="h-5 w-5" />
            Sweet Messages
          </CardTitle>
          <CardDescription>
            Send thoughtful messages or save AI suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Suggestions */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">AI Suggestions</h4>
            {aiMessageSuggestions.map((message, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-pink-100">
                <p className="text-gray-700 mb-3">"{message}"</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSendMessage(message, true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Save Message
                  </Button>
                </div>
              </div>
            ))}
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
                      <Badge variant="outline" className="text-xs">AI Generated</Badge>
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

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reminders
          </CardTitle>
          <CardDescription>
            Important dates and events to remember
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
          
          {/* Add New Reminder Form */}
          <form onSubmit={handleAddReminder} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Add New Reminder</h4>
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

      {/* Mood Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Mood Check-ins
          </CardTitle>
          <CardDescription>
            Track your relationship feelings
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

      {/* AI Relationship Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-5 w-5" />
            AI Relationship Insights
          </CardTitle>
          <CardDescription>
            Patterns and suggestions based on your data
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
              <h4 className="font-medium text-blue-800 mb-2">Message Suggestion</h4>
              <p className="text-sm text-gray-600">
                You've saved {sweetMessages.length} messages so far. 
                {sweetMessages.length === 0 
                  ? "Start by saving some sweet messages to build your collection!"
                  : "Great job staying thoughtful! Consider sending one of your saved messages today."
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
