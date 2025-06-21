import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollableProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical' | 'both';
  className?: string;
  children: React.ReactNode;
  hideScrollbar?: boolean;
  shadow?: boolean;
  height?: string;
}

const Scrollable = React.forwardRef<HTMLDivElement, ScrollableProps>(
  ({ 
    className, 
    orientation = 'vertical', 
    children, 
    hideScrollbar = false,
    shadow = true,
    height,
    ...props 
  }, ref) => {
    const [isScrolling, setIsScrolling] = React.useState(false);
    const scrollTimeout = React.useRef<NodeJS.Timeout>();

    const handleScroll = React.useCallback(() => {
      setIsScrolling(true);
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }, []);

    React.useEffect(() => {
      return () => {
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        onScroll={handleScroll}
        style={height ? { height } : undefined}
        className={cn(
          'relative',
          // Orientation classes
          orientation === 'horizontal' && 'overflow-x-auto',
          orientation === 'vertical' && 'overflow-y-auto',
          orientation === 'both' && 'overflow-auto',
          // Scrollbar styles
          !hideScrollbar && [
            'scrollbar-thin',
            'scrollbar-track-transparent',
            // Semi-transparent scrollbar thumb
            'scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-gray-600/50',
            'hover:scrollbar-thumb-gray-400/70 dark:hover:scrollbar-thumb-gray-500/70',
            // Transition for scrollbar visibility
            'transition-all duration-300 ease-in-out',
            isScrolling ? 'scrollbar-visible' : 'scrollbar-hidden'
          ],
          hideScrollbar && 'scrollbar-none',
          // Shadow gradient
          shadow && [
            'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-4',
            'after:bg-gradient-to-t after:from-background/80 after:to-transparent',
            'after:pointer-events-none after:transition-opacity after:duration-300',
            'after:backdrop-blur-[1px]'
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Scrollable.displayName = 'Scrollable';

export { Scrollable };