import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCRMStore } from '@/store/crmStore';
import { toast } from 'sonner';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/shared/PageHeader';
import { UserSettings } from '@/components/settings/UserSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { GoogleCalendarConnect } from '@/components/settings/GoogleCalendarConnect';

const Settings = () => {
  const {
    buckets,
    currentBucketId,
    setCurrentBucketId,
    fetchBuckets,
    user
  } = useCRMStore();

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

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

      {/* Bucket Selection Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Workspace / Bucket Selection</h2>
        {buckets.length === 0 ? (
          <p className="text-gray-500">No buckets found for your account.</p>
        ) : (
          <div className="space-y-4">
            {buckets.map(bucket => (
              <div
                key={bucket.id}
                className={`flex items-center justify-between p-4 rounded border transition-colors ${bucket.id === currentBucketId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <div>
                  <div className="font-medium text-lg">{bucket.name}</div>
                  <div className="text-sm text-gray-500">
                    Owner: {bucket.owner_id === user?.id ? 'You' : bucket.owner_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    Members: {bucket.members}
                  </div>
                </div>
                {bucket.id === currentBucketId ? (
                  <span className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold">Current</span>
                ) : (
                  <button
                    className="px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium"
                    onClick={() => setCurrentBucketId(bucket.id)}
                  >
                    Select
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Settings; 