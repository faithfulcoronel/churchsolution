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
        <CardContent className="p-4 flex items-center space-x-3">
          <Icon className="h-6 w-6 text-primary" />
          <span className="font-medium text-foreground">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default QuickAccessCard;
