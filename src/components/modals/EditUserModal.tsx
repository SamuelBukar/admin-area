import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUpdateUser } from '@/hooks/useQueries';
import type { UserRole, Permission } from '@/types/auth';
import { getDefaultPermissionsForRole } from '@/lib/permissions';
import type { User } from '@/lib/api';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export const EditUserModal = ({ open, onOpenChange, user }: EditUserModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [permissions, setPermissions] = useState<Permission>(getDefaultPermissionsForRole('user'));
  
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
      setPermissions(user.permissions || getDefaultPermissionsForRole(user.role));
    }
  }, [user]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      // Admin gets all permissions
      setPermissions(getDefaultPermissionsForRole('admin'));
    } else {
      // Keep current permissions if switching from admin to user
      if (role === 'admin') {
        setPermissions(getDefaultPermissionsForRole('user'));
      }
    }
  };

  const handlePermissionChange = (
    resource: keyof Permission,
    action: string,
    checked: boolean
  ) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: checked,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !name || !email) {
      return;
    }

    updateUser.mutate(
      { id: user.id, data: { name, email, role, status, permissions } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and configure their permissions.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {role === 'admin' && 'Full access to all features'}
                  {role === 'user' && 'Limited access based on permissions below'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'user' && (
                <>
                  <Separator />
                  <div className="grid gap-4">
                    <Label className="text-base font-semibold">User Permissions</Label>
                    
                    {/* Pages */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Pages</Label>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-pages-create"
                            checked={permissions.pages.create}
                            onCheckedChange={(checked) => handlePermissionChange('pages', 'create', checked as boolean)}
                          />
                          <Label htmlFor="edit-pages-create" className="text-sm font-normal cursor-pointer">Create</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-pages-edit"
                            checked={permissions.pages.edit}
                            onCheckedChange={(checked) => handlePermissionChange('pages', 'edit', checked as boolean)}
                          />
                          <Label htmlFor="edit-pages-edit" className="text-sm font-normal cursor-pointer">Edit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-pages-delete"
                            checked={permissions.pages.delete}
                            onCheckedChange={(checked) => handlePermissionChange('pages', 'delete', checked as boolean)}
                          />
                          <Label htmlFor="edit-pages-delete" className="text-sm font-normal cursor-pointer">Delete</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-pages-publish"
                            checked={permissions.pages.publish}
                            onCheckedChange={(checked) => handlePermissionChange('pages', 'publish', checked as boolean)}
                          />
                          <Label htmlFor="edit-pages-publish" className="text-sm font-normal cursor-pointer">Publish</Label>
                        </div>
                      </div>
                    </div>

                    {/* Templates */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Templates</Label>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-templates-create"
                            checked={permissions.templates.create}
                            onCheckedChange={(checked) => handlePermissionChange('templates', 'create', checked as boolean)}
                          />
                          <Label htmlFor="edit-templates-create" className="text-sm font-normal cursor-pointer">Create</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-templates-edit"
                            checked={permissions.templates.edit}
                            onCheckedChange={(checked) => handlePermissionChange('templates', 'edit', checked as boolean)}
                          />
                          <Label htmlFor="edit-templates-edit" className="text-sm font-normal cursor-pointer">Edit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-templates-delete"
                            checked={permissions.templates.delete}
                            onCheckedChange={(checked) => handlePermissionChange('templates', 'delete', checked as boolean)}
                          />
                          <Label htmlFor="edit-templates-delete" className="text-sm font-normal cursor-pointer">Delete</Label>
                        </div>
                      </div>
                    </div>

                    {/* Applications */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Applications</Label>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-applications-view"
                            checked={permissions.applications.view}
                            onCheckedChange={(checked) => handlePermissionChange('applications', 'view', checked as boolean)}
                          />
                          <Label htmlFor="edit-applications-view" className="text-sm font-normal cursor-pointer">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-applications-submit"
                            checked={permissions.applications.submit}
                            onCheckedChange={(checked) => handlePermissionChange('applications', 'submit', checked as boolean)}
                          />
                          <Label htmlFor="edit-applications-submit" className="text-sm font-normal cursor-pointer">Submit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-applications-edit"
                            checked={permissions.applications.edit}
                            onCheckedChange={(checked) => handlePermissionChange('applications', 'edit', checked as boolean)}
                          />
                          <Label htmlFor="edit-applications-edit" className="text-sm font-normal cursor-pointer">Edit</Label>
                        </div>
                      </div>
                    </div>

                    {/* Reports */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Reports</Label>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-reports-view"
                            checked={permissions.reports.view}
                            onCheckedChange={(checked) => handlePermissionChange('reports', 'view', checked as boolean)}
                          />
                          <Label htmlFor="edit-reports-view" className="text-sm font-normal cursor-pointer">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-reports-generate"
                            checked={permissions.reports.generate}
                            onCheckedChange={(checked) => handlePermissionChange('reports', 'generate', checked as boolean)}
                          />
                          <Label htmlFor="edit-reports-generate" className="text-sm font-normal cursor-pointer">Generate</Label>
                        </div>
                      </div>
                    </div>

                    {/* Payments & Allocations */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Payments</Label>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-payments-view"
                            checked={permissions.payments.view}
                            onCheckedChange={(checked) => handlePermissionChange('payments', 'view', checked as boolean)}
                          />
                          <Label htmlFor="edit-payments-view" className="text-sm font-normal cursor-pointer">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-payments-manage"
                            checked={permissions.payments.manage}
                            onCheckedChange={(checked) => handlePermissionChange('payments', 'manage', checked as boolean)}
                          />
                          <Label htmlFor="edit-payments-manage" className="text-sm font-normal cursor-pointer">Manage</Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Allocations</Label>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-allocations-view"
                            checked={permissions.allocations.view}
                            onCheckedChange={(checked) => handlePermissionChange('allocations', 'view', checked as boolean)}
                          />
                          <Label htmlFor="edit-allocations-view" className="text-sm font-normal cursor-pointer">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-allocations-manage"
                            checked={permissions.allocations.manage}
                            onCheckedChange={(checked) => handlePermissionChange('allocations', 'manage', checked as boolean)}
                          />
                          <Label htmlFor="edit-allocations-manage" className="text-sm font-normal cursor-pointer">Manage</Label>
                        </div>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Settings</Label>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-settings-view"
                            checked={permissions.settings.view}
                            onCheckedChange={(checked) => handlePermissionChange('settings', 'view', checked as boolean)}
                          />
                          <Label htmlFor="edit-settings-view" className="text-sm font-normal cursor-pointer">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-settings-edit"
                            checked={permissions.settings.edit}
                            onCheckedChange={(checked) => handlePermissionChange('settings', 'edit', checked as boolean)}
                          />
                          <Label htmlFor="edit-settings-edit" className="text-sm font-normal cursor-pointer">Edit</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
