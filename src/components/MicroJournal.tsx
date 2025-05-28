
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Plus, Heart, Brain, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface JournalEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'low' | 'bad';
  content: string;
  gratitude?: string;
  goals?: string;
}

interface MicroJournalProps {
  onBack: () => void;
}

const MicroJournal = ({ onBack }: MicroJournalProps) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: '2025-05-28',
      mood: 'great',
      content: 'Had a productive day at work. Completed the presentation and received positive feedback from the team.',
      gratitude: 'Grateful for my supportive team members',
      goals: 'Continue working on project milestones'
    },
    {
      id: '2',
      date: '2025-05-27',
      mood: 'good',
      content: 'Quiet day, focused on reading and learning new skills. Went for a walk in the evening.',
      gratitude: 'Grateful for peaceful moments',
      goals: 'Practice meditation tomorrow'
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    mood: 'good' as JournalEntry['mood'],
    content: '',
    gratitude: '',
    goals: ''
  });

  const addEntry = () => {
    if (!newEntry.content.trim()) {
      toast({
        title: "Error",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...newEntry
    };

    setEntries([entry, ...entries]);
    setNewEntry({
      mood: 'good',
      content: '',
      gratitude: '',
      goals: ''
    });

    toast({
      title: "Entry Added",
      description: "Your journal entry has been saved.",
    });
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'bad': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'great': return '😄';
      case 'good': return '😊';
      case 'neutral': return '😐';
      case 'low': return '😔';
      case 'bad': return '😞';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Micro Journal</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            New Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">How are you feeling today?</label>
            <select
              value={newEntry.mood}
              onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value as JournalEntry['mood'] })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="great">😄 Great</option>
              <option value="good">😊 Good</option>
              <option value="neutral">😐 Neutral</option>
              <option value="low">😔 Low</option>
              <option value="bad">😞 Bad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">What happened today?</label>
            <Textarea
              placeholder="Write about your day, thoughts, feelings..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              What are you grateful for?
            </label>
            <Textarea
              placeholder="Something you're thankful for today..."
              value={newEntry.gratitude}
              onChange={(e) => setNewEntry({ ...newEntry, gratitude: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Tomorrow's goals
            </label>
            <Textarea
              placeholder="What do you want to achieve tomorrow?"
              value={newEntry.goals}
              onChange={(e) => setNewEntry({ ...newEntry, goals: e.target.value })}
              rows={2}
            />
          </div>

          <Button onClick={addEntry} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Previous Entries
        </h2>
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">{entry.date}</span>
                <Badge className={getMoodColor(entry.mood)}>
                  {getMoodIcon(entry.mood)} {entry.mood}
                </Badge>
              </div>
              
              <p className="text-gray-800 mb-3">{entry.content}</p>
              
              {entry.gratitude && (
                <div className="bg-pink-50 p-3 rounded-lg mb-2">
                  <div className="flex items-center gap-2 text-pink-800 font-medium mb-1">
                    <Heart className="h-4 w-4" />
                    Grateful for:
                  </div>
                  <p className="text-pink-700">{entry.gratitude}</p>
                </div>
              )}
              
              {entry.goals && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 font-medium mb-1">
                    <Sun className="h-4 w-4" />
                    Tomorrow's goals:
                  </div>
                  <p className="text-yellow-700">{entry.goals}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MicroJournal;
