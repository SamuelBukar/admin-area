import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { MdSave, MdPerson, MdNotifications, MdSecurity, MdPalette, MdPayment } from 'react-icons/md';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { Enable2FAModal } from '@/components/modals/Enable2FAModal';
import { PaymentSettings } from '@/components/settings/PaymentSettings';
import { twoFactorApi } from '@/lib/api';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const isAdmin = user?.role === 'admin';
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(user?.twoFactorEnabled || false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [enable2FAModalOpen, setEnable2FAModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password updated successfully');
  };

  const handleDeleteAccount = () => {
    // In production, this would call an API
    toast.success('Account deletion initiated');
    setDeleteAccountModalOpen(false);
  };

  const handleEnable2FASuccess = async () => {
    // Update user's 2FA status
    if (user) {
      const updatedUser = { ...user, twoFactorEnabled: true };
      localStorage.setItem('landadmin-user', JSON.stringify(updatedUser));
      setTwoFactorAuth(true);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;
    
    try {
      await twoFactorApi.disable(user.id);
      const updatedUser = { ...user, twoFactorEnabled: false };
      localStorage.setItem('landadmin-user', JSON.stringify(updatedUser));
      setTwoFactorAuth(false);
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error('Failed to disable 2FA');
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings | LandAdmin Builder</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="profile">
              <MdPerson className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <MdNotifications className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <MdSecurity className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <MdPalette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="payments">
                <MdPayment className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Separator />
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <MdSave className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive"
                  onClick={() => setDeleteAccountModalOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <Button onClick={handleSaveNotifications}>
                  <MdSave className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" required />
                  </div>
                  <Separator />
                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorAuth 
                        ? '2FA is currently enabled for your account'
                        : 'Require a verification code in addition to your password'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {twoFactorAuth ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisable2FA}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setEnable2FAModalOpen(true)}
                      >
                        Enable
                      </Button>
                    )}
                  </div>
                </div>
                {twoFactorAuth && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ Two-factor authentication is active. You will be required to enter a code when logging in.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'} 
                      className="justify-start"
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </Button>
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'} 
                      className="justify-start"
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </Button>
                    <Button 
                      variant={theme === 'system' ? 'default' : 'outline'} 
                      className="justify-start"
                      onClick={() => setTheme('system')}
                    >
                      System
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {theme === 'system' 
                      ? 'Theme will match your system preferences'
                      : `Theme is set to ${theme} mode`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings (Admin Only) */}
          {isAdmin && (
            <TabsContent value="payments" className="space-y-4">
              <PaymentSettings />
            </TabsContent>
          )}
        </Tabs>

        {/* Modals */}
        <DeleteConfirmModal
          open={deleteAccountModalOpen}
          onOpenChange={setDeleteAccountModalOpen}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          description="Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers."
        />
        {user && (
          <Enable2FAModal
            open={enable2FAModalOpen}
            onOpenChange={setEnable2FAModalOpen}
            userEmail={user.email}
            onSuccess={handleEnable2FASuccess}
          />
        )}
      </div>
    </>
  );
};

export default Settings;

