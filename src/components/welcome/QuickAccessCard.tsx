import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui2/card';

interface QuickAccessCardProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

export function QuickAccessCard({ icon: Icon, label, to }: QuickAccessCardProps) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium text-foreground">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default QuickAccessCard;
