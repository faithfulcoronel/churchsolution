import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Loader2 } from 'lucide-react';

interface ProgressDialogProps {
  open: boolean;
  title?: string;
  message?: string;
}

export function ProgressDialog({ open, title = 'Processing', message }: ProgressDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="flex flex-col items-center space-y-4">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
      </DialogContent>
    </Dialog>
  );
}
