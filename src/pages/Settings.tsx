import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCRMStore } from '@/store/crmStore';
import { toast } from 'sonner';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/shared/PageHeader';
import { UserSettings } from '@/components/settings/UserSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { GoogleCalendarConnect } from '@/components/settings/GoogleCalendarConnect';

const Settings = () => {
  return (
    <Container>
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences"
        icon="Settings"
      />
      
      <Tabs defaultValue="account" className="mt-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <UserSettings />
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-6">
          <PreferencesSettings />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-6">
          <div className="space-y-6">
            <GoogleCalendarConnect />
            {/* Add other integrations here in the future */}
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default Settings; 