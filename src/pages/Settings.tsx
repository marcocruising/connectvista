import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCRMStore } from '@/store/crmStore';
import { toast } from 'sonner';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/shared/PageHeader';
import { UserSettings } from '@/components/settings/UserSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { GoogleCalendarConnect } from '@/components/settings/GoogleCalendarConnect';
import { BucketCollaborators } from '@/components/settings/BucketCollaborators';
import { supabase } from '@/lib/supabase';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Copy } from 'lucide-react';

const Settings = () => {
  const {
    buckets,
    currentBucketId,
    setCurrentBucketId,
    fetchBuckets,
    user,
    pendingInvites,
    fetchPendingInvites
  } = useCRMStore();

  const [copiedBucketId, setCopiedBucketId] = useState<string | null>(null);

  useEffect(() => {
    fetchBuckets();
    fetchPendingInvites();
  }, [fetchBuckets, fetchPendingInvites]);

  // Deduplicate buckets by id before rendering
  const uniqueBuckets = Array.from(new Map(buckets.map(b => [b.id, b])).values());

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
          <TabsTrigger value="buckets">Buckets</TabsTrigger>
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

        <TabsContent value="buckets" className="mt-6">
          {/* Bucket Selection Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Workspace / Bucket Selection</h2>
            {uniqueBuckets.length === 0 ? (
              <p className="text-gray-500">No buckets found for your account.</p>
            ) : (
              <div className="space-y-4">
                {uniqueBuckets.map(bucket => {
                  const bucketIdShort = `#${bucket.id.slice(-4).toLowerCase()}`;
                  let ownerName = bucket.owner_id === user?.id
                    ? (user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'You')
                    : bucket.owner_id?.slice(-4);
                  let personalLabel = '';
                  if (bucket.owner_id === user?.id) {
                    personalLabel = `${ownerName}'s Personal Bucket`;
                  }
                  const handleCopy = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(bucket.id);
                    setCopiedBucketId(bucket.id);
                    setTimeout(() => setCopiedBucketId(null), 1200);
                  };
                  return (
                    <div
                      key={bucket.id}
                      className={`flex items-center justify-between p-4 rounded border transition-colors ${bucket.id === currentBucketId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div>
                        <div className="font-medium text-lg flex items-center gap-2">
                          {bucket.name}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-gray-400 cursor-pointer" tabIndex={0} onClick={handleCopy}>
                                {bucketIdShort}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span className="font-mono text-xs">{bucket.id}</span>
                              <button
                                className="ml-1 p-1 rounded hover:bg-gray-200"
                                onClick={handleCopy}
                              >
                                <Copy size={14} />
                              </button>
                              {copiedBucketId === bucket.id && <span className="ml-2 text-green-600 text-xs">Copied!</span>}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {personalLabel && (
                          <div className="text-sm text-gray-500">{personalLabel}</div>
                        )}
                        <div className="text-sm text-gray-500">
                          Owner: {ownerName}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Bucket Collaborators Section */}
          <div className="mt-8">
            {/* Pass the current bucket object for context */}
            <BucketCollaborators bucket={uniqueBuckets.find(b => b.id === currentBucketId)} />
          </div>

          {/* Pending Invites Section: Only visible in Buckets tab */}
          <div className="bg-yellow-50 rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Pending Invites</h2>
            {pendingInvites && pendingInvites.length > 0 ? (
              <ul className="space-y-2">
                {pendingInvites.map(invite => {
                  const bucketIdShort = invite.bucket_id ? `#${invite.bucket_id.slice(-4).toLowerCase()}` : '';
                  // Use new inviter info fields
                  const inviterName = invite.invited_by_name;
                  const inviterEmail = invite.invited_by_email;
                  return (
                    <li key={invite.id} className="flex items-center justify-between text-sm">
                      <span>
                        Invited to <b>{invite.buckets?.name || bucketIdShort}</b>
                        <span className="ml-2 text-xs text-gray-500">({bucketIdShort})</span>
                        <br />
                        <span className="text-xs text-gray-600">
                          Invited by: {inviterName ? <b>{inviterName}</b> : null}
                          {inviterEmail ? (
                            <span> &lt;{inviterEmail}&gt;</span>
                          ) : null}
                        </span>
                      </span>
                      <span className="flex gap-2">
                        <button
                          className="px-3 py-1 rounded bg-blue-500 text-white font-medium hover:bg-blue-600"
                          onClick={async () => {
                            await useCRMStore.getState().acceptInvite(invite.bucket_id);
                            await fetchPendingInvites();
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
                          onClick={async () => {
                            await useCRMStore.getState().cancelInvite(invite.email, invite.bucket_id);
                            await fetchPendingInvites();
                          }}
                        >
                          Reject
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-gray-600">You have no pending invites.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default Settings; 