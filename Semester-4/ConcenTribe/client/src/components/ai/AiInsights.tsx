import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AiInsight } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AiInsightsProps {
  articleId?: string;
}

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const AiInsights = ({ articleId }: AiInsightsProps) => {
  // Store visible insights separately from fetched insights
  const [visibleInsights, setVisibleInsights] = useState<AiInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<AiInsight | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { 
    data: insights, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery<AiInsight[]>({
    queryKey: articleId ? [`/api/ai/insights/${articleId}`] : ['/api/ai/insights'],
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  // When insights are loaded or refetched, set visible insights
  useEffect(() => {
    if (insights && insights.length > 0) {
      // For article pages, always show exactly the insights returned by the API
      if (articleId) {
        setVisibleInsights(insights);
        return;
      }
      
      // For homepage and category pages, cycle through different insights
      if (visibleInsights.length > 0) {
        // Get insights that weren't visible before, prioritizing different types
        const remainingInsights = insights.filter(
          insight => !visibleInsights.some(vi => vi.id === insight.id)
        );
        
        // If we have enough new insights, show those
        if (remainingInsights.length >= 3) {
          setVisibleInsights(shuffleArray(remainingInsights).slice(0, 5));
        } else {
          // Otherwise, create a balanced set of insights by type
          const trendInsights = shuffleArray(insights.filter(i => i.type === 'trend'));
          const analysisInsights = shuffleArray(insights.filter(i => i.type === 'analysis'));
          const factCheckInsights = shuffleArray(insights.filter(i => i.type === 'factCheck'));
          
          // Create a balanced mix
          const balanced = [
            ...(analysisInsights.length > 0 ? [analysisInsights[0]] : []),
            ...(trendInsights.length > 0 ? trendInsights.slice(0, 2) : []),
            ...(factCheckInsights.length > 0 ? [factCheckInsights[0]] : []),
          ];
          
          // If we still don't have enough, fill with random insights
          if (balanced.length < 3) {
            const additional = shuffleArray(insights).slice(0, 5 - balanced.length);
            setVisibleInsights([...balanced, ...additional]);
          } else {
            setVisibleInsights(balanced.slice(0, 5));
          }
        }
      } else {
        // First load, create a balanced set of insights
        const trendInsights = shuffleArray(insights.filter(i => i.type === 'trend'));
        const analysisInsights = shuffleArray(insights.filter(i => i.type === 'analysis'));
        const factCheckInsights = shuffleArray(insights.filter(i => i.type === 'factCheck'));
        
        const balanced = [
          ...(analysisInsights.length > 0 ? [analysisInsights[0]] : []),
          ...(trendInsights.length > 0 ? trendInsights.slice(0, 2) : []),
          ...(factCheckInsights.length > 0 ? [factCheckInsights[0]] : []),
        ];
        
        if (balanced.length < 3) {
          const additional = shuffleArray(insights).slice(0, 5 - balanced.length);
          setVisibleInsights([...balanced, ...additional]);
        } else {
          setVisibleInsights(balanced.slice(0, 5));
        }
      }
    }
  }, [insights, articleId]);

  const handleRefresh = () => {
    // For article-specific insights, refetch from server
    if (articleId) {
      refetch();
      return;
    }
    
    // For homepage insights, create a new balanced set by type
    if (insights && insights.length > 0) {
      // Create a balanced set of insights by type
      const trendInsights = shuffleArray(insights.filter(i => i.type === 'trend'));
      const analysisInsights = shuffleArray(insights.filter(i => i.type === 'analysis'));
      const factCheckInsights = shuffleArray(insights.filter(i => i.type === 'factCheck'));
      
      // Get insights that weren't visible before when possible
      const remainingTrends = trendInsights.filter(
        insight => !visibleInsights.some(vi => vi.id === insight.id)
      );
      const remainingAnalysis = analysisInsights.filter(
        insight => !visibleInsights.some(vi => vi.id === insight.id)
      );
      const remainingFactChecks = factCheckInsights.filter(
        insight => !visibleInsights.some(vi => vi.id === insight.id)
      );
      
      // Create a balanced mix of new insights when possible
      const balanced = [
        ...(remainingAnalysis.length > 0 ? [remainingAnalysis[0]] : analysisInsights.length > 0 ? [analysisInsights[0]] : []),
        ...(remainingTrends.length > 1 ? remainingTrends.slice(0, 2) : trendInsights.length > 0 ? trendInsights.slice(0, 2) : []),
        ...(remainingFactChecks.length > 0 ? [remainingFactChecks[0]] : factCheckInsights.length > 0 ? [factCheckInsights[0]] : []),
      ];
      
      // If we don't have enough insights, fill with random ones
      if (balanced.length < 3) {
        const additional = shuffleArray(insights).slice(0, 5 - balanced.length);
        setVisibleInsights([...balanced, ...additional]);
      } else {
        setVisibleInsights(balanced.slice(0, 5));
      }
    }
  };
  
  const handleViewFullAnalysis = (insight: AiInsight) => {
    setSelectedInsight(insight);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <span className="material-icons mr-2 text-primary">psychology</span>
            AI News Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
            <h3 className="text-lg font-medium mb-2">Failed to load insights</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              We couldn't fetch the AI insights. Please try again later.
            </p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <span className="material-icons mr-2 text-primary">psychology</span>
              AI News Insights
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <span className="material-icons">
                {isRefetching ? 'hourglass_empty' : 'refresh'}
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleInsights && visibleInsights.length > 0 ? (
            <>
              {/* Trends Section */}
              {visibleInsights.some(insight => insight.type === 'trend') && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Today's Top Trends</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    {visibleInsights
                      .filter(insight => insight.type === 'trend')
                      .map(insight => (
                        <li key={insight.id} className="flex items-start">
                          <span className={`material-icons mr-2 text-sm ${
                            insight.sentiment === 'positive' 
                              ? 'text-green-500' 
                              : insight.sentiment === 'negative' 
                                ? 'text-red-500' 
                                : 'text-gray-500'
                          }`}>
                            {insight.sentiment === 'positive' 
                              ? 'trending_up' 
                              : insight.sentiment === 'negative' 
                                ? 'trending_down' 
                                : 'trending_flat'}
                          </span>
                          <div>
                            <span>{insight.content}</span>
                            <button 
                              onClick={() => handleViewFullAnalysis(insight)}
                              className="ml-1 text-xs text-primary hover:underline"
                            >
                              View more
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              
              {/* Fact Check Section */}
              {visibleInsights.some(insight => insight.type === 'factCheck') && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Fact Check</h3>
                  {visibleInsights
                    .filter(insight => insight.type === 'factCheck')
                    .map(insight => (
                      <div key={insight.id} className="flex items-start">
                        <span className="material-icons text-amber-500 mr-2">fact_check</span>
                        <div>
                          <p className="text-gray-700 dark:text-gray-300 mb-1">
                            <strong>Claim:</strong> "{insight.title}"
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Verdict:</span> {insight.content}
                          </p>
                          <button 
                            onClick={() => handleViewFullAnalysis(insight)}
                            className="text-xs text-primary hover:underline"
                          >
                            View more
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
              {/* Analysis Section */}
              {visibleInsights.some(insight => insight.type === 'analysis') && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">In-depth Analysis</h3>
                  {visibleInsights
                    .filter(insight => insight.type === 'analysis')
                    .map(insight => (
                      <div key={insight.id} className="mb-3 last:mb-0">
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {insight.content}
                        </p>
                        <div className="mt-1 flex items-center">
                          <button 
                            onClick={() => handleViewFullAnalysis(insight)}
                            className="text-xs text-primary hover:underline mr-3"
                          >
                            View full analysis
                          </button>
                          {insight.relatedArticles && insight.relatedArticles.length > 0 && (
                            <Link to={`/article/${insight.relatedArticles[0]}`} className="text-xs text-primary hover:underline">
                              Read related article
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6">
              <span className="material-icons text-4xl text-gray-400 mb-2">psychology</span>
              <h3 className="text-lg font-medium mb-2">No insights available</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We're analyzing the latest news. Check back soon for AI-powered insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Full Analysis Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedInsight?.title || 'AI Insight Analysis'}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center mt-2 mb-3">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                    selectedInsight?.sentiment === 'positive'
                      ? 'bg-green-100 text-green-800'
                      : selectedInsight?.sentiment === 'negative'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedInsight?.sentiment && selectedInsight.sentiment.charAt(0).toUpperCase() + selectedInsight.sentiment.slice(1)}
                </div>
                {selectedInsight?.category && (
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2">
                    {selectedInsight.category.charAt(0).toUpperCase() + selectedInsight.category.slice(1)}
                  </div>
                )}
                {selectedInsight?.confidence && (
                  <div className="text-xs text-gray-500">
                    Confidence: {selectedInsight.confidence}%
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              {selectedInsight?.content}
            </p>
            
            {selectedInsight?.relatedArticles && selectedInsight.relatedArticles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-2">Related Articles</h4>
                {selectedInsight.relatedArticles.map((articleId, index) => (
                  <Link 
                    key={index} 
                    to={`/article/${articleId}`}
                    className="text-primary hover:underline block mb-1"
                  >
                    Read related article {index > 0 ? index + 1 : ''}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiInsights;
