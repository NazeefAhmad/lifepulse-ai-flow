
import React from 'react';
import { Check, Brain, Heart, BookOpen, DollarSign, Calendar } from 'lucide-react';
import ModuleCard from './ModuleCard';

interface ModuleGridProps {
  onModuleClick: (module: string) => void;
}

const ModuleGrid = ({ onModuleClick }: ModuleGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ModuleCard
        icon={<Check className="h-6 w-6" />}
        title="Smart Task Manager"
        description="AI-prioritized tasks with team collaboration"
        color="green"
        onClick={() => onModuleClick('tasks')}
        status="3 urgent tasks"
      />
      
      <ModuleCard
        icon={<Brain className="h-6 w-6" />}
        title="Daily Planner"
        description="AI-optimized schedule for your day"
        color="blue"
        onClick={() => onModuleClick('planner')}
        status="Next: Team Meeting at 2 PM"
      />
      
      <ModuleCard
        icon={<Heart className="h-6 w-6" />}
        title="Relationship Care"
        description="Nurture your relationships with AI insights"
        color="pink"
        onClick={() => onModuleClick('relationship')}
        status="Send a sweet message today"
      />
      
      <ModuleCard
        icon={<BookOpen className="h-6 w-6" />}
        title="Micro Journal"
        description="Quick daily reflections with AI summaries"
        color="purple"
        onClick={() => onModuleClick('journal')}
        status="Today's mood: Great!"
      />
      
      <ModuleCard
        icon={<DollarSign className="h-6 w-6" />}
        title="Expense Logger"
        description="Track spending with smart categorization"
        color="orange"
        onClick={() => onModuleClick('expenses')}
        status="₹340 spent today"
      />
      
      <ModuleCard
        icon={<Calendar className="h-6 w-6" />}
        title="Google Calendar"
        description="Connect and sync with Google Calendar"
        color="indigo"
        onClick={() => onModuleClick('calendar')}
        status="Connect your calendar"
      />
    </div>
  );
};

export default ModuleGrid;
