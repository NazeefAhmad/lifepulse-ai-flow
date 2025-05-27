
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Plus, Heart, Brain, Smile } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface MicroJournalProps {
  onBack: () => void;
}

const MicroJournal = ({ onBack }: MicroJournalProps) => {
  const [entries, setEntries] = useState([
    { 
      id: 1, 
      content: 'Had a great meeting today. Feeling productive and motivated!', 
      mood: 'happy',
      date: new Date().toLocaleDateString()
    },
    { 
      id: 2, 
      content: 'Grateful for my family and friends. Life is good.', 
      mood: 'grateful',
      date: new Date(Date.now() - 86400000).toLocaleDateString()
    }
  ]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');

  const addEntry = () => {
    if (newEntry.trim()) {
      setEntries([{
        id: Date.now(),
        content: newEntry,
        mood: selectedMood,
        date: new Date().toLocaleDateString()
      }, ...entries]);
      setNewEntry('');
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-yellow-100 text-yellow-800';
      case 'grateful': return 'bg-green-100 text-green-800';
      case 'excited': return 'bg-blue-100 text-blue-800';
      case 'peaceful': return 'bg-purple-100 text-purple-800';
      case 'reflective': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="h-4 w-4" />;
      case 'grateful': return <Heart className="h-4 w-4" />;
      case 'excited': return <Brain className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const moods = ['happy', 'grateful', 'excited', 'peaceful', 'reflective'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Micro Journal</h2>
          <p className="text-gray-600">Capture your thoughts and moments</p>
        </div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind? How are you feeling today?"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-24"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Mood:</span>
            {moods.map((mood) => (
              <Button
                key={mood}
                size="sm"
                variant={selectedMood === mood ? "default" : "outline"}
                onClick={() => setSelectedMood(mood)}
                className="capitalize"
              >
                {mood}
              </Button>
            ))}
          </div>
          <Button onClick={addEntry} disabled={!newEntry.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Entries
          </CardTitle>
          <CardDescription>
            {entries.length} entries recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{entry.date}</span>
                  <Badge className={getMoodColor(entry.mood)}>
                    {getMoodIcon(entry.mood)}
                    <span className="ml-1 capitalize">{entry.mood}</span>
                  </Badge>
                </div>
                <p className="text-gray-700">{entry.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroJournal;
