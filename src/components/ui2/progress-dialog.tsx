import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogOverlay } from './dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Progress } from './progress';

interface ProgressDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  progress?: number;
}

const ProgressDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onEscapeKeyDown={(e) => e.preventDefault()}
      onPointerDownOutside={(e) => e.preventDefault()}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg dark:border-border',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
ProgressDialogContent.displayName = 'ProgressDialogContent';

export function ProgressDialog({ open, title = 'Processing', message, progress }: ProgressDialogProps) {
  return (
    <Dialog open={open}>
      <ProgressDialogContent className="flex flex-col items-center space-y-4">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {typeof progress === 'number' ? (
          <Progress value={progress} showValue className="w-full" />
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
        {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
      </ProgressDialogContent>
    </Dialog>
  );
}
