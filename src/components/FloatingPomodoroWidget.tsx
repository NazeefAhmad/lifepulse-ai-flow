
import React, { useState } from 'react';
import { Timer, Play, Pause, Square, Minimize2, Maximize2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePomodoroContext } from '@/contexts/PomodoroContext';

const FloatingPomodoroWidget = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const {
    isActive,
    isPaused,
    timeLeft,
    currentSession,
    sessionCount,
    startTimer,
    pauseTimer,
    stopTimer,
    formatTime,
    progress
  } = usePomodoroContext();

  if (!isActive && timeLeft === 25 * 60 && sessionCount === 0) {
    return null; // Don't show if timer hasn't been started
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
        <CardContent className={`transition-all duration-300 ${isMinimized ? 'p-2' : 'p-4'}`}>
          {isMinimized ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></div>
              <span className="font-mono text-sm font-bold text-purple-600">
                {formatTime(timeLeft)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(false)}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-purple-600" />
                  <Badge variant={currentSession === 'focus' ? 'default' : 'secondary'} className="text-xs">
                    {currentSession === 'focus' ? 'Focus' : 'Break'} #{sessionCount + 1}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-purple-600 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={progress} className="h-2 mb-3" />
              </div>

              <div className="flex justify-center gap-2">
                {!isActive ? (
                  <Button onClick={startTimer} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="sm" variant="outline">
                    <Pause className="h-3 w-3 mr-1" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
                
                <Button onClick={stopTimer} size="sm" variant="destructive">
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </div>
              
              {isActive && (
                <Badge 
                  variant="destructive" 
                  className="animate-pulse w-full justify-center text-xs"
                >
                  {isPaused ? 'Paused' : 'Running'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingPomodoroWidget;
