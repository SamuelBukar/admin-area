import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MdPrint, MdSave, MdDeleteSweep, MdArrowBack, MdSettings, MdLogout, MdPreview } from 'react-icons/md';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface BuilderHeaderProps {
  elementCount: number;
  elements: any[];
  pageId?: string;
  onSave: () => void;
  onPrint: () => void;
  onClear: () => void;
  isSaving?: boolean;
}

export const BuilderHeader = ({ 
  elementCount,
  elements,
  pageId,
  onSave, 
  onPrint, 
  onClear,
  isSaving = false 
}: BuilderHeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleClearConfirm = () => {
    onClear();
    setClearDialogOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handlePreview = () => {
    // Store template data temporarily for preview
    const templateData = {
      elements,
      previewId: crypto.randomUUID(),
    };
    sessionStorage.setItem('preview-template', JSON.stringify(templateData));
    
    // Open preview in new tab
    const previewUrl = `/dashboard/preview?templateId=${templateData.previewId}`;
    window.open(previewUrl, '_blank');
  };


  return (
    <>
      <header className="bg-card border-b border-border px-4 lg:px-6 py-4 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Back Button & Title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-primary-foreground">LA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {pageId ? 'Edit Template' : 'Template Builder'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {elementCount} element{elementCount !== 1 ? 's' : ''} • Save to create template
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDialogOpen(true)}
              disabled={elementCount === 0}
              className="flex-1 sm:flex-initial"
            >
              <MdDeleteSweep className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={elementCount === 0}
              className="flex-1 sm:flex-initial"
            >
              <MdPreview className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial"
            >
              <MdSave className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              disabled={elementCount === 0}
              className="flex-1 sm:flex-initial"
            >
              <MdPrint className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <MdArrowBack className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                  <MdSettings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <MdLogout className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
    </header>

    {/* Clear Confirmation Dialog */}
    <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Template?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all {elementCount} element{elementCount !== 1 ? 's' : ''} from your template. 
            This action cannot be undone unless you have saved a draft.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Clear All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
};
