
import React, { useState } from 'react';
import { Heart, Brain, MessageCircle, Calendar, Gift, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const RelationshipCare = () => {
  const [customMessage, setCustomMessage] = useState('');

  const messageIdeas = [
    "Hey beautiful! Just thinking about how your smile brightens my entire day. Hope you're having an amazing time! ✨",
    "Missing you already! Can't wait to hear about your day when we talk tonight. You're incredible! 💕",
    "Random reminder: You're the best thing that happened to me. Hope your day is as wonderful as you are! 🌟",
    "Sending you virtual hugs and good vibes! Remember, I believe in you and everything you do! 🤗",
  ];

  const upcomingReminders = [
    { date: '2024-01-25', event: 'Monthly Date Night', type: 'date', daysAway: 2 },
    { date: '2024-01-28', event: 'Her Birthday Month Celebration', type: 'special', daysAway: 5 },
    { date: '2024-02-14', event: 'Valentine\'s Day', type: 'holiday', daysAway: 22 },
  ];

  const moodCheckIns = [
    { date: '2024-01-23', mood: 'Happy', note: 'Great day at work, excited about weekend plans' },
    { date: '2024-01-22', mood: 'Stressed', note: 'Big presentation tomorrow, feeling nervous' },
    { date: '2024-01-21', mood: 'Loved', note: 'Amazing dinner date, felt so special' },
  ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'date': return <Heart className="h-4 w-4" />;
      case 'special': return <Gift className="h-4 w-4" />;
      case 'holiday': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'date': return 'bg-pink-100 text-pink-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'holiday': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodColor = (mood) => {
    switch (mood.toLowerCase()) {
      case 'happy': return 'bg-green-100 text-green-800';
      case 'loved': return 'bg-pink-100 text-pink-800';
      case 'excited': return 'bg-yellow-100 text-yellow-800';
      case 'stressed': return 'bg-orange-100 text-orange-800';
      case 'sad': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relationship Care</h2>
          <p className="text-gray-600">Nurture your relationships with AI insights</p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Sweet Message Generator */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Brain className="h-5 w-5" />
            AI-Generated Sweet Messages
          </CardTitle>
          <CardDescription>
            Thoughtful message ideas to brighten her day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messageIdeas.map((message, index) => (
            <div key={index} className="p-4 bg-white rounded-lg border border-pink-100">
              <p className="text-gray-700 mb-3">"{message}"</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Send
                </Button>
                <Button size="sm" variant="ghost">
                  Customize
                </Button>
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-pink-100">
            <label className="text-sm font-medium mb-2 block">Create Your Own Message</label>
            <Textarea
              placeholder="Write a personalized message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mb-3"
            />
            <Button size="sm">
              <Heart className="h-4 w-4 mr-1" />
              Generate AI Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Reminders
          </CardTitle>
          <CardDescription>
            Important dates and events to remember
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingReminders.map((reminder, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getEventColor(reminder.type)}`}>
                    {getEventIcon(reminder.type)}
                  </div>
                  <div>
                    <p className="font-medium">{reminder.event}</p>
                    <p className="text-sm text-gray-500">{reminder.date}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {reminder.daysAway} days away
                </Badge>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add New Reminder
          </Button>
        </CardContent>
      </Card>

      {/* Mood Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Recent Mood Check-ins
          </CardTitle>
          <CardDescription>
            Keep track of how she's feeling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moodCheckIns.map((checkIn, index) => (
              <div key={index} className="p-3 rounded-lg border border-gray-100">
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
          
          <Button className="w-full mt-4" variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Add Mood Check-in
          </Button>
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
            Patterns and suggestions for a stronger relationship
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Communication Pattern</h4>
              <p className="text-sm text-gray-600">
                You both seem happiest when you have quality conversation time in the evenings. 
                Consider scheduling regular evening calls or dates.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Thoughtful Gesture Suggestion</h4>
              <p className="text-sm text-gray-600">
                She mentioned being stressed about work lately. A surprise care package or 
                relaxing activity might be the perfect gesture this week.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Anniversary Alert</h4>
              <p className="text-sm text-gray-600">
                Your 6-month anniversary is coming up in 3 weeks. Start planning something special!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelationshipCare;
