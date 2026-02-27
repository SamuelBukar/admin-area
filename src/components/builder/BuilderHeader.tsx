import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  onSave: (templateName: string) => void;
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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleClearConfirm = () => {
    onClear();
    setClearDialogOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSaveClick = () => {
    if (elementCount === 0 || isSaving) return;
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      return;
    }
    onSave(trimmedName);
    setSaveDialogOpen(false);
  };

  const handlePreview = () => {
    if (!pageId) {
      toast.error('Save the template before previewing.');
      return;
    }

    // Preview saved template/page from API
    const previewUrl = `/dashboard/preview?templateId=${pageId}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
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
                {elementCount} element{elementCount !== 1 ? 's' : ''} • Save to create a reusable template
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
              onClick={handleSaveClick}
              disabled={isSaving || elementCount === 0}
              className="flex-1 sm:flex-initial"
            >
              <MdSave className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Template'}</span>
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

    {/* Save Template Dialog */}
    <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Template</AlertDialogTitle>
          <AlertDialogDescription>
            Give this template a clear name so you can easily find and reuse it when creating forms.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <label className="text-sm font-medium text-foreground" htmlFor="template-name-input">
            Template Name
          </label>
          <Input
            id="template-name-input"
            placeholder="e.g. Personal Information Section"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setTemplateName('');
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSaveConfirm}
            disabled={isSaving || !templateName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
};
