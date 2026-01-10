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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePages } from '@/hooks/useQueries';
import type { FormElement } from '@/types/builder';

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elements: FormElement[];
  onPublish: (pageId: string | null, pageData: { title: string; slug: string; status: 'published' | 'draft' }) => void;
  isPublishing?: boolean;
}

export const PublishModal = ({ open, onOpenChange, elements, onPublish, isPublishing = false }: PublishModalProps) => {
  const { data: pages } = usePages();
  const [publishOption, setPublishOption] = useState<'new' | 'existing'>('new');
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  useEffect(() => {
    if (open && publishOption === 'new') {
      setTitle('');
      setSlug('');
      setStatus('published');
    }
  }, [open, publishOption]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title
    const generatedSlug = '/' + value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (publishOption === 'new') {
      if (!title || !slug) return;
      onPublish(null, { title, slug, status });
    } else {
      if (!selectedPageId) return;
      onPublish(selectedPageId, { title: '', slug: '', status: 'published' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Publish Template</DialogTitle>
            <DialogDescription>
              Publish your template as a page or update an existing page
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Publish Option */}
            <div className="space-y-3">
              <Label>Publish Option</Label>
              <RadioGroup value={publishOption} onValueChange={(value: 'new' | 'existing') => setPublishOption(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="font-normal cursor-pointer">Create New Page</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="font-normal cursor-pointer">Update Existing Page</Label>
                </div>
              </RadioGroup>
            </div>

            {publishOption === 'existing' ? (
              <div className="space-y-2">
                <Label htmlFor="page-select">Select Page</Label>
                <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages?.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title} ({page.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    placeholder="Contact Form"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="/contact-form"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: 'published' | 'draft') => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPublishing || (publishOption === 'new' && (!title || !slug)) || (publishOption === 'existing' && !selectedPageId)}>
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

