
import React, { useState } from 'react';
import { BookOpen, Brain, Heart, TrendingUp, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

const MicroJournal = () => {
  const [todayEntry, setTodayEntry] = useState('');
  const [moodScore, setMoodScore] = useState([7]);

  const journalEntries = [
    { 
      date: '2024-01-23', 
      entry: 'Great day at work! Completed the API integration and had a good workout session.', 
      mood: 8,
      tags: ['productive', 'healthy', 'work']
    },
    { 
      date: '2024-01-22', 
      entry: 'Feeling a bit overwhelmed with deadlines, but girlfriend surprised me with dinner.', 
      mood: 6,
      tags: ['stressed', 'grateful', 'relationship']
    },
    { 
      date: '2024-01-21', 
      entry: 'Perfect Sunday! Went for a long drive and spent quality time with family.', 
      mood: 9,
      tags: ['relaxed', 'family', 'adventure']
    },
  ];

  const getMoodEmoji = (mood) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😔';
  };

  const getMoodColor = (mood) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-yellow-600';
    if (mood >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Micro Journal</h2>
          <p className="text-gray-600">Quick daily reflections with AI insights</p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Today's Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Today's Reflection
          </CardTitle>
          <CardDescription>
            How was your day? Just a line or two is enough.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What made today special? How are you feeling?"
            value={todayEntry}
            onChange={(e) => setTodayEntry(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mood Score</label>
              <span className="text-lg">{getMoodEmoji(moodScore[0])} {moodScore[0]}/10</span>
            </div>
            <Slider
              value={moodScore}
              onValueChange={setMoodScore}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <Button className="w-full">
            <Heart className="h-4 w-4 mr-2" />
            Save Today's Entry
          </Button>
        </CardContent>
      </Card>

      {/* AI Weekly Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Brain className="h-5 w-5" />
            AI Weekly Summary
          </CardTitle>
          <CardDescription>
            Here's what I've noticed about your week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Mood Trend</h4>
              <p className="text-sm text-gray-600">
                Your mood has been consistently positive this week (avg 7.8/10). 
                Work achievements and relationship moments seem to boost your happiness most.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Key Patterns</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">Productive weeks = Better mood</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Family time = High happiness</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">Exercise = Consistent energy</Badge>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Suggestion</h4>
              <p className="text-sm text-gray-600">
                Consider scheduling more "quality time" activities with loved ones. 
                They consistently show up in your happiest entries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journalEntries.map((entry, index) => (
              <div key={index} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    {new Date(entry.date).toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className={`text-lg ${getMoodColor(entry.mood)}`}>
                    {getMoodEmoji(entry.mood)} {entry.mood}/10
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{entry.entry}</p>
                
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroJournal;
