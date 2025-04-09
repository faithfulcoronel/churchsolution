import * as React from 'react';
import { cn } from '@/lib/utils';
import { BaseProps } from './types';
import { Scrollable } from './scrollable';

interface ContainerProps extends BaseProps {
  fluid?: boolean;
  as?: keyof JSX.IntrinsicElements;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  scrollable?: boolean;
  hideScrollbar?: boolean;
  shadow?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl'
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    children, 
    fluid = false, 
    as: Component = 'div', 
    size = 'xl',
    scrollable = false,
    hideScrollbar = false,
    shadow = true,
    ...props 
  }, ref) => {
    const content = (
      <Component
        ref={ref}
        className={cn(
          'w-full',
          fluid ? '' : `${maxWidthClasses[size]} mx-auto`,
          'px-2 sm:px-4 lg:px-6',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );

    if (scrollable) {
      return (
        <Scrollable hideScrollbar={hideScrollbar} shadow={shadow}>
          {content}
        </Scrollable>
      );
    }

    return content;
  }
);

Container.displayName = 'Container';

export { Container, type ContainerProps };