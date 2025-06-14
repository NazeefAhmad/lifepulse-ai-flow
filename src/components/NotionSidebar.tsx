
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu, 
  Home, 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  Heart,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';

interface NotionSidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NotionSidebar = ({ 
  activeModule, 
  setActiveModule, 
  collapsed, 
  onToggleCollapse 
}: NotionSidebarProps) => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'Daily Planner', icon: Calendar },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'relationship', label: 'Relationships', icon: Heart },
  ];

  if (collapsed) {
    return (
      <div className="fixed left-0 top-0 h-full w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-8 h-8 p-0 mb-6 hover:bg-gray-100"
        >
          <Menu className="h-4 w-4 text-gray-600" />
        </Button>
        
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveModule(item.id)}
            className={`w-8 h-8 p-0 mb-2 hover:bg-gray-100 ${
              activeModule === item.id ? 'bg-gray-100' : ''
            }`}
          >
            <item.icon className="h-4 w-4 text-gray-600" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-gray-50 border-r border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-6 h-6 p-0 hover:bg-gray-100"
          >
            <Menu className="h-4 w-4 text-gray-600" />
          </Button>
          <span className="font-medium text-gray-900 text-sm">
            {user?.email?.split('@')[0] || 'Workspace'}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-500 hover:border-gray-300 cursor-pointer">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveModule(item.id)}
              className={`w-full justify-start text-sm font-normal h-7 px-2 hover:bg-gray-100 ${
                activeModule === item.id 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-700'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Workspace Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>Workspace</span>
            <Button variant="ghost" size="sm" className="w-4 h-4 p-0 hover:bg-gray-100">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              <span className="text-xs mr-2">📊</span>
              Analytics
            </div>
            <div className="flex items-center px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              <span className="text-xs mr-2">⚙️</span>
              Settings
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-sm font-normal h-7 px-2 text-gray-700 hover:bg-gray-100"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default NotionSidebar;
