import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch,
  MdEmail,
  MdPerson
} from 'react-icons/md';
import { useUsers, useDeleteUser } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/lib/api';
import { CreateUserModal } from '@/components/modals/CreateUserModal';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const { hasPermission } = useAuth();

  const safeUsers = Array.isArray(users) ? users : [];

  const canCreate = hasPermission('users', 'create');
  const canEdit = hasPermission('users', 'edit');
  const canDelete = hasPermission('users', 'delete');

  const filteredUsers = useMemo(() => {
    const list = safeUsers;
    return list.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management | LandAdmin Builder</title>
        <meta name="description" content="Manage team members and permissions" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
            <p className="text-muted-foreground">
              Manage team members and their permissions
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    className="shadow-sm" 
                    onClick={() => setCreateModalOpen(true)}
                    disabled={!canCreate}
                  >
                    <MdAdd className="w-5 h-5 mr-2" />
                    Add New User
                  </Button>
                </span>
              </TooltipTrigger>
              {!canCreate && (
                <TooltipContent>
                  <p>You don't have permission to create users</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <CardTitle className="text-3xl">{users?.length || 0}</CardTitle>
              )}
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Users</CardDescription>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <CardTitle className="text-3xl">
                  {users?.filter(u => u.status === 'active').length || 0}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Admins</CardDescription>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <CardTitle className="text-3xl">
                  {users?.filter(u => u.role === 'admin').length || 0}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="pt-6">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : filteredUsers.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No users found matching your search.' : 'No users yet. Add your first user!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-widget-hover transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MdEmail className="w-4 h-4" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MdPerson className="w-4 h-4" />
                            Joined {new Date(user.joinedAt).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(user)}
                                disabled={!canEdit}
                              >
                                <MdEdit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!canEdit && (
                            <TooltipContent>
                              <p>You don't have permission to edit users</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteClick(user.id, user.name)}
                                disabled={!canDelete}
                              >
                                <MdDelete className="w-4 h-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!canDelete && (
                            <TooltipContent>
                              <p>You don't have permission to delete users</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Modals */}
        <CreateUserModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
        <EditUserModal 
          open={editModalOpen} 
          onOpenChange={setEditModalOpen} 
          user={selectedUser}
        />
        <DeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          itemName={userToDelete?.name}
          description={`This will permanently remove ${userToDelete?.name} from your organization. They will lose access to all resources.`}
          isLoading={deleteUser.isPending}
        />
      </div>
    </>
  );
};

export default UserManagement;

