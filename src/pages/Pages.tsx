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
  MdOpenInNew,
  MdLink,
  MdDescription
} from 'react-icons/md';
import { usePages, useDeletePages, useDuplicatePage, usePublishExistingPage, useUnpublishPage } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePageModal } from '@/components/modals/CreatePageModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { Page } from '@/lib/api';

type StatusFilter = 'all' | 'published' | 'draft';
type SortOption = 'updated' | 'views' | 'title';
type TypeFilter = 'all' | 'templates' | 'pages';

const Pages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<{ id: string; title: string } | null>(null);
  
  const { data: pages, isLoading } = usePages();
  const deletePages = useDeletePages();
  const duplicatePage = useDuplicatePage();
  const publishPage = usePublishExistingPage();
  const unpublishPage = useUnpublishPage();
  const { hasPermission } = useAuth();

  // always work with an actual array even if API returned something unexpected
  const safePages = Array.isArray(pages) ? pages : [];

  // Get templates count for button state
  const templates = safePages.filter(p => p.isTemplate && !p.isNamed);

  const canCreate = hasPermission('pages', 'create');
  const canEdit = hasPermission('pages', 'edit');
  const canDelete = hasPermission('pages', 'delete');
  const canPublish = hasPermission('pages', 'publish');

  const filteredAndSortedPages = useMemo(() => {
    let filtered = safePages.filter(page => {
      const matchesSearch = 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'published' && page.status === 'published') ||
        (statusFilter === 'draft' && page.status === 'draft');
      
      const matchesType = 
        typeFilter === 'all' ||
        (typeFilter === 'templates' && page.isTemplate && !page.isNamed) ||
        (typeFilter === 'pages' && (!page.isTemplate || page.isNamed));
      
      return matchesSearch && matchesStatus && matchesType;
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
          return 0;
      }
    });

    return filtered;
  }, [pages, searchQuery, statusFilter, typeFilter, sortBy]);

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
    setSelectedPage(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedPage({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    const ids =
      selectedPage?.id ? [selectedPage.id] : Array.from(selectedPages.values());
    if (ids.length === 0) return;

    deletePages.mutate(ids, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedPage(null);
        setSelectedPages(new Set());
      },
    });
  };

  const templatePages = filteredAndSortedPages.filter(p => p.isTemplate && !p.isNamed);
  const formPages = filteredAndSortedPages.filter(p => !p.isTemplate || p.isNamed);

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Pages & Templates</h1>
            <p className="text-muted-foreground">
              Build templates in the Builder, then link them together to create and publish pages.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      className="shadow-sm" 
                      onClick={() => navigate('/dashboard/create-form')}
                      disabled={!canCreate || templates.length === 0}
                    >
                      <MdLink className="w-5 h-5 mr-2" />
                      Create Forms
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canCreate && (
                  <TooltipContent>
                    <p>You don't have permission to create pages</p>
                  </TooltipContent>
                )}
                {canCreate && templates.length === 0 && (
                  <TooltipContent>
                    <p>No templates available. Build templates in the Builder first, then create forms from them.</p>
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
                      className="shadow-sm" 
                      onClick={() => setCreateModalOpen(true)}
                      disabled={!canCreate}
                    >
                      <MdAdd className="w-5 h-5 mr-2" />
                      Create Page
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canCreate && (
                  <TooltipContent>
                    <p>You don't have permission to create pages</p>
                  </TooltipContent>
                )}
                {canCreate && (
                  <TooltipContent>
                    <p>Create a new empty page</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
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
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <MdDescription className="w-4 h-4 text-muted-foreground" />
                <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="pages">Pages</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

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

        {/* Two Professional Cards: Templates and Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {isLoading ? (
            <>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Templates Card */}
              {(typeFilter === 'all' || typeFilter === 'templates') && (
                <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <MdDescription className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Templates</CardTitle>
                          <CardDescription>
                            Building blocks for your forms
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                        {templatePages.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {templatePages.length === 0 ? (
                      <div className="py-12 text-center">
                        <MdDescription className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No templates yet. Build templates in the Builder first.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => navigate('/dashboard/builder')}
                        >
                          Go to Builder
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {templatePages.map((page) => (
                          <div
                            key={page.id}
                            className="group p-4 rounded-lg border border-border hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {canDelete && (
                                  <Checkbox
                                    checked={selectedPages.has(page.id)}
                                    onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
                                    className="mt-1 flex-shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-sm truncate">{page.title}</h3>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate font-mono">{page.slug}</p>
                                  {page.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{page.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <span>{page.views} views</span>
                                    <span>•</span>
                                    <span>{page.updatedAt}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/dashboard/builder?pageId=${page.id}`);
                                        }}
                                        disabled={!canEdit}
                                      >
                                        <MdEdit className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{canEdit ? 'Edit Template' : 'No permission'}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {canCreate && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/dashboard/create-form?template=${page.id}`);
                                          }}
                                        >
                                          <MdLink className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Create Form</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(page.id, page.title);
                                        }}
                                        disabled={!canDelete}
                                      >
                                        <MdDelete className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{canDelete ? 'Delete' : 'No permission'}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Forms & Pages Card */}
              {(typeFilter === 'all' || typeFilter === 'pages') && (
                <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <MdVisibility className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Forms & Pages</CardTitle>
                          <CardDescription>
                            Published application forms
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700">
                        {formPages.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {formPages.length === 0 ? (
                      <div className="py-12 text-center">
                        <MdVisibility className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No forms or pages yet. Create forms from templates.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => navigate('/dashboard/create-form')}
                          disabled={templates.length === 0}
                        >
                          Create Form
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {formPages.map((page) => (
                          <div
                            key={page.id}
                            className="group p-4 rounded-lg border border-border hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/30 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {canDelete && (
                                  <Checkbox
                                    checked={selectedPages.has(page.id)}
                                    onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
                                    className="mt-1 flex-shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-sm truncate">{page.title}</h3>
                                    {page.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {page.category}
                                      </Badge>
                                    )}
                                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                      {page.status === 'published' ? 'Published' : 'Draft'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate font-mono">{page.slug}</p>
                                  {page.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{page.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <span>{page.views} views</span>
                                    <span>•</span>
                                    <span>{page.updatedAt}</span>
                                    {page.status === 'published' && (
                                      <>
                                        <span>•</span>
                                        <Button
                                          variant="link"
                                          className="h-auto p-0 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(
                                              `${window.location.origin}/dashboard/preview?templateId=${page.id}`,
                                            );
                                            toast.success('Link copied!');
                                          }}
                                        >
                                          Copy Link
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/dashboard/pages/${page.id}`);
                                        }}
                                      >
                                        <MdVisibility className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {page.status === 'published' && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/dashboard/preview?templateId=${page.id}`, '_blank');
                                          }}
                                        >
                                          <MdOpenInNew className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Open Live</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/dashboard/builder?pageId=${page.id}`);
                                        }}
                                        disabled={!canEdit}
                                      >
                                        <MdEdit className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{canEdit ? 'Edit' : 'No permission'}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {canCreate && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            duplicatePage.mutate(page.id, {
                                              onSuccess: (created) => {
                                                // Take user to the duplicated page/template for editing
                                                if (created?.id) navigate(`/dashboard/builder?pageId=${created.id}`);
                                              },
                                            });
                                          }}
                                          disabled={!canCreate || duplicatePage.isPending}
                                        >
                                          <MdContentCopy className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Duplicate</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {canPublish && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (page.status === 'published') {
                                              unpublishPage.mutate(page.id);
                                            } else {
                                              publishPage.mutate(page.id);
                                            }
                                          }}
                                          disabled={publishPage.isPending || unpublishPage.isPending}
                                        >
                                          {page.status === 'published' ? (
                                            <MdVisibilityOff className="w-4 h-4" />
                                          ) : (
                                            <MdVisibility className="w-4 h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {page.status === 'published' ? 'Unpublish' : 'Publish'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(page.id, page.title);
                                        }}
                                        disabled={!canDelete}
                                      >
                                        <MdDelete className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{canDelete ? 'Delete' : 'No permission'}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <CreatePageModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
        <DeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Page"
          itemName={
            selectedPage?.title ||
            (selectedPages.size > 0 ? `${selectedPages.size} selected pages` : undefined)
          }
          isLoading={deletePages.isPending}
        />
      </div>
    </>
  );
};

export default Pages;
