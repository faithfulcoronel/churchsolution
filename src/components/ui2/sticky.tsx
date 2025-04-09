import * as React from 'react';
import { cn } from '@/lib/utils';

interface StickyProps extends React.HTMLAttributes<HTMLDivElement> {
  offset?: number;
  position?: 'top' | 'bottom';
  fullWidth?: boolean;
  shadow?: boolean;
  zIndex?: number;
  children: React.ReactNode;
}

const Sticky = React.forwardRef<HTMLDivElement, StickyProps>(
  ({ 
    className,
    children,
    offset = 0,
    position = 'top',
    fullWidth = false,
    shadow = true,
    zIndex = 30,
    ...props 
  }, ref) => {
    const [isSticky, setIsSticky] = React.useState(false);
    const stickyRef = React.useRef<HTMLDivElement>(null);
    const spacerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([e]) => {
          setIsSticky(!e.isIntersecting);
        },
        {
          threshold: [1],
          rootMargin: `${position === 'top' ? -offset : offset}px 0px ${position === 'bottom' ? -offset : offset}px 0px`
        }
      );

      if (spacerRef.current) {
        observer.observe(spacerRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [offset, position]);

    // Update spacer height when content changes
    React.useEffect(() => {
      const updateSpacerHeight = () => {
        if (stickyRef.current && spacerRef.current && isSticky) {
          spacerRef.current.style.height = `${stickyRef.current.offsetHeight}px`;
        }
      };

      updateSpacerHeight();

      // Create ResizeObserver to watch for content changes
      const resizeObserver = new ResizeObserver(updateSpacerHeight);
      if (stickyRef.current) {
        resizeObserver.observe(stickyRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [isSticky]);

    return (
      <>
        {/* Spacer div to prevent layout shift */}
        <div ref={spacerRef} />
        
        {/* Sticky content */}
        <div
          ref={ref}
          className={cn(
            'w-full',
            position === 'top' ? 'top-0' : 'bottom-0',
            isSticky && [
              'fixed',
              'bg-background',
              shadow && 'shadow-md',
              fullWidth ? 'left-0 right-0' : 'left-[inherit] right-[inherit]'
            ],
            className
          )}
          style={{
            zIndex,
            [position]: isSticky ? `${offset}px` : undefined,
          }}
          {...props}
        >
          <div ref={stickyRef}>
            {children}
          </div>
        </div>
      </>
    );
  }
);

Sticky.displayName = 'Sticky';

export { Sticky };