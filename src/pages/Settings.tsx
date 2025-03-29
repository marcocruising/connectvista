import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCRMStore } from '@/store/crmStore';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useCRMStore();
  const [activeTab, setActiveTab] = useState('general');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Mock function for saving settings
  const saveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-crm-text">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your ConnectVista CRM preferences and account settings
        </p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your CRM preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                  <span>Dark Mode</span>
                  <span className="text-sm text-muted-foreground">
                    Enable dark mode for the application
                  </span>
                </Label>
                <Switch 
                  id="dark-mode" 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="language" className="flex flex-col space-y-1">
                  <span>Language</span>
                  <span className="text-sm text-muted-foreground">
                    Choose your preferred language
                  </span>
                </Label>
                <select 
                  id="language" 
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.user_metadata?.full_name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" defaultValue="" />
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Update Profile</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </span>
                </Label>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="conversation-notifications" className="flex flex-col space-y-1">
                  <span>Conversation Reminders</span>
                  <span className="text-sm text-muted-foreground">
                    Get reminded about upcoming follow-ups
                  </span>
                </Label>
                <Switch 
                  id="conversation-notifications" 
                  defaultChecked 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="digest-notifications" className="flex flex-col space-y-1">
                  <span>Weekly Digest</span>
                  <span className="text-sm text-muted-foreground">
                    Receive a weekly summary of activity
                  </span>
                </Label>
                <Switch 
                  id="digest-notifications" 
                  defaultChecked 
                />
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 