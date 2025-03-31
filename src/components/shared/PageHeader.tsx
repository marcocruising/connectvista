import React from 'react';
import { 
  Settings, Users, Calendar, MessageCircle, Building2, 
  BarChart3, Tag, Home, Bell, AlertCircle, Plus, PlusCircle
} from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string; 
  children?: React.ReactNode;
}

const iconComponents: Record<string, React.ReactNode> = {
  Settings: <Settings className="h-8 w-8" />,
  Users: <Users className="h-8 w-8" />,
  Calendar: <Calendar className="h-8 w-8" />,
  MessageCircle: <MessageCircle className="h-8 w-8" />,
  Building2: <Building2 className="h-8 w-8" />,
  BarChart3: <BarChart3 className="h-8 w-8" />,
  Tag: <Tag className="h-8 w-8" />,
  Home: <Home className="h-8 w-8" />,
  Bell: <Bell className="h-8 w-8" />,
  AlertCircle: <AlertCircle className="h-8 w-8" />,
  Plus: <Plus className="h-8 w-8" />,
  PlusCircle: <PlusCircle className="h-8 w-8" />,
};

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon,
  children 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        {icon && (
          <div className="mr-4 bg-muted rounded-lg p-2">
            {iconComponents[icon] || null}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  );
}; 