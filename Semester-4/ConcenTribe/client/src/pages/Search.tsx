import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Article } from '@/lib/types';
import NewsGrid from '@/components/news/NewsGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  
  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [location]);
  
  // Search for articles
  const { 
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery<{ articles: Article[]; hasMore: boolean }>({
    queryKey: ['/api/search', searchQuery, page],
    enabled: !!searchQuery,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  const loadMoreArticles = () => {
    setPage(prevPage => prevPage + 1);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Search Results</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Search for news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg">
            Failed to load search results. Please try again.
          </div>
        ) : searchResults && searchResults.articles.length > 0 ? (
          <NewsGrid 
            articles={searchResults.articles} 
            title={`Results for "${searchQuery}"`}
            hasMore={searchResults.hasMore}
            onLoadMore={loadMoreArticles}
            isLoading={isLoading}
          />
        ) : searchResults && searchResults.articles.length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg">
            No results found for "{searchQuery}". Try another search term.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;