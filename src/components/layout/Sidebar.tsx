import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  MessageSquare, 
  Tag, 
  Home,
  Settings, 
  Bell 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      title: 'Individuals',
      href: '/individuals',
      icon: Users,
    },
    {
      title: 'Companies',
      href: '/companies',
      icon: Building2,
    },
    {
      title: 'Conversations',
      href: '/conversations',
      icon: MessageSquare,
    },
    {
      title: 'Reminders',
      href: '/reminders',
      icon: Bell,
    },
    {
      title: 'Tags',
      href: '/tags',
      icon: Tag,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">ConnectVista CRM</h2>
      </div>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 w-full border-t p-3">
        <Link 
          to="/settings" 
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium w-full",
            location.pathname === '/settings'
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar; 