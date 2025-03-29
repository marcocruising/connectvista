import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from './AppSidebar';
import SearchBar from '../shared/SearchBar';
import QuickActions, { useQuickActions } from './QuickActions';

const AppLayout = () => {
  const { activeAction, openAction, closeAction } = useQuickActions();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar openAction={openAction} />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger className="mr-4" />
            <SearchBar />
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
        <QuickActions activeAction={activeAction} closeAction={closeAction} />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
