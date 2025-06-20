import React from 'react';
import { Building2, Users, DollarSign, Settings } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui2/dialog';
import { Button } from './ui2/button';
import { Card, CardContent } from './ui2/card';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchName: string;
}

export function WelcomeModal({ isOpen, onClose, churchName }: WelcomeModalProps) {
  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Track members, attendance, and ministry involvement'
    },
    {
      icon: DollarSign,
      title: 'Financial Management',
      description: 'Handle tithes, offerings, and expense tracking'
    },
    {
      icon: Settings,
      title: 'Church Settings',
      description: 'Customize your church profile and preferences'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Welcome to {churchName}!
            </DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground">
              Your church administration system is ready to use. Here's what you can do:
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} size="lg">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}