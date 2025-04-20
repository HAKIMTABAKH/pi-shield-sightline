
import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, User } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoBlockIps, setAutoBlockIps] = useState(true);
  const { toast } = useToast();

  // Mock submit function for changing password
  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simple validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would call an API endpoint
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully."
    });
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Handle notification toggle
  const handleNotificationToggle = (type: 'email' | 'inApp', checked: boolean) => {
    if (type === 'email') {
      setEmailNotifications(checked);
    } else {
      setInAppNotifications(checked);
    }
    
    toast({
      title: "Notification settings updated",
      description: `${type === 'email' ? 'Email' : 'In-app'} notifications ${checked ? 'enabled' : 'disabled'}.`
    });
  };

  // Handle two-factor toggle
  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    
    toast({
      title: "Two-factor authentication updated",
      description: `Two-factor authentication has been ${checked ? 'enabled' : 'disabled'}.`
    });
  };

  // Handle auto-block toggle
  const handleAutoBlockToggle = (checked: boolean) => {
    setAutoBlockIps(checked);
    
    toast({
      title: "Auto-block setting updated",
      description: `Automatic IP blocking for critical alerts has been ${checked ? 'enabled' : 'disabled'}.`
    });
  };

  return (
    <MainLayout title="Settings">
      <div className="flex items-center pb-4 gap-2">
        <SettingsIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">System Settings</h2>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your account information and change your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value="admin@pishield.local" disabled />
                <p className="text-xs text-muted-foreground">
                  Contact your system administrator to change your email address.
                </p>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive alerts and system notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive security alerts via email
                  </span>
                </Label>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="in-app-notifications" className="flex flex-col space-y-1">
                  <span>In-App Notifications</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Show real-time alerts within the dashboard
                  </span>
                </Label>
                <Switch 
                  id="in-app-notifications" 
                  checked={inAppNotifications}
                  onCheckedChange={(checked) => handleNotificationToggle('inApp', checked)}
                />
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Notification Categories</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch id="critical-alerts" checked={true} disabled />
                    <Label htmlFor="critical-alerts">Critical Security Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="system-health" checked={true} />
                    <Label htmlFor="system-health">System Health Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="updates" checked={false} />
                    <Label htmlFor="updates">Software Update Notifications</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure additional security features for your PiShield system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="two-factor-auth" className="flex flex-col space-y-1">
                  <span>Two-Factor Authentication</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Require a second verification step when logging in
                  </span>
                </Label>
                <Switch 
                  id="two-factor-auth" 
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="auto-block" className="flex flex-col space-y-1">
                  <span>Auto-Block Critical Threats</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Automatically block IPs associated with critical security alerts
                  </span>
                </Label>
                <Switch 
                  id="auto-block" 
                  checked={autoBlockIps}
                  onCheckedChange={handleAutoBlockToggle}
                />
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">System Security</h3>
                <div className="space-y-6">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm">System Version</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      PiShield v1.2.4
                    </span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm">April 12, 2025</span>
                  </div>
                  
                  <Button variant="outline">Check for Updates</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;
