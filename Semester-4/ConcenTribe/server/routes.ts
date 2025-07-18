import type { Express } from "express";
import { Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchNewsArticles, searchNewsArticles, fetchArticleById } from "./services/newsService";
import { generateAiInsights, analyzeArticle, factCheckClaim } from "./services/aiService";
import { generateNewsInsights } from "./services/openAiService";
import { 
  getRiddles, 
  getTongueTwisters, 
  getSudokuPuzzle, 
  checkSudokuSolution, 
  getCrosswordPuzzle, 
  checkCrosswordAnswers 
} from "./services/gameService";
import { 
  searchYouTubeVideos, 
  getYouTubeVideosByCategory, 
  getFocusModeVideos 
} from "./services/youtubeService";
import { 
  getCommunities, 
  getUserCommunities,
  getCommunityFeed,
  joinCommunity, 
  leaveCommunity 
} from "./services/communityService";
import { estimateReadingTime } from "../shared/utils";
import { setupAuth } from "./auth";
import { generateAiAnalysisForArticle, factCheckWithAI, summarizeText } from "./services/openAiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);
  
  // put application routes here
  // prefix all routes with /api

  // News Routes
  app.get("/api/news/featured", async (req, res) => {
    try {
      // Get featured articles (top headlines)
      const featuredArticles = await fetchNewsArticles("home", 1, 5);
      res.json(featuredArticles);
    } catch (error) {
      console.error("Error fetching featured news:", error);
      res.status(500).json({ message: "Failed to fetch featured news" });
    }
  });

  app.get("/api/news/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { articles, hasMore } = await fetchNewsArticles(category, page, limit);
      res.json({ articles, hasMore });
    } catch (error) {
      console.error(`Error fetching ${req.params.category} news:`, error);
      res.status(500).json({ message: `Failed to fetch ${req.params.category} news` });
    }
  });

  app.get("/api/news/article/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const article = await fetchArticleById(id);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const { articles, hasMore } = await searchNewsArticles(query, page, limit);
      res.json({ articles, hasMore });
    } catch (error) {
      console.error("Error searching articles:", error);
      res.status(500).json({ message: "Failed to search articles" });
    }
  });

  // Personalized News Routes
  app.get("/api/news/personalized", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const interests = req.query.interests as string[] || [];
      const sources = req.query.sources as string[] || [];

      // If no preferences set, return general news
      if (interests.length === 0 && sources.length === 0) {
        const { articles, hasMore } = await fetchNewsArticles("home", page, limit);
        return res.json({ articles, hasMore });
      }

      // For demo purposes, we'll use general news with categories matching interests
      const { articles, hasMore } = await fetchNewsArticles("home", page, limit * 2);

      // Filter articles based on interests and sources
      const filteredArticles = articles.filter(article => {
        // Check if article matches any interest
        const matchesInterest = interests.length === 0 || 
          interests.some(interest => 
            article.category.includes(interest) || 
            article.title.toLowerCase().includes(interest.toLowerCase()) ||
            (article.description && article.description.toLowerCase().includes(interest.toLowerCase()))
          );

        // Check if article matches any source
        const matchesSource = sources.length === 0 || 
          sources.some(source => 
            article.source.name.toLowerCase().includes(source.toLowerCase())
          );

        return matchesInterest && matchesSource;
      }).slice(0, limit);

      res.json({ 
        articles: filteredArticles, 
        hasMore: hasMore && filteredArticles.length === limit 
      });
    } catch (error) {
      console.error("Error fetching personalized news:", error);
      res.status(500).json({ message: "Failed to fetch personalized news" });
    }
  });

  app.get("/api/focus/articles", async (req, res) => {
    try {
      // This would normally use user preferences from the session
      // For demo, we'll fetch a mix of categories
      const categories = ["technology", "health", "business", "science"];
      let allArticles: any[] = [];

      // Fetch articles from each category
      for (const category of categories) {
        const { articles } = await fetchNewsArticles(category, 1, 3);
        allArticles = [...allArticles, ...articles];
      }

      // Shuffle the articles to mix categories
      allArticles = allArticles.sort(() => Math.random() - 0.5);

      res.json(allArticles);
    } catch (error) {
      console.error("Error fetching focus mode articles:", error);
      res.status(500).json({ message: "Failed to fetch focus mode articles" });
    }
  });
  
  // YouTube Video routes
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const maxResults = parseInt(req.query.limit as string) || 5;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const videos = await searchYouTubeVideos(query, maxResults);
      res.json(videos);
    } catch (error) {
      console.error("Error searching YouTube videos:", error);
      res.status(500).json({ message: "Failed to search YouTube videos" });
    }
  });
  
  app.get("/api/youtube/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const maxResults = parseInt(req.query.limit as string) || 5;
      
      const videos = await getYouTubeVideosByCategory(category, maxResults);
      res.json(videos);
    } catch (error) {
      console.error(`Error fetching ${req.params.category} YouTube videos:`, error);
      res.status(500).json({ message: `Failed to fetch ${req.params.category} YouTube videos` });
    }
  });
  
  app.get("/api/focus/videos", async (req, res) => {
    try {
      // Parse interests and sources from query parameters
      let interests: string[] = [];
      if (typeof req.query.interests === 'string') {
        interests = [req.query.interests];
      } else if (Array.isArray(req.query.interests)) {
        interests = req.query.interests as string[];
      } else {
        interests = ["technology", "health", "business", "science"];
      }
      
      // Parse sources
      let sources: string[] = [];
      if (typeof req.query.sources === 'string') {
        sources = [req.query.sources];
      } else if (Array.isArray(req.query.sources)) {
        sources = req.query.sources as string[];
      }
      
      const maxResults = parseInt(req.query.limit as string) || 10;
      
      const videos = await getFocusModeVideos(interests, sources, maxResults);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching focus mode videos:", error);
      res.status(500).json({ message: "Failed to fetch focus mode videos" });
    }
  });

  // Bookmark Routes
  app.get("/api/bookmarks", async (req, res) => {
    try {
      // In a real implementation, we would get user ID from session
      const userId = 1; // Demo user ID
      const bookmarkedArticles = await storage.getBookmarks(userId);
      res.json(bookmarkedArticles);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    try {
      const { articleId } = req.body;
      const userId = 1; // Demo user ID

      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      // Get or create article in our database
      let article = await storage.getArticleByApiId(articleId);

      if (!article) {
        // Fetch article details from API
        const fetchedArticle = await fetchArticleById(articleId);

        if (!fetchedArticle) {
          return res.status(404).json({ message: "Article not found" });
        }

        // Create article in database
        article = await storage.createArticle({
          apiId: fetchedArticle.id,
          title: fetchedArticle.title,
          description: fetchedArticle.description || "",
          content: fetchedArticle.content || "",
          url: fetchedArticle.url,
          imageUrl: fetchedArticle.image || "",
          publishedAt: new Date(fetchedArticle.publishedAt),
          sourceId: fetchedArticle.source.id || "",
          sourceName: fetchedArticle.source.name,
          category: fetchedArticle.category,
          estimatedReadingTime: fetchedArticle.estimatedReadingTime || estimateReadingTime(fetchedArticle.content || "")
        });
      }

      // Add bookmark
      await storage.addBookmark(userId, article.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      res.status(500).json({ message: "Failed to add bookmark" });
    }
  });

  app.delete("/api/bookmarks/:articleId", async (req, res) => {
    try {
      const { articleId } = req.params;
      const userId = 1; // Demo user ID

      // Get article
      const article = await storage.getArticleByApiId(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Remove bookmark
      const removed = await storage.removeBookmark(userId, article.id);

      if (!removed) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  // AI Insights Routes
  app.get("/api/ai/insights/:articleId?", async (req, res) => {
    try {
      const { articleId } = req.params;
      
      if (articleId) {
        // Get article content to determine its category
        const article = await fetchArticleById(articleId);
        if (!article) {
          return res.status(404).json({ message: "Article not found" });
        }
        
        const articleCategory = article.category.toLowerCase();
        console.log(`Getting AI insights for article in category: ${articleCategory}`);
        
        try {
          // Try to generate real-time insights using OpenAI
          console.log("Attempting to generate real-time insights with OpenAI for article:", article.title);
          
          // Create a topArticles object with the current article as the only item
          const topArticlesByCategory: Record<string, any[]> = {
            [articleCategory]: [
              {
                title: article.title,
                description: article.description || "",
                content: article.content,
                url: article.url,
                source: { name: article.source.name },
                category: articleCategory
              }
            ]
          };
          
          // Generate insights using OpenAI
          const insights = await generateNewsInsights(topArticlesByCategory);
          
          if (insights && insights.length > 0) {
            // Add the article ID to the relatedArticles array for each insight
            const enrichedInsights = insights.map(insight => ({
              ...insight,
              relatedArticles: [articleId]
            }));
            
            return res.json(enrichedInsights);
          }
        } catch (openAiError) {
          console.error("Error generating real-time insights with OpenAI:", openAiError);
          console.log("Falling back to pre-generated insights...");
        }
        
        // Fallback to pre-generated insights
        const allInsights = await generateAiInsights();
        
        // Filter insights to match the article's category
        let categoryInsights = allInsights.filter(insight => 
          insight.category?.toLowerCase() === articleCategory
        );
        
        // If no category-specific insights found, send analysis-type insights as fallback
        if (categoryInsights.length === 0) {
          categoryInsights = allInsights.filter(insight => insight.type === 'analysis');
        }
        
        // If still no insights, send the first 3 insights as fallback
        if (categoryInsights.length === 0) {
          categoryInsights = allInsights.slice(0, 3);
        }
        
        // For article pages, prioritize analysis-type insights
        const analysisInsights = categoryInsights.filter(insight => insight.type === 'analysis');
        const trendInsights = categoryInsights.filter(insight => insight.type === 'trend');
        const factCheckInsights = categoryInsights.filter(insight => insight.type === 'factCheck');
        
        // Create a balanced set of insights for the article
        const articleInsights = [
          // Include 1 analysis if available
          ...(analysisInsights.length > 0 ? [analysisInsights[0]] : []),
          // Include up to 2 trends
          ...(trendInsights.length > 0 ? trendInsights.slice(0, 2) : []),
          // Include 1 fact check if available
          ...(factCheckInsights.length > 0 ? [factCheckInsights[0]] : [])
        ];
        
        // Add the article ID to the relatedArticles array for each insight
        const enrichedInsights = articleInsights.map(insight => ({
          ...insight,
          relatedArticles: [articleId]
        }));
        
        return res.json(enrichedInsights);
      }

      // For homepage, try to generate real-time insights using OpenAI
      console.log("Generating AI insights for homepage");
      
      try {
        // Fetch top articles from different categories
        const categories = ['technology', 'health', 'business', 'entertainment', 'sports', 'science'];
        const topArticlesByCategory: Record<string, any[]> = {};
        
        // Fetch 1 top article from each category
        for (const category of categories) {
          try {
            const { articles } = await fetchNewsArticles(category, 1, 1);
            if (articles && articles.length > 0) {
              topArticlesByCategory[category] = articles;
            }
          } catch (fetchError) {
            console.error(`Error fetching top articles for ${category}:`, fetchError);
          }
        }
        
        // Generate insights using OpenAI if we have articles
        if (Object.keys(topArticlesByCategory).length > 0) {
          const insights = await generateNewsInsights(topArticlesByCategory);
          if (insights && insights.length > 0) {
            return res.json(insights);
          }
        }
      } catch (openAiError) {
        console.error("Error generating real-time insights with OpenAI:", openAiError);
        console.log("Falling back to pre-generated insights...");
      }
      
      // Fallback to pre-generated insights
      const allInsights = await generateAiInsights();
      
      // Group insights by category and then select one from each category
      const categories = ['technology', 'health', 'business', 'entertainment', 'sports', 'science'];
      const selectedInsights: any[] = [];
      
      // Select one insight from each category
      for (const category of categories) {
        const categoryInsights = allInsights.filter(insight => 
          insight.category?.toLowerCase() === category
        );
        
        if (categoryInsights.length > 0) {
          // Get a random insight from this category
          const randomIndex = Math.floor(Math.random() * categoryInsights.length);
          selectedInsights.push(categoryInsights[randomIndex]);
        }
      }
      
      // If we don't have enough insights, add more random ones
      if (selectedInsights.length < 5) {
        const remainingInsights = allInsights.filter(insight => 
          !selectedInsights.some(selected => selected.id === insight.id)
        );
        
        const additionalCount = Math.min(5 - selectedInsights.length, remainingInsights.length);
        selectedInsights.push(...remainingInsights.slice(0, additionalCount));
      }
      
      res.json(selectedInsights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      
      // Provide fallback insights in case of error
      const fallbackInsights = [
        {
          id: "fallback1",
          type: "analysis",
          title: "AI Analysis Temporarily Unavailable",
          content: "Our AI analysis system is currently experiencing issues. We'll be back soon with fresh insights on the latest news.",
          sentiment: "neutral",
          confidence: 80,
          category: "technology",
          relatedArticles: []
        },
        {
          id: "fallback2",
          type: "trend",
          title: "Trending Technology: Cloud Computing",
          content: "Cloud computing continues to transform how businesses operate, with increasing adoption across industries driving innovation and efficiency.",
          sentiment: "positive",
          confidence: 85,
          category: "technology",
          relatedArticles: []
        },
        {
          id: "fallback3",
          type: "factCheck",
          title: "Health Research Facts",
          content: "Recent studies confirm regular physical activity significantly reduces risk across multiple health conditions.",
          sentiment: "positive",
          confidence: 90,
          category: "health",
          relatedArticles: []
        }
      ];
      
      res.json(fallbackInsights);
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      console.log("Using OpenAI to analyze article content");
      const analysis = await generateAiAnalysisForArticle(content);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });
  
  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { text, maxLength } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Text content is required" });
      }

      console.log("Using OpenAI to summarize text content");
      const summary = await summarizeText(text, maxLength);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing content:", error);
      res.status(500).json({ message: "Failed to summarize content" });
    }
  });

  app.post("/api/ai/factcheck", async (req, res) => {
    try {
      const { claim } = req.body;

      if (!claim) {
        return res.status(400).json({ message: "Claim is required" });
      }

      console.log("Using OpenAI to fact check claim:", claim);
      const factCheck = await factCheckWithAI(claim);
      res.json(factCheck);
    } catch (error) {
      console.error("Error fact-checking claim:", error);
      res.status(500).json({ message: "Failed to fact-check claim" });
    }
  });

  // Mind Games Routes
  app.get("/api/games/riddles", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const riddles = await getRiddles(limit);
      res.json(riddles);
    } catch (error) {
      console.error("Error fetching riddles:", error);
      res.status(500).json({ message: "Failed to fetch riddles" });
    }
  });

  app.get("/api/games/tongue-twisters", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const tongueTwisters = await getTongueTwisters(limit);
      res.json(tongueTwisters);
    } catch (error) {
      console.error("Error fetching tongue twisters:", error);
      res.status(500).json({ message: "Failed to fetch tongue twisters" });
    }
  });

  app.get("/api/games/sudoku", async (req, res) => {
    try {
      const sudoku = await getSudokuPuzzle();
      res.json(sudoku);
    } catch (error) {
      console.error("Error fetching sudoku puzzle:", error);
      res.status(500).json({ message: "Failed to fetch sudoku puzzle" });
    }
  });

  app.post("/api/games/sudoku/check", async (req, res) => {
    try {
      const { grid } = req.body;

      if (!grid) {
        return res.status(400).json({ message: "Grid is required" });
      }

      const result = await checkSudokuSolution(grid);
      res.json(result);
    } catch (error) {
      console.error("Error checking sudoku solution:", error);
      res.status(500).json({ message: "Failed to check sudoku solution" });
    }
  });

  app.get("/api/games/crossword", async (req, res) => {
    try {
      const difficulty = req.query.difficulty as string || "medium";
      const crossword = await getCrosswordPuzzle(difficulty);
      res.json(crossword);
    } catch (error) {
      console.error("Error fetching crossword puzzle:", error);
      res.status(500).json({ message: "Failed to fetch crossword puzzle" });
    }
  });

  app.post("/api/games/crossword/check", async (req, res) => {
    try {
      const { puzzleId, userAnswers } = req.body;

      if (!puzzleId || !userAnswers) {
        return res.status(400).json({ message: "Puzzle ID and user answers are required" });
      }

      const result = await checkCrosswordAnswers(puzzleId, userAnswers);
      res.json(result);
    } catch (error) {
      console.error("Error checking crossword answers:", error);
      res.status(500).json({ message: "Failed to check crossword answers" });
    }
  });

  // Community Routes
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await getCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.get("/api/communities/joined", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const communities = await getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching joined communities:", error);
      res.status(500).json({ message: "Failed to fetch joined communities" });
    }
  });

  app.get("/api/communities/feed", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const feed = await getCommunityFeed(userId);
      res.json(feed);
    } catch (error) {
      console.error("Error fetching community feed:", error);
      res.status(500).json({ message: "Failed to fetch community feed" });
    }
  });

  app.post("/api/communities/:id/join", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 1; // Demo user ID

      const communityId = parseInt(id);
      if (isNaN(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      await joinCommunity(userId, communityId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.post("/api/communities/:id/leave", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 1; // Demo user ID

      const communityId = parseInt(id);
      if (isNaN(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      await leaveCommunity(userId, communityId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving community:", error);
      res.status(500).json({ message: "Failed to leave community" });
    }
  });

  // Badge Routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/badges/user", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.post("/api/badges/award", async (req, res) => {
    try {
      const { badgeId } = req.body;
      const userId = 1; // Demo user ID

      if (!badgeId) {
        return res.status(400).json({ message: "Badge ID is required" });
      }

      await storage.addUserBadge(userId, badgeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ message: "Failed to award badge" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}