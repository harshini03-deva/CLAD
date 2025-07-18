import { useState } from 'react';
import { useBookmarks } from '@/lib/store';
import { Article } from '@/lib/types';
import NewsGrid from '@/components/news/NewsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const Bookmarks = () => {
  const { getBookmarks } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const allBookmarks = getBookmarks();
  
  // Filter bookmarks by search query and category
  const filteredBookmarks = allBookmarks.filter(bookmark => {
    const matchesSearch = 
      searchQuery === '' || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      bookmark.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort bookmarks
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'date-asc':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
  
  // Get unique categories from bookmarks
  const uniqueCategories = Array.from(new Set(allBookmarks.map(bookmark => bookmark.category)));
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Bookmarks</h1>
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search your bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Bookmark stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600 dark:text-gray-400">
            {sortedBookmarks.length} {sortedBookmarks.length === 1 ? 'article' : 'articles'} bookmarked
          </div>
        </div>
      </div>
      
      {/* Bookmarked articles */}
      {sortedBookmarks.length > 0 ? (
        <NewsGrid 
          title="Your Bookmarks" 
          articles={sortedBookmarks} 
          hasMore={false}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <span className="material-icons text-6xl text-gray-400 dark:text-gray-600 mb-4">bookmark_border</span>
            <h3 className="text-xl font-medium mb-2">No bookmarks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {allBookmarks.length > 0 
                ? "We couldn't find any bookmarks matching your filters." 
                : "You haven't bookmarked any articles yet. Start reading and save articles to access them later."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Bookmarks;
