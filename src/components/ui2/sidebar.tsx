// src/components/ui2/sidebar.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  pinned: boolean;
  setPinned: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  defaultCollapsed?: boolean;
  defaultPinned?: boolean;
}

export function SidebarProvider({
  children,
  defaultOpen = false,
  defaultCollapsed = false,
  defaultPinned = true,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [pinned, setPinned] = React.useState(defaultPinned);

  const value = React.useMemo(
    () => ({ open, setOpen, collapsed, setCollapsed, pinned, setPinned }),
    [open, collapsed, pinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
}

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col h-full', className)} {...props} />
  )
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('sticky top-0 z-10', className)} {...props} />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-auto sticky bottom-0 z-10', className)} {...props} />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1', className)}
      {...props}
    />
  )
);
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-2 py-2', className)} {...props} />
  )
);
SidebarGroup.displayName = 'SidebarGroup';

export interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action?: 'open' | 'close' | 'toggle';
}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ action = 'toggle', onClick, className, ...props }, ref) => {
    const { open, setOpen } = useSidebar();
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (action === 'open') setOpen(true);
      else if (action === 'close') setOpen(false);
      else setOpen(!open);
      onClick?.(e);
    };
    return <button ref={ref} className={className} onClick={handleClick} {...props} />;
  }
);
SidebarTrigger.displayName = 'SidebarTrigger';

export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarTrigger
};
