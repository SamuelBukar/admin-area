import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FormElement } from '@/types/builder';
import { ElementRenderer } from '@/components/builder/ElementRenderer';
import { usePageDetail } from '@/hooks/useQueries';
import { MdArrowBack, MdEdit, MdVisibility } from 'react-icons/md';

const PageView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: page, isLoading } = usePageDetail(id || '');
  const [elements, setElements] = useState<FormElement[]>([]);

  useEffect(() => {
    if (page?.elements) {
      setElements(page.elements);
    }
  }, [page]);

  const handleDelete = () => {
    // No-op in view mode
  };

  const handleUpdate = () => {
    // No-op in view mode
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Page not found</p>
            <Button onClick={() => navigate('/dashboard/pages')} className="mt-4">
              Back to Pages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title} | LandAdmin Builder</title>
        <meta name="description" content={`View ${page.title}`} />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-foreground">{page.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                  {page.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {page.views} views
                </span>
                {page.publishedAt && (
                  <span className="text-sm text-muted-foreground">
                    Published {new Date(page.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button onClick={() => navigate(`/dashboard/builder?pageId=${page.id}`)}>
            <MdEdit className="w-4 h-4 mr-2" />
            Edit Template
          </Button>
        </div>

        {/* Page Content */}
        <Card>
          <CardHeader>
            <CardTitle>Page Preview</CardTitle>
            <CardDescription>
              This is how your page appears to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-canvas rounded-lg p-6 lg:p-10 min-h-[400px]">
              {elements.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <MdVisibility className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No content in this page yet</p>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PageView;

