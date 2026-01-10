import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MdSearch, MdDescription, MdVisibility, MdAdd } from 'react-icons/md';
import { usePublishedPages, useUserApplications } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';

export default function UserApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: publishedPages, isLoading } = usePublishedPages();
  const { data: userApplications } = useUserApplications(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = useMemo(() => {
    if (!publishedPages) return [];
    return publishedPages.filter(page =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [publishedPages, searchQuery]);

  // Get application status for each page
  const getPageApplicationStatus = (pageId: string): string | null => {
    if (!userApplications) return null;
    const application = userApplications.find(app => app.pageId === pageId);
    return application?.status || null;
  };

  const handleStartApplication = (pageId: string) => {
    navigate(`/dashboard/applications/${pageId}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      submitted: 'default',
      under_review: 'default',
      approved: 'default',
      rejected: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  return (
    <>
      <Helmet>
        <title>Applications | LandAdmin Builder</title>
        <meta name="description" content="Browse available application forms" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Applications</h1>
          <p className="text-muted-foreground">
            Browse and submit available application forms
          </p>
        </div>

        {/* Search */}
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MdDescription className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No applications found matching your search.' : 'No applications available yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page, index) => {
              const status = getPageApplicationStatus(page.id);
              return (
                <Card
                  key={page.id}
                  className="animate-fade-in hover:shadow-widget-hover transition-shadow duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                      {status && (
                        <Badge variant={getStatusBadge(status)}>
                          {status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="font-mono text-xs">
                      {page.slug}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {page.views} views
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={status ? 'outline' : 'default'}
                          className="flex-1"
                          onClick={() => handleStartApplication(page.id)}
                        >
                          {status ? (
                            <>
                              <MdVisibility className="w-4 h-4 mr-2" />
                              View Application
                            </>
                          ) : (
                            <>
                              <MdAdd className="w-4 h-4 mr-2" />
                              Start Application
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

