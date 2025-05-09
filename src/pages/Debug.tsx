import React from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Debug = () => {
  const { 
    companies, 
    individuals, 
    conversations, 
    tags,
    fetchCompanies, 
    fetchIndividuals, 
    fetchConversations,
    fetchTags,
    isAuthenticated,
    currentBucketId
  } = useCRMStore();

  const refreshAll = () => {
    if (isAuthenticated && currentBucketId) {
      fetchCompanies(currentBucketId);
      fetchIndividuals(currentBucketId);
      fetchConversations(currentBucketId);
      fetchTags();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Debug Page</h1>
          <p className="text-gray-500 mt-1">Inspect your CRM data structure</p>
        </div>
        <Button onClick={refreshAll}>
          Refresh All Data
        </Button>
      </div>

      <Tabs defaultValue="companies" className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
          <TabsTrigger value="individuals">Individuals ({individuals.length})</TabsTrigger>
          <TabsTrigger value="conversations">Conversations ({conversations.length})</TabsTrigger>
          <TabsTrigger value="tags">Tags ({tags.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>All companies in your CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
                {JSON.stringify(companies, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="individuals">
          <Card>
            <CardHeader>
              <CardTitle>Individuals</CardTitle>
              <CardDescription>All individuals in your CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
                {JSON.stringify(individuals, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>All conversations in your CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
                {JSON.stringify(conversations, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>All tags in your CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
                {JSON.stringify(tags, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Debug; 