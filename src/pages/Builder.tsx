import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormBuilder } from '@/components/builder/FormBuilder';
import { Helmet } from 'react-helmet-async';
import { useGetPageTemplate, usePageDetail } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

const Builder = () => {
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  const { data: page, isLoading: pageLoading } = usePageDetail(pageId || '');
  const getTemplate = useGetPageTemplate();
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  useEffect(() => {
    if (pageId && page) {
      setIsLoadingTemplate(true);
      getTemplate.mutate(pageId, {
        onSuccess: (elements) => {
          // Template will be loaded in FormBuilder via prop
          setIsLoadingTemplate(false);
        },
        onError: () => {
          setIsLoadingTemplate(false);
        },
      });
    }
  }, [pageId, page]);

  return (
    <>
      <Helmet>
        <title>{pageId ? 'Edit Template' : 'Builder'} | LandAdmin Builder</title>
        <meta 
          name="description" 
          content="Create professional document and form templates with drag and drop interface." 
        />
      </Helmet>
      {/* FormBuilder with its own sidebar, main sidebar is hidden */}
      <div className="h-full w-full">
        {(pageLoading || isLoadingTemplate) && pageId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-64 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        ) : (
          <FormBuilder pageId={pageId || undefined} initialElements={page?.elements} />
        )}
      </div>
    </>
  );
};

export default Builder;

