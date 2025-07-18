import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { CATEGORIES } from '@/lib/constants';
import { Article } from '@/lib/types';
import NewsGrid from '@/components/news/NewsGrid';
import ArticleCard from '@/components/news/ArticleCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AiInsights from '@/components/ai/AiInsights';
import { ChevronRight, Globe, TrendingUp, Newspaper } from 'lucide-react';

const popularSources = [
  { 
    id: 'cnn', 
    name: 'CNN', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/200px-CNN.svg.png', 
    articles: 253,
    url: 'https://cnn.com'
  },
  { 
    id: 'bbc-news', 
    name: 'BBC News', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/200px-BBC_News_2019.svg.png', 
    articles: 218,
    url: 'https://www.bbc.com/news'
  },
  { 
    id: 'the-washington-post', 
    name: 'Washington Post', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/The_Logo_of_The_Washington_Post_Newspaper.svg/200px-The_Logo_of_The_Washington_Post_Newspaper.svg.png', 
    articles: 197,
    url: 'https://www.washingtonpost.com'
  },
  { 
    id: 'reuters', 
    name: 'Reuters', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Reuters_logo.svg/200px-Reuters_logo.svg.png', 
    articles: 184,
    url: 'https://www.reuters.com'
  },
  { 
    id: 'the-wall-street-journal', 
    name: 'Wall Street Journal', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/WSJ_Logo.svg/200px-WSJ_Logo.svg.png', 
    articles: 156,
    url: 'https://www.wsj.com'
  },
];

const Discover = () => {
  const [location] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [page, setPage] = useState<number>(1);
  
  // Extract category from URL if available
  useEffect(() => {
    if (location.startsWith('/category/')) {
      const urlCategory = location.split('/').pop();
      if (urlCategory && CATEGORIES.some(c => c.id === urlCategory)) {
        setActiveCategory(urlCategory);
      }
    }
  }, [location]);
  
  // Fetch featured articles for each category (used in trending section)
  const { 
    data: featuredArticles,
    isLoading: isLoadingFeatured
  } = useQuery<{ articles: Article[] }>({
    queryKey: ['/api/news/featured'],
  });

  // Fetch personalized news (for you section)
  const { 
    data: personalizedArticles,
    isLoading: isLoadingPersonalized
  } = useQuery<{ articles: Article[] }>({
    queryKey: ['/api/news/personalized'],
  });
  
  // Fetch news by category for current page - main content
  const { 
    data: currentPageData,
    isLoading: isLoadingCurrentPage,
    error: currentPageError
  } = useQuery<{ articles: Article[]; hasMore: boolean }>({
    queryKey: [`/api/news/category/${activeCategory}`, { page }],
  });

  // Get global news - use regular news API but with "world" category
  const { 
    data: globalNews,
    isLoading: isLoadingGlobal
  } = useQuery<{ articles: Article[]; hasMore: boolean }>({
    queryKey: [`/api/news/category/world`, { page: 1, limit: 4 }],
  });
  
  // Keep track of all articles across pages
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  
  // Update allArticles when new data arrives
  useEffect(() => {
    if (currentPageData) {
      if (page === 1) {
        // Reset articles if this is the first page
        setAllArticles(currentPageData.articles);
      } else {
        // Append articles if this is a subsequent page
        setAllArticles(prev => [...prev, ...currentPageData.articles]);
      }
      setHasMore(currentPageData.hasMore);
    }
  }, [currentPageData, page]);
  
  // Reset when category changes
  useEffect(() => {
    setPage(1);
    setAllArticles([]);
    setHasMore(true);
  }, [activeCategory]);
  
  const loadMoreArticles = () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prevPage => prevPage + 1);
      // isLoadingMore will be reset when the useEffect above runs
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPage(1);
  };

  // Select trending articles based on recently published articles
  const getTrendingArticles = () => {
    if (!featuredArticles?.articles) return [];
    
    // Sort by recency and get top 3
    return [...featuredArticles.articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3);
  };

  const renderSkeleton = (count: number = 1) => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(count).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    </div>
  );
  
  // Check if we're on the main discover page or a category page
  const isDiscoverPage = location === "/discover";
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          {isDiscoverPage ? "Discover News" : `${CATEGORIES.find(c => c.id === activeCategory)?.label || 'News'}`}
        </h1>

        {/* Only show highlight sections on the main Discover page */}
        {isDiscoverPage && (
          <>
            {/* Discover Highlights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Trending Now */}
              <Card className="col-span-1 md:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-lg">Trending Now</CardTitle>
                  </div>
                  <CardDescription>Most popular stories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingFeatured ? (
                    <div className="space-y-4">
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  ) : (
                    getTrendingArticles().map((article, index) => (
                      <div key={article.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                        <div className="min-w-[24px] font-bold text-2xl text-muted-foreground">
                          {index + 1}
                        </div>
                        <div>
                          <a 
                            href={`/article/${article.id}`} 
                            className="font-medium hover:text-primary line-clamp-2 text-sm"
                          >
                            {article.title}
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{article.source.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Global News */}
              <Card className="col-span-1 md:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Global Spotlight</CardTitle>
                  </div>
                  <CardDescription>World news headlines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingGlobal ? (
                    <div className="space-y-4">
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  ) : (
                    globalNews?.articles.slice(0, 3).map((article) => (
                      <div key={article.id} className="pb-4 border-b last:border-b-0">
                        <a 
                          href={`/article/${article.id}`} 
                          className="font-medium hover:text-primary line-clamp-2 text-sm"
                        >
                          {article.title}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs px-1.5 py-0 rounded">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{article.source.name}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between" 
                    onClick={() => handleCategoryChange('world')}
                  >
                    View all world news
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Popular Sources */}
              <Card className="col-span-1 md:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Popular Sources</CardTitle>
                  </div>
                  <CardDescription>Leading publishers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularSources.slice(0, 4).map((source) => (
                    <a 
                      key={source.id} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between pb-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={source.logo} 
                            alt={source.name} 
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <span className="font-medium text-sm">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{source.articles}+ articles</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </a>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Explore more sources
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* For You Section - Personalized News */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">For You</h2>
                <Button variant="ghost" size="sm" className="gap-1">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoadingPersonalized ? (
                  Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[280px] w-full" />
                  ))
                ) : (
                  personalizedArticles?.articles.slice(0, 4).map((article) => (
                    <ArticleCard 
                      key={article.id}
                      article={article}
                      variant="compact"
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Main Category Tabs */}
        <Tabs 
          defaultValue={activeCategory} 
          value={activeCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <TabsList className="mb-6 flex flex-wrap h-auto">
            {CATEGORIES.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center"
              >
                <span className="material-icons mr-1 text-sm">{category.icon}</span>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {CATEGORIES.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  {isLoadingCurrentPage ? (
                    renderSkeleton(4)
                  ) : currentPageError ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
                        <h3 className="text-lg font-medium mb-2">Failed to load articles</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          We couldn't fetch the {category.label} articles. Please try again later.
                        </p>
                      </CardContent>
                    </Card>
                  ) : allArticles.length > 0 ? (
                    <NewsGrid 
                      title={category.label}
                      articles={allArticles}
                      hasMore={hasMore}
                      onLoadMore={loadMoreArticles}
                      isLoading={isLoadingMore}
                    />
                  ) : null}
                </div>
                
                <div>
                  <AiInsights />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Discover;
