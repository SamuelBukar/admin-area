import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FormElement } from '@/types/builder';
import { ElementRenderer } from '@/components/builder/ElementRenderer';
import { Button } from '@/components/ui/button';
import { PublishModal } from '@/components/modals/PublishModal';
import { usePublishPage } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { MdArrowBack, MdPublish } from 'react-icons/md';

const Preview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [elements, setElements] = useState<FormElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const publishPage = usePublishPage();
  const canPublish = hasPermission('pages', 'publish');

  useEffect(() => {
    const templateId = searchParams.get('templateId');
    
    if (templateId) {
      // Get template from sessionStorage
      const stored = sessionStorage.getItem('preview-template');
      if (stored) {
        try {
          const templateData = JSON.parse(stored);
          if (templateData.previewId === templateId && templateData.elements) {
            setElements(templateData.elements);
          }
        } catch (error) {
          console.error('Failed to parse template data:', error);
        }
      }
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleDelete = () => {
    // No-op in preview
  };

  const handleUpdate = () => {
    // No-op in preview
  };

  const handlePublish = (pageId: string | null, pageData: { title: string; slug: string; status: 'published' | 'draft' }) => {
    publishPage.mutate(
      { pageId, elements, pageData },
      {
        onSuccess: () => {
          setPublishModalOpen(false);
          // Optionally navigate back to pages or builder
          setTimeout(() => {
            navigate('/dashboard/pages');
          }, 1000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (elements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No template to preview</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Preview | LandAdmin Builder</title>
        <meta name="description" content="Preview your template" />
      </Helmet>
      
      <div className="min-h-screen bg-canvas">
        {/* Header with actions */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex-shrink-0"
              >
                <MdArrowBack className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Preview</h1>
                <p className="text-sm text-muted-foreground">
                  {elements.length} element{elements.length !== 1 ? 's' : ''} in template
                </p>
              </div>
            </div>
            
            {canPublish && (
              <Button
                onClick={() => setPublishModalOpen(true)}
                disabled={elements.length === 0 || publishPage.isPending}
                className="flex-shrink-0"
              >
                <MdPublish className="w-4 h-4 mr-2" />
                {publishPage.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            )}
          </div>
        </header>

        {/* Preview content */}
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl shadow-widget p-6 lg:p-10">
              <div className="space-y-4">
                {elements.map((element) => (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Publish Modal */}
        <PublishModal
          open={publishModalOpen}
          onOpenChange={setPublishModalOpen}
          elements={elements}
          onPublish={handlePublish}
          isPublishing={publishPage.isPending}
        />
      </div>
    </>
  );
};

export default Preview;

