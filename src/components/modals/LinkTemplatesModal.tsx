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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePages, useLinkTemplates } from '@/hooks/useQueries';
import type { Page } from '@/lib/api';
import { MdDescription, MdLink, MdArrowUpward, MdArrowDownward, MdPublish, MdVisibilityOff, MdDelete } from 'react-icons/md';
import { toast } from 'sonner';

interface LinkTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplateIds?: string[];
  initialTemplateId?: string;
}

export const LinkTemplatesModal = ({ 
  open, 
  onOpenChange,
  selectedTemplateIds = [],
  initialTemplateId
}: LinkTemplatesModalProps) => {
  const { data: pages } = usePages();
  const linkTemplates = useLinkTemplates();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');

  // Get only templates (not named pages)
  const templates = pages?.filter(p => p.isTemplate && !p.isNamed) || [];

  useEffect(() => {
    if (open) {
      // Initialize with provided template IDs
      const idsToUse = initialTemplateId 
        ? [initialTemplateId, ...selectedTemplateIds.filter(id => id !== initialTemplateId)]
        : selectedTemplateIds.length > 0 
        ? selectedTemplateIds 
        : [];
      
      setSelectedIds(idsToUse);
      setTitle('');
      setSlug('');
      setDescription('');
      setStatus('draft');
    }
  }, [open, selectedTemplateIds, initialTemplateId]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title
    const generatedSlug = '/' + value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const handleToggleTemplate = (templateId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(templateId)) {
        // Remove from selection
        return prev.filter(id => id !== templateId);
      } else {
        // Add to end of selection
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedIds.length === 0) {
      toast.error('Please select at least one template');
      return;
    }
    
    if (!title || !slug) {
      toast.error('Please provide a title and slug');
      return;
    }

    linkTemplates.mutate(
      {
        templateIds: selectedIds,
        pageData: { title, slug, description: description || undefined, status },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MdLink className="w-5 h-5" />
              Create Application Form
            </DialogTitle>
            <DialogDescription>
              Link templates one after another to build a complete application form. Arrange them in the order you want users to fill them out.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Available Templates */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Available Templates</Label>
                <p className="text-xs text-muted-foreground">
                  Select templates to build your form. Click to add them to your form structure.
                </p>
                {templates.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-lg">
                    <MdDescription className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No templates available. Build templates in the Builder first.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] border rounded-lg p-3">
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
              </div>

              {/* Right: Selected Templates Order */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Form Structure ({selectedIds.length} template{selectedIds.length !== 1 ? 's' : ''})
                </Label>
                <p className="text-xs text-muted-foreground">
                  This is how your application form will be structured. Use arrows to reorder templates.
                </p>
                {selectedIds.length === 0 ? (
                  <div className="h-[400px] border border-dashed rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <MdLink className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Select templates from the left to build your page
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] border rounded-lg p-3 bg-muted/20">
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
              </div>
            </div>

            {/* Page Details - Only show when templates are selected */}
            {selectedIds.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-base font-semibold">Page Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title *</Label>
                    <Input
                      id="title"
                      placeholder="My Application Form"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="/my-application-form"
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
                    placeholder="A brief description of this page..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
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
                      ? 'Page will be immediately available to users' 
                      : 'Page will be saved as draft and can be published later'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                linkTemplates.isPending || 
                selectedIds.length === 0 || 
                !title || 
                !slug
              }
            >
              {linkTemplates.isPending ? (
                status === 'published' ? 'Publishing...' : 'Creating...'
              ) : (
                status === 'published' ? (
                  <>
                    <MdPublish className="w-4 h-4 mr-2" />
                    Create & Publish Page
                  </>
                ) : (
                  'Create Page'
                )
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
