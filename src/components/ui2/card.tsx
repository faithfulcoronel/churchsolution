import * as React from 'react';
import { cn } from '@/lib/utils';
import { Container } from './container';
import { BaseProps } from './types';

interface CardProps extends BaseProps {
  hoverable?: boolean;
  loading?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const variantClasses = {
  default: `
    bg-white dark:bg-muted
    border-border dark:border-border
    shadow-sm
  `,
  primary: `
    bg-primary-50 dark:bg-primary-900/10
    border-primary-100 dark:border-primary-800
    shadow-primary/5
  `,
  secondary: `
    bg-muted dark:bg-muted/50
    border-border dark:border-border
  `,
  gradient: `
    bg-gradient-to-br from-emerald-50 to-teal-50
    dark:from-emerald-900/10 dark:to-teal-900/10
    border-border/50 dark:border-border/50
    backdrop-blur-sm
  `
};

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    children, 
    hoverable = false,
    loading = false,
    onClick,
    variant = 'default',
    size = 'md',
    fullWidth = false,
    ...props 
  }, ref) => {
    const isInteractive = !!onClick;

    return (
        <div
          ref={ref}
          className={cn(
            // Base styles
            'relative rounded-2xl border transition-all duration-200 dark:border-border',
            // Variant styles
            variantClasses[variant],
            // Size styles
            sizeClasses[size],
            // Interactive styles
            hoverable && 'hover:shadow-lg dark:hover:shadow-none hover:-translate-y-0.5 hover:border-primary-200 dark:hover:border-primary-800',
            isInteractive && 'cursor-pointer',
            // Loading state
            loading && 'animate-pulse',
            className
          )}
          onClick={onClick}
          role={isInteractive ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={
            isInteractive
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                  }
                }
              : undefined
          }
          aria-busy={loading}
          {...props}
        >
          {/* Gradient overlay for hover effect */}
          {hoverable && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-primary-500/0 to-primary-500/0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-5 transition-opacity duration-200 rounded-2xl" />
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-muted/70 backdrop-blur-sm rounded-2xl" />
          )}

          {/* Content */}
          {children}

          {/* Shimmer effect for loading state */}
          {loading && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 transform translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 dark:via-gray-700/10 to-transparent" />
            </div>
          )}
        </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends BaseProps {
  title?: string;
  description?: string;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, children }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {title && (
        <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends BaseProps {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends BaseProps {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends BaseProps {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends BaseProps {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)}>
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };