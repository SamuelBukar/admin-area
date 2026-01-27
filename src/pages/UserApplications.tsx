import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MdAdd } from 'react-icons/md';
import { usePublishedPages } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';

export default function UserApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: publishedPages, isLoading } = usePublishedPages();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('name');

  // Get unique categories from pages
  const categories = useMemo(() => {
    if (!publishedPages) return [];
    const cats = new Set<string>();
    publishedPages.forEach(page => {
      if (page.category) cats.add(page.category);
    });
    return Array.from(cats).sort();
  }, [publishedPages]);

  const filteredPages = useMemo(() => {
    if (!publishedPages) return [];
    let filtered = [...publishedPages];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(page => page.category === selectedCategory);
    }

    // Sort
    if (selectedSort === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'recent') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (selectedSort === 'category') {
      filtered.sort((a, b) => {
        const catA = a.category || 'zzz';
        const catB = b.category || 'zzz';
        return catA.localeCompare(catB);
      });
    }

    return filtered;
  }, [publishedPages, selectedCategory, selectedSort]);

  const handleStartApplication = (pageId: string) => {
    navigate(`/dashboard/applications/${pageId}`);
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
            Select a form to start a new application
          </p>
        </div>

        {/* Dropdowns Only */}
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {/* Category Filter Dropdown */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Filter by Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sort Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sort By</label>
                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="recent">Most Popular</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Main Application Form Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Form to Start Application</label>
                  <Select
                    onValueChange={(pageId) => handleStartApplication(pageId)}
                    disabled={!publishedPages || publishedPages.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={filteredPages.length === 0 ? "No forms available" : "Choose a form to start..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPages.length === 0 ? (
                        <SelectItem value="" disabled>
                          {selectedCategory !== 'all' ? 'No forms in this category' : 'No forms available'}
                        </SelectItem>
                      ) : (
                        filteredPages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            <div className="flex items-center gap-2">
                              <span>{page.title}</span>
                              {page.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {page.category}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {filteredPages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {filteredPages.length} form{filteredPages.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Helper Message */}
        {!isLoading && publishedPages && publishedPages.length > 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Use the dropdown above to select a form and start your application.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  View all your submitted applications from <span className="font-medium">My Applications</span> in the sidebar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
