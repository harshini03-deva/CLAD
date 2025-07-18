import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import FeaturedNews from '@/components/news/FeaturedArticle';
import NewsGrid from '@/components/news/NewsGrid';
import Challenges from '@/components/focus/Challenges';
import AiInsights from '@/components/ai/AiInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GAMES } from '@/lib/constants';
import GameCard from '@/components/games/GameCard';
import { useUserStore } from '@/lib/store';
import { Article } from '@/lib/types';
import { Link } from 'wouter';

const Home = () => {
  const [page, setPage] = useState<number>(1);
  const { incrementStreak } = useUserStore();
  
  // Update user streak on page load
  useEffect(() => {
    incrementStreak();
  }, []);
  
  // Fetch featured articles
  const { 
    data: featuredArticles,
    isLoading: isFeaturedLoading,
    error: featuredError
  } = useQuery<Article[]>({
    queryKey: ['/api/news/featured'],
  });
  
  // Fetch personalized articles
  const { 
    data: personalizedArticles,
    isLoading: isPersonalizedLoading,
    error: personalizedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useQuery<{ articles: Article[]; hasMore: boolean }>({
    queryKey: ['/api/news/personalized', page],
  });
  
  const loadMoreArticles = () => {
    setPage(prevPage => prevPage + 1);
    fetchNextPage();
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Featured News Section */}
      {isFeaturedLoading ? (
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[190px] w-full" />
              <Skeleton className="h-[190px] w-full" />
            </div>
          </div>
        </div>
      ) : featuredError ? (
        <div className="mb-8">
          <Card>
            <CardContent className="p-8 text-center">
              <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
              <h3 className="text-lg font-medium mb-2">Failed to load featured articles</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We couldn't fetch the featured articles. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : featuredArticles && featuredArticles.length >= 3 ? (
        <FeaturedNews 
          featuredArticle={featuredArticles[0]} 
          secondaryArticles={featuredArticles.slice(1, 3)} 
        />
      ) : null}
      
      {/* Daily Challenges Section */}
      <Challenges />
      
      {/* Personalized News Section */}
      {isPersonalizedLoading ? (
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      ) : personalizedError ? (
        <div className="mb-8">
          <Card>
            <CardContent className="p-8 text-center">
              <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
              <h3 className="text-lg font-medium mb-2">Failed to load articles</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We couldn't fetch the personalized articles. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : personalizedArticles ? (
        <NewsGrid 
          title="For You"
          articles={personalizedArticles.articles || []}
          hasMore={hasNextPage}
          onLoadMore={loadMoreArticles}
          isLoading={isFetchingNextPage}
          showCustomizeButton={true}
          onCustomize={() => { window.scrollTo(0, 0); document.getElementById('focus-mode-btn')?.click(); }}
        />
      ) : null}
      
      {/* Mind Games Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Mind Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game) => (
            <GameCard 
              key={game.id}
              id={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              color={game.color}
            />
          ))}
        </div>
      </section>
      
      {/* AI Insights Section */}
      <AiInsights />
    </div>
  );
};

export default Home;
