import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BuiltInIcon } from '@/components/ui/icon';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  Users, 
  Building2, 
  MessageCircle, 
  Tag, 
  BarChart3,
  PlusCircle,
  Settings,
  MessageSquare,
  UserPlus,
  Building,
  Bell
} from 'lucide-react';

interface AppSidebarProps {
  openAction: (action: 'individual' | 'company' | 'conversation') => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ openAction }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: BarChart3,
    },
    {
      title: 'Individuals',
      path: '/individuals',
      icon: Users,
    },
    {
      title: 'Companies',
      path: '/companies',
      icon: Building2,
    },
    {
      title: 'Conversations',
      path: '/conversations',
      icon: MessageSquare,
    },
    {
      title: 'Reminders',
      path: '/reminders',
      icon: Bell,
    },
    {
      title: 'Tags',
      path: '/tags',
      icon: Tag,
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center px-4 py-4">
          <h1 className="text-xl font-bold text-crm-blue">ConnectVista</h1>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location.pathname === item.path ? "true" : "false"}
                  >
                    <Link to={item.path} className="flex items-center">
                      <BuiltInIcon as={item.icon} className="w-5 h-5 mr-3" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => openAction('individual')}
                    className="flex items-center w-full px-3 py-2 text-sm text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Individual
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => openAction('company')}
                    className="flex items-center w-full px-3 py-2 text-sm text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Add Company
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => openAction('conversation')}
                    className="flex items-center w-full px-3 py-2 text-sm text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Conversation
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
