import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Article as ArticleType } from '@/lib/types';
import { useBookmarks, useTextToSpeech } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import AiInsights from '@/components/ai/AiInsights';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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

const Article = () => {
  const [_, params] = useRoute('/article/:id');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { startSpeech, isSpeaking, stopSpeech } = useTextToSpeech();
  const [activeTab, setActiveTab] = useState<'article' | 'analysis'>('article');
  const [summarizedContent, setSummarizedContent] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  
  // Fetch article by ID
  const { 
    data: article,
    isLoading,
    error
  } = useQuery<ArticleType>({
    queryKey: [`/api/news/article/${params?.id}`],
  });
  
  // AI Summarization mutation
  const summarizeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/ai/summarize', { 
        text: text,
        maxLength: 250
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setSummarizedContent(data.summary);
      toast({
        title: "Summary Generated",
        description: "AI has created a concise summary of this article",
      });
    },
    onError: (error) => {
      toast({
        title: "Could not generate summary",
        description: "There was an error generating the AI summary",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSummarizing(false);
    }
  });
  
  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);
  
  const handleReadArticle = () => {
    if (!article) return;
    
    if (isSpeaking) {
      stopSpeech();
    } else {
      startSpeech(`${article.title}. ${article.description} ${article.content}`);
    }
  };
  
  const handleToggleBookmark = () => {
    if (!article) return;
    toggleBookmark(article);
  };
  
  const handleSummarize = () => {
    if (!article) return;
    
    // Return if already summarized or summarizing
    if (isSummarizing) return;
    
    // Use existing summary if available
    if (summarizedContent) {
      setSummarizedContent(null);
      return;
    }
    
    setIsSummarizing(true);
    
    // Combine title, description and content for better context
    const textToSummarize = `${article.title}. ${article.description || ''} ${article.content || ''}`;
    summarizeMutation.mutate(textToSummarize);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-[300px] w-full mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
        </div>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
            <h3 className="text-lg font-medium mb-2">Article not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              We couldn't find the article you're looking for. It may have been removed or the link is incorrect.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format date
  const formattedDate = format(new Date(article.publishedAt), 'MMMM d, yyyy');
  const isCurrentArticleBookmarked = isBookmarked(article.id);
  const shareUrl = article.url;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded-full">
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {article.estimatedReadingTime} min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-serif mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-white font-medium">{article.source.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleToggleBookmark}
                      className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                    >
                      <span className="material-icons">
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
                      onClick={handleReadArticle}
                      className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                    >
                      <span className="material-icons">
                        {isSpeaking ? 'stop' : 'volume_up'}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSpeaking ? 'Stop reading' : 'Read article'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                >
                  <span className="material-icons">share</span>
                </Button>
                
                <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 hidden group-hover:block">
                  <div className="flex space-x-2 mb-2">
                    <FacebookShareButton url={shareUrl} title={article.title}>
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    
                    <TwitterShareButton url={shareUrl} title={article.title}>
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    
                    <LinkedinShareButton url={shareUrl} title={article.title}>
                      <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                    
                    <WhatsappShareButton url={shareUrl} title={article.title}>
                      <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                  </div>
                  <button 
                    className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary p-1"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                    }}
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-6">
            <button
              className={`py-2 px-1 font-medium text-gray-700 dark:text-gray-300 border-b-2 ${
                activeTab === 'article' 
                  ? 'border-primary text-primary dark:text-primary' 
                  : 'border-transparent hover:text-primary dark:hover:text-primary'
              }`}
              onClick={() => setActiveTab('article')}
            >
              Article
            </button>
            <button
              className={`py-2 px-1 font-medium text-gray-700 dark:text-gray-300 border-b-2 ${
                activeTab === 'analysis' 
                  ? 'border-primary text-primary dark:text-primary' 
                  : 'border-transparent hover:text-primary dark:hover:text-primary'
              }`}
              onClick={() => setActiveTab('analysis')}
            >
              AI Analysis
            </button>
          </div>
        </div>
        
        {/* Article Content */}
        {activeTab === 'article' && (
          <div className="article-content">
            {article.image && (
              <div className="mb-6">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-auto rounded-lg object-cover max-h-[500px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {summarizedContent ? "AI-Generated Summary:" : "Description:"}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="flex items-center gap-1 text-xs"
                      >
                        {isSummarizing ? (
                          <>
                            <span className="material-icons text-sm animate-spin">refresh</span>
                            Summarizing...
                          </>
                        ) : summarizedContent ? (
                          <>
                            <span className="material-icons text-sm">article</span>
                            Show Original
                          </>
                        ) : (
                          <>
                            <span className="material-icons text-sm">auto_awesome</span>
                            AI Summarize
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{summarizedContent ? "Show original description" : "Generate AI summary"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className={`text-gray-700 dark:text-gray-300 ${summarizedContent ? "p-3 bg-primary/5 border border-primary/10 rounded-md" : ""}`}>
                {summarizedContent || article.description || "No description available for this article."}
              </div>
            </div>
            
            <div className="prose max-w-none prose-gray dark:prose-invert mb-8">
              {article.content ? 
                article.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))
                : 
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                  <p className="mb-4">Full article content is not available in preview mode.</p>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  >
                    Read Full Article on {article.source.name}
                    <span className="material-icons ml-1 text-sm">open_in_new</span>
                  </a>
                </div>
              }
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline flex items-center"
              >
                Read full article on {article.source.name}
                <span className="material-icons ml-1 text-sm">open_in_new</span>
              </a>
              
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleToggleBookmark}
                        className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                      >
                        <span className="material-icons">
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
                        onClick={handleReadArticle}
                        className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                      >
                        <span className="material-icons">
                          {isSpeaking ? 'stop' : 'volume_up'}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSpeaking ? 'Stop reading' : 'Read article'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Analysis */}
        {activeTab === 'analysis' && (
          <div className="article-analysis">
            <AiInsights articleId={params?.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Article;
