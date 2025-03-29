import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilteredCompanies, useFilteredConversations, useFilteredIndividuals, useCRMStore } from '@/store/crmStore';
import { BarChart3, Building2, Calendar, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import SearchBar from '@/components/shared/SearchBar';

const Dashboard = () => {
  const { conversations, tags, searchQuery, setSearchQuery } = useCRMStore();
  const individuals = useFilteredIndividuals();
  const companies = useFilteredCompanies();
  const filteredConversations = useFilteredConversations();
  const recentConversations = [...filteredConversations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crm-text">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome to your ConnectVista CRM dashboard
          </p>
        </div>
        
        <SearchBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Individuals
            </CardTitle>
            <Users className="h-4 w-4 text-crm-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individuals.length}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/individuals" className="text-crm-blue">
                View all individuals
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-crm-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/companies" className="text-crm-blue">
                View all companies
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-crm-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/conversations" className="text-crm-blue">
                View all conversations
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Available Tags
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-crm-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/tags" className="text-crm-blue">
                Manage tags
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>
            {searchQuery 
              ? `Filtered conversations matching "${searchQuery}"`
              : 'Your last 5 tracked conversations with stakeholders'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentConversations.length > 0 ? (
              recentConversations.map((conversation) => (
                <div key={conversation.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold text-crm-blue">
                    <Link to={`/conversations/${conversation.id}`}>
                      {conversation.title}
                    </Link>
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(conversation.date), 'PPP')}
                  </div>
                  <p className="text-sm mt-2 text-gray-700">{conversation.summary}</p>
                  <div className="text-sm mt-2">
                    <span className="font-medium">Next Steps: </span>
                    {conversation.nextSteps}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {searchQuery 
                  ? 'No conversations match your search criteria'
                  : 'No recent conversations found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Overview of your CRM activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Companies</span>
              <span className="font-bold">{companies.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Individuals</span>
              <span className="font-bold">{individuals.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Conversations</span>
              <span className="font-bold">{conversations.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Recent Activity</span>
              <span className="font-bold">
                {conversations.length > 0 
                  ? format(new Date(conversations[0].date), 'MMM d, yyyy')
                  : 'No recent activity'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
