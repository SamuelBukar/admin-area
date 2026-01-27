import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePages, useLinkTemplates } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MdDescription, 
  MdLink, 
  MdArrowUpward, 
  MdArrowDownward, 
  MdPublish, 
  MdVisibilityOff,
  MdDelete,
  MdArrowBack,
  MdSave
} from 'react-icons/md';
import { toast } from 'sonner';

export default function CreateForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission, user } = useAuth();
  const { data: pages, isLoading: pagesLoading, refetch: refetchPages } = usePages();
  const linkTemplates = useLinkTemplates();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  
  // Predefined categories
  const formCategories = [
    'Land Allocation',
    'Registration',
    'Application',
    'Complaint',
    'Request',
    'Survey',
    'Other'
  ];

  // Get only templates (not named pages)
  const templates = useMemo(() => {
    if (!pages) return [];
    return pages.filter(p => p.isTemplate === true && p.isNamed === false);
  }, [pages]);
  
  const canCreate = hasPermission('pages', 'create');

  // Safety check - must be after hooks
  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Refetch pages when component mounts
  useEffect(() => {
    refetchPages();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select template from query parameter
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId && templates.length > 0) {
      const templateExists = templates.some(t => t.id === templateId);
      if (templateExists && !selectedIds.includes(templateId)) {
        setSelectedIds([templateId]);
      }
    }
  }, [searchParams, templates.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if no permission
  useEffect(() => {
    if (canCreate === false) {
      toast.error('You don\'t have permission to create forms');
      navigate('/dashboard/pages');
    }
  }, [canCreate, navigate]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title
    if (value.trim()) {
      const generatedSlug = '/' + value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    } else {
      setSlug('');
    }
  };

  const handleToggleTemplate = (templateId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        return [...prev, templateId];
      }
    });
  };

  const moveTemplateUp = (index: number) => {
    if (index === 0) return;
    setSelectedIds(prev => {
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };

  const moveTemplateDown = (index: number) => {
    if (index === selectedIds.length - 1) return;
    setSelectedIds(prev => {
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

  const removeTemplate = (templateId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== templateId));
  };

  const getTemplateById = (id: string) => templates.find(t => t.id === id);

  const handleSave = async (saveStatus: 'published' | 'draft' = status) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one template');
      return;
    }
    
    if (!title.trim() || !slug.trim()) {
      toast.error('Please provide a title and slug');
      return;
    }

    try {
      await linkTemplates.mutateAsync({
        templateIds: selectedIds,
        pageData: { 
          title: title.trim(), 
          slug: slug.trim(), 
          description: description.trim() || undefined, 
          category: category.trim() || undefined, 
          status: saveStatus 
        },
      });
      toast.success(saveStatus === 'published' ? 'Form published successfully!' : 'Form saved as draft');
      navigate('/dashboard/pages');
    } catch (error) {
      console.error('Failed to save form:', error);
      // Error toast is handled by the hook
    }
  };

  // Show loading or redirect if no permission
  if (canCreate === false) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Form | LandAdmin Builder</title>
        <meta name="description" content="Create application forms by linking templates" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/pages')}
            >
              <MdArrowBack className="w-5 h-5 mr-2" />
              Back to Pages
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Application Form</h1>
              <p className="text-sm text-muted-foreground">
                Link templates one after another to build a complete application form
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={linkTemplates.isPending || selectedIds.length === 0 || !title.trim() || !slug.trim()}
            >
              <MdSave className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={linkTemplates.isPending || selectedIds.length === 0 || !title.trim() || !slug.trim()}
            >
              {linkTemplates.isPending ? (
                'Publishing...'
              ) : (
                <>
                  <MdPublish className="w-4 h-4 mr-2" />
                  Publish Form
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>
              Provide basic information for your application form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title *</Label>
                <Input
                  id="title"
                  placeholder="Land Allocation Application Form"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  placeholder="/land-allocation-form"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="A brief description of this application form..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {formCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Categorize your form for better organization
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'published' | 'draft') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <MdVisibilityOff className="w-4 h-4" />
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="published">
                    <div className="flex items-center gap-2">
                      <MdPublish className="w-4 h-4" />
                      Published
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {status === 'published' 
                  ? 'Form will be immediately available to users' 
                  : 'Form will be saved as draft and can be published later'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Templates Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>
                Select templates to add to your form. Click to select/deselect.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-lg">
                  <MdDescription className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No templates available. Build templates in the Builder first.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard/builder')}
                  >
                    Go to Builder
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] border rounded-lg p-3">
                  <div className="space-y-2">
                    {templates.map((template) => {
                      const isSelected = selectedIds.includes(template.id);
                      return (
                        <div
                          key={template.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-primary/10 border-primary shadow-sm' 
                              : 'hover:bg-accent/50 border-border'
                          }`}
                          onClick={() => handleToggleTemplate(template.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleTemplate(template.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{template.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {template.elements?.length || 0} elements
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {template.slug} • Updated {template.updatedAt}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Form Structure */}
          <Card>
            <CardHeader>
              <CardTitle>
                Form Structure ({selectedIds.length} template{selectedIds.length !== 1 ? 's' : ''})
              </CardTitle>
              <CardDescription>
                This is how your application form will be structured. Use arrows to reorder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedIds.length === 0 ? (
                <div className="h-[500px] border border-dashed rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <MdLink className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Select templates from the left to build your form
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[500px] border rounded-lg p-3 bg-muted/20">
                  <div className="space-y-2">
                    {selectedIds.map((templateId, index) => {
                      const template = getTemplateById(templateId);
                      if (!template) return null;
                      return (
                        <div
                          key={templateId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background border shadow-sm"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="default" className="text-xs font-mono w-8 h-8 flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{template.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {template.elements?.length || 0} elements
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTemplateUp(index);
                              }}
                              disabled={index === 0}
                              title="Move up"
                            >
                              <MdArrowUpward className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTemplateDown(index);
                              }}
                              disabled={index === selectedIds.length - 1}
                              title="Move down"
                            >
                              <MdArrowDownward className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTemplate(templateId);
                              }}
                              title="Remove"
                            >
                              <MdDelete className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
