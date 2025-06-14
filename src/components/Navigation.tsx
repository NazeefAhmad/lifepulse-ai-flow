
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
    <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                LifeSync AI
              </h1>
              <p className="text-sm text-slate-600">Your personal companion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveModule('dashboard')}
              className={`border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-800 rounded-xl px-4 py-2 shadow-sm transition-all duration-200 ${
                activeModule === 'dashboard' ? 'bg-slate-100 text-slate-800' : ''
              }`}
            >
              🏠 Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
              className="border border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 rounded-xl px-4 py-2 shadow-sm transition-all duration-200"
            >
              👋 Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
