import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface TreeItemProps {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  endContent?: React.ReactNode;
  onClick?: (id: string) => void;
  isSelected?: boolean;
}

interface TreeViewProps {
  children: React.ReactNode;
  className?: string;
  onNodeSelect?: (id: string) => void;
  selectedId?: string;
}

const TreeViewContext = React.createContext<{
  selectedId?: string;
  onNodeSelect?: (id: string) => void;
}>({});

export const TreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  ({ 
    id, 
    label, 
    icon, 
    children, 
    className, 
    defaultExpanded = false, 
    endContent,
    onClick,
    isSelected,
  }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const { selectedId, onNodeSelect } = React.useContext(TreeViewContext);
    
    const selected = isSelected !== undefined ? isSelected : selectedId === id;
    
    const hasChildren = React.Children.count(children) > 0;
    
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpanded(prev => !prev);
    };
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(id);
      onNodeSelect?.(id);
    };
    
    return (
      <li 
        ref={ref} 
        className={cn(
          "list-none",
          className
        )}
      >
        <div 
          className={cn(
            "flex items-center py-1.5 px-2 rounded-md cursor-pointer",
            "hover:bg-muted/50 transition-colors duration-150",
            selected && "bg-muted/70 font-medium"
          )}
          onClick={handleClick}
        >
          {hasChildren ? (
            <button 
              type="button" 
              className="mr-1 p-0.5 rounded-sm hover:bg-muted/80 focus:outline-none focus:ring-1 focus:ring-ring"
              onClick={handleToggle}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-5 h-5 mr-1"></span>
          )}
          
          {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
          
          <span className="flex-grow truncate">{label}</span>
          
          {endContent && (
            <span className="ml-2 flex-shrink-0">{endContent}</span>
          )}
        </div>
        
        {hasChildren && expanded && (
          <ul className="pl-6 mt-1">
            {children}
          </ul>
        )}
      </li>
    );
  }
);

TreeItem.displayName = 'TreeItem';

export const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(
  ({ children, className, onNodeSelect, selectedId }, ref) => {
    return (
      <TreeViewContext.Provider value={{ selectedId, onNodeSelect }}>
        <ul 
          ref={ref} 
          className={cn(
            "text-sm",
            className
          )}
        >
          {children}
        </ul>
      </TreeViewContext.Provider>
    );
  }
);

TreeView.displayName = 'TreeView';