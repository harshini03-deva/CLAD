import ArticleCard from './ArticleCard';
import { Article } from '@/lib/types';

interface FeaturedNewsProps {
  featuredArticle: Article;
  secondaryArticles: Article[];
}

const FeaturedNews = ({ featuredArticle, secondaryArticles }: FeaturedNewsProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Today's Top Stories</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ArticleCard article={featuredArticle} featured />
        </div>
        
        <div className="space-y-6">
          {secondaryArticles.slice(0, 2).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;
