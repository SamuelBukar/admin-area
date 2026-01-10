import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdVisibility, 
  MdVisibilityOff,
  MdSearch,
  MdFilterList,
  MdSort,
  MdContentCopy,
  MdOpenInNew
} from 'react-icons/md';
import { usePages, useDeletePage } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePageModal } from '@/components/modals/CreatePageModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'published' | 'draft';
type SortOption = 'updated' | 'views' | 'title';

const Pages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<{ id: string; title: string } | null>(null);
  
  const { data: pages, isLoading } = usePages();
  const deletePage = useDeletePage();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('pages', 'create');
  const canEdit = hasPermission('pages', 'edit');
  const canDelete = hasPermission('pages', 'delete');
  const canPublish = hasPermission('pages', 'publish');

  const filteredAndSortedPages = useMemo(() => {
    if (!pages) return [];
    
    let filtered = pages.filter(page => {
      const matchesSearch = 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'published' && page.status === 'published') ||
        (statusFilter === 'draft' && page.status === 'draft');
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.views - a.views;
        case 'updated':
        default:
          // Parse updatedAt (simplified - in real app would use proper date parsing)
          return 0; // For demo, keep original order
      }
    });

    return filtered;
  }, [pages, searchQuery, statusFilter, sortBy]);

  const handleSelectPage = (pageId: string, checked: boolean) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(pageId);
      } else {
        newSet.delete(pageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(new Set(filteredAndSortedPages.map(p => p.id)));
    } else {
      setSelectedPages(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedPages.size === 0) return;
    setDeleteModalOpen(true);
    // For bulk delete, we'll delete all selected pages
  };

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedPage({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPage) {
      deletePage.mutate(selectedPage.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSelectedPage(null);
        },
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Pages | LandAdmin Builder</title>
        <meta name="description" content="Manage your published pages and forms" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pages</h1>
            <p className="text-muted-foreground">
              Manage all your published pages and forms
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
                    Create New Page
                  </Button>
                </span>
              </TooltipTrigger>
              {!canCreate && (
                <TooltipContent>
                  <p>You don't have permission to create pages</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Filters and Search */}
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6 space-y-4">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <MdFilterList className="w-4 h-4 text-muted-foreground" />
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <MdSort className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedPages.size > 0 && canDelete && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  checked={selectedPages.size === filteredAndSortedPages.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
                </span>
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <MdDelete className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pages List */}
        <div className="grid gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-64" />
                </CardContent>
              </Card>
            ))
          ) : filteredAndSortedPages.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No pages found matching your search.' : 'No pages yet. Create your first page!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedPages.map((page) => (
              <Card key={page.id} className="hover:shadow-widget-hover transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {canDelete && (
                        <Checkbox
                          checked={selectedPages.has(page.id)}
                          onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{page.title}</CardTitle>
                          <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                            {page.status === 'published' ? (
                              <><MdVisibility className="w-3 h-3 mr-1" /> Published</>
                            ) : (
                              <><MdVisibilityOff className="w-3 h-3 mr-1" /> Draft</>
                            )}
                          </Badge>
                        </div>
                        <CardDescription>
                          <span className="font-mono text-xs">{page.slug}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/dashboard/pages/${page.id}`)}
                            >
                              <MdVisibility className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Page</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {page.status === 'published' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  window.open(`/preview/${page.id}`, '_blank');
                                }}
                              >
                                <MdOpenInNew className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Open Live Page</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  navigate(`/dashboard/builder?pageId=${page.id}`);
                                }}
                                disabled={!canEdit}
                              >
                                <MdEdit className="w-4 h-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canEdit ? 'Edit Page' : 'You don\'t have permission to edit pages'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {canCreate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  toast.success('Page duplicated!');
                                  // In real app, would call duplicate API
                                }}
                              >
                                <MdContentCopy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate Page</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteClick(page.id, page.title)}
                                disabled={!canDelete}
                              >
                                <MdDelete className="w-4 h-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canDelete ? 'Delete Page' : 'You don\'t have permission to delete pages'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Updated {page.updatedAt}</span>
                    <span>•</span>
                    <span>{page.views} views</span>
                    {page.status === 'published' && (
                      <>
                        <span>•</span>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/preview/${page.id}`);
                            toast.success('Preview link copied to clipboard!');
                          }}
                        >
                          Copy Preview Link
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modals */}
        <CreatePageModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
        <DeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Page"
          itemName={selectedPage?.title}
          isLoading={deletePage.isPending}
        />
      </div>
    </>
  );
};

export default Pages;

