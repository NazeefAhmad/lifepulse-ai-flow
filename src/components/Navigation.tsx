
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const Navigation = ({ activeModule, setActiveModule }: NavigationProps) => {
  const { signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LifeSync AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveModule('dashboard')}
              className={activeModule === 'dashboard' ? 'bg-blue-50 border-blue-200' : ''}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
