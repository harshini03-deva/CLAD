import { useRef } from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Article } from '@/lib/types';
import { useBookmarks, useTextToSpeech } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon
} from 'react-share';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { startSpeech, isSpeaking, stopSpeech } = useTextToSpeech();
  const isCurrentArticleBookmarked = isBookmarked(article.id);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(article);
  };
  
  const handleSpeechClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSpeaking) {
      stopSpeech();
    } else {
      startSpeech(`${article.title}. ${article.description}`);
    }
  };
  
  const formattedDate = format(new Date(article.publishedAt), 'MMM d, yyyy');
  const timeAgo = getTimeAgo(new Date(article.publishedAt));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <Link to={`/article/${article.id}`} className="block">
        <img 
          src={article.image || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={article.title} 
          className={`w-full ${featured ? 'h-56' : 'h-40'} object-cover`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
      </Link>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">{article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{article.estimatedReadingTime} min read</span>
        </div>
        
        <Link to={`/article/${article.id}`} className="block flex-grow">
          <h3 className={`${featured ? 'text-xl' : 'text-lg'} font-bold text-gray-900 dark:text-white font-serif mb-2 hover:underline`}>
            {article.title}
          </h3>
          
          {featured && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {article.description}
            </p>
          )}
          
          {!featured && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
              {article.description}
            </p>
          )}
        </Link>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">{article.source.name} • {timeAgo}</span>
          </div>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                    onClick={handleBookmarkClick}
                  >
                    <span className="material-icons text-sm">
                      {isCurrentArticleBookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCurrentArticleBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                    onClick={handleSpeechClick}
                  >
                    <span className="material-icons text-sm">
                      {isSpeaking ? 'stop' : 'volume_up'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSpeaking ? 'Stop reading' : 'Read article'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                >
                  <span className="material-icons text-sm">share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent ref={dropdownRef} align="end" className="p-2">
                <div className="flex space-x-2 mb-2">
                  <FacebookShareButton url={article.url} title={article.title} onClick={(e) => e.stopPropagation()}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  
                  <TwitterShareButton url={article.url} title={article.title} onClick={(e) => e.stopPropagation()}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                  
                  <LinkedinShareButton url={article.url} title={article.title} onClick={(e) => e.stopPropagation()}>
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  
                  <WhatsappShareButton url={article.url} title={article.title} onClick={(e) => e.stopPropagation()}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                </div>
                <DropdownMenuItem asChild>
                  <button 
                    className="w-full text-left" 
                    onClick={() => {
                      navigator.clipboard.writeText(article.url);
                    }}
                  >
                    Copy link
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time difference
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return format(date, 'MMM d, yyyy');
}

export default ArticleCard;
