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
  Settings
} from 'lucide-react';

const AppSidebar = () => {
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
      icon: MessageCircle,
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
                  <Link to="/individuals/new" className="flex items-center text-crm-blue">
                    <BuiltInIcon as={PlusCircle} className="w-5 h-5 mr-3" />
                    <span>Add Individual</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/companies/new" className="flex items-center text-crm-blue">
                    <BuiltInIcon as={PlusCircle} className="w-5 h-5 mr-3" />
                    <span>Add Company</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/conversations/new" className="flex items-center text-crm-blue">
                    <BuiltInIcon as={PlusCircle} className="w-5 h-5 mr-3" />
                    <span>Add Conversation</span>
                  </Link>
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
