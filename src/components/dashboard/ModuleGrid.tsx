
import React from 'react';
import { Check, Brain, Heart, BookOpen, DollarSign, Bell } from 'lucide-react';
import ModuleCard from './ModuleCard';

interface ModuleGridProps {
  setActiveModule: (module: string) => void;
}

const ModuleGrid = ({ setActiveModule }: ModuleGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ModuleCard
        icon={<Check className="h-6 w-6" />}
        title="Smart Task Manager"
        description="AI-prioritized tasks for maximum productivity"
        color="green"
        onClick={() => setActiveModule('tasks')}
        status="3 urgent tasks"
      />
      
      <ModuleCard
        icon={<Brain className="h-6 w-6" />}
        title="Daily Planner"
        description="AI-optimized schedule for your day"
        color="blue"
        onClick={() => setActiveModule('planner')}
        status="Next: Team Meeting at 2 PM"
      />
      
      <ModuleCard
        icon={<Heart className="h-6 w-6" />}
        title="Relationship Care"
        description="Nurture your relationships with AI insights"
        color="pink"
        onClick={() => setActiveModule('relationship')}
        status="Send a sweet message today"
      />
      
      <ModuleCard
        icon={<BookOpen className="h-6 w-6" />}
        title="Micro Journal"
        description="Quick daily reflections with AI summaries"
        color="purple"
        onClick={() => setActiveModule('journal')}
        status="Today's mood: Great!"
      />
      
      <ModuleCard
        icon={<DollarSign className="h-6 w-6" />}
        title="Expense Logger"
        description="Track spending with smart categorization"
        color="orange"
        onClick={() => setActiveModule('expenses')}
        status="₹340 spent today"
      />
      
      <ModuleCard
        icon={<Bell className="h-6 w-6" />}
        title="Smart Reminders"
        description="Never miss what matters most"
        color="indigo"
        onClick={() => {}}
        status="2 reminders set"
      />
    </div>
  );
};

export default ModuleGrid;
