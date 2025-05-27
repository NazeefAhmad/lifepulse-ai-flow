
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'green' | 'blue' | 'pink' | 'purple' | 'orange' | 'indigo';
  onClick: () => void;
  status: string;
}

const ModuleCard = ({ icon, title, description, color, onClick, status }: ModuleCardProps) => {
  const colorMap = {
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
  };

  return (
    <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white mb-3`}>
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
