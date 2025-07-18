import { useState } from 'react';
import ArticleCard from './ArticleCard';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface NewsGridProps {
  articles: Article[];
  title: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  showCustomizeButton?: boolean;
  onCustomize?: () => void;
}

const NewsGrid = ({ 
  articles, 
  title, 
  hasMore = false, 
  onLoadMore, 
  isLoading = false,
  showCustomizeButton = false,
  onCustomize
}: NewsGridProps) => {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        {showCustomizeButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCustomize}
            className="text-primary dark:text-blue-400 flex items-center text-sm hover:underline"
          >
            <span>Customize</span>
            <span className="material-icons ml-1">tune</span>
          </Button>
        )}
      </div>
      
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {hasMore && (
            <Button
              variant="outline"
              className="mt-6 w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <span className="material-icons text-4xl text-gray-400 mb-2">article</span>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No articles found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later</p>
        </div>
      )}
    </section>
  );
};

export default NewsGrid;
