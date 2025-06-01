import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Calendar, Sparkles, Send, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRelationshipData } from '@/hooks/useRelationshipData';
import { useAIMessageGeneration } from '@/hooks/useAIMessageGeneration';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface RelationshipCareProps {
  onBack: () => void;
}

const RelationshipCare = ({ onBack }: RelationshipCareProps) => {
  const { toast } = useToast();
  const {
    sweetMessages,
    moodCheckins,
    reminders,
    loading,
    addSweetMessage,
    addMoodCheckin,
    addReminder
  } = useRelationshipData();

  const { generateMessage, loading: aiLoading } = useAIMessageGeneration();
  const { isConnected, createReminderEvent } = useGoogleCalendar();

  const [activeTab, setActiveTab] = useState<'messages' | 'mood' | 'reminders'>('messages');
  const [newMessage, setNewMessage] = useState('');
  const [newMood, setNewMood] = useState({
    mood: 'happy',
    note: ''
  });
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: '',
    type: 'date',
    syncToGoogle: false
  });

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;
    await addSweetMessage(newMessage);
    setNewMessage('');
  };

  const handleGenerateAIMessage = async () => {
    const recentMood = moodCheckins[0]?.mood;
    const aiMessage = await generateMessage({
      type: 'sweet_message',
      context: { recentMood }
    });

    if (aiMessage) {
      await addSweetMessage(aiMessage, true);
    }
  };

  const handleAddMoodCheckin = async () => {
    if (!newMood.mood) return;
    await addMoodCheckin(newMood.mood, newMood.note);
    setNewMood({ mood: 'happy', note: '' });
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'content': return '😌';
      case 'neutral': return '😐';
      case 'sad': return '😢';
      case 'stressed': return '😰';
      default: return '😊';
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.date) return;
    
    // Add to local storage
    await addReminder(newReminder.title, newReminder.date, newReminder.type);
    
    // Sync to Google Calendar if enabled
    if (newReminder.syncToGoogle && isConnected) {
      const googleEvent = await createReminderEvent({
        title: newReminder.title,
        date: newReminder.date,
        type: newReminder.type
      });
      
      if (googleEvent) {
        toast({
          title: "Reminder Added & Synced",
          description: "Reminder added and synced to Google Calendar.",
        });
      }
    }
    
    setNewReminder({ title: '', date: '', type: 'date', syncToGoogle: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Relationship Care</h1>
        {isConnected && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Calendar className="h-3 w-3 mr-1" />
            Google Calendar Connected
          </Badge>
        )}
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'messages' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('messages')}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Sweet Messages
        </Button>
        <Button
          variant={activeTab === 'mood' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('mood')}
          className="flex-1"
        >
          <Heart className="h-4 w-4 mr-2" />
          Mood Check-ins
        </Button>
        <Button
          variant={activeTab === 'reminders' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('reminders')}
          className="flex-1"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Reminders
        </Button>
      </div>

      {activeTab === 'messages' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Create Sweet Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write a sweet message for your loved one..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddMessage} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  onClick={handleGenerateAIMessage} 
                  variant="outline" 
                  disabled={aiLoading}
                  className="flex-1"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {aiLoading ? 'Generating...' : 'AI Generate'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Messages</h3>
            {sweetMessages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-600">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                    {message.is_ai_generated && (
                      <Badge variant="outline" className="text-purple-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mood' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Mood Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                <select
                  value={newMood.mood}
                  onChange={(e) => setNewMood({ ...newMood, mood: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="happy">😊 Happy</option>
                  <option value="excited">🤩 Excited</option>
                  <option value="content">😌 Content</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="sad">😢 Sad</option>
                  <option value="stressed">😰 Stressed</option>
                </select>
              </div>
              <Textarea
                placeholder="Any notes about your mood today?"
                value={newMood.note}
                onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
                rows={3}
              />
              <Button onClick={handleAddMoodCheckin} className="w-full">
                Save Mood Check-in
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mood History</h3>
            {moodCheckins.map((checkin) => (
              <Card key={checkin.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMoodEmoji(checkin.mood)}</span>
                      <span className="font-medium capitalize">{checkin.mood}</span>
                    </div>
                    <span className="text-sm text-gray-600">{checkin.date}</span>
                  </div>
                  {checkin.note && <p className="text-gray-700">{checkin.note}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Add Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Reminder title (e.g., Anniversary dinner)"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              />
              <Input
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
              />
              <select
                value={newReminder.type}
                onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="date">Special Date</option>
                <option value="gift">Gift Idea</option>
                <option value="activity">Activity</option>
                <option value="surprise">Surprise</option>
              </select>
              
              {isConnected && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newReminder.syncToGoogle}
                    onChange={(e) => setNewReminder({ ...newReminder, syncToGoogle: e.target.checked })}
                    className="rounded"
                  />
                  Sync to Google Calendar
                </label>
              )}
              
              <Button onClick={handleAddReminder} className="w-full">
                Add Reminder
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upcoming Reminders</h3>
            {reminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{reminder.title}</h4>
                      <p className="text-sm text-gray-600">{reminder.date}</p>
                    </div>
                    <Badge variant="outline">{reminder.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipCare;
