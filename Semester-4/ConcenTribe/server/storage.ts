import {
  users, articles, bookmarks, badges, userBadges, games, gameProgress, 
  aiInsights, communities, communityMembers, communityPosts,
  User, Article, Bookmark, Badge, UserBadge, Game, GameProgress,
  AiInsight, Community, CommunityMember, CommunityPost,
  InsertUser, InsertArticle, InsertBookmark, InsertBadge, InsertUserBadge,
  InsertGame, InsertGameProgress, InsertAiInsight, InsertCommunity,
  InsertCommunityMember, InsertCommunityPost
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Article methods
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleByApiId(apiId: string): Promise<Article | undefined>;
  getArticlesByCategory(category: string, page: number, limit: number): Promise<{ articles: Article[], hasMore: boolean }>;
  getFeaturedArticles(limit: number): Promise<Article[]>;
  getPersonalizedArticles(interests: string[], sources: string[], page: number, limit: number): Promise<{ articles: Article[], hasMore: boolean }>;
  createArticle(article: InsertArticle): Promise<Article>;
  searchArticles(query: string, page: number, limit: number): Promise<{ articles: Article[], hasMore: boolean }>;
  
  // Bookmark methods
  getBookmarks(userId: number): Promise<Article[]>;
  addBookmark(userId: number, articleId: number): Promise<Bookmark>;
  removeBookmark(userId: number, articleId: number): Promise<boolean>;
  isBookmarked(userId: number, articleId: number): Promise<boolean>;
  
  // Badge methods
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<Badge[]>;
  addUserBadge(userId: number, badgeId: string): Promise<UserBadge>;
  
  // Game methods
  getRiddles(limit: number): Promise<any[]>;
  getTongueTwisters(limit: number): Promise<any[]>;
  getSudokuPuzzle(): Promise<any>;
  getCrosswordPuzzle(): Promise<any>;
  checkGameSolution(gameId: number, solution: any): Promise<boolean>;
  saveGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
  
  // AI Insights methods
  getAiInsights(): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  
  // Community methods
  getCommunities(): Promise<Community[]>;
  getCommunityById(id: number): Promise<Community | undefined>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  joinCommunity(userId: number, communityId: number): Promise<CommunityMember>;
  leaveCommunity(userId: number, communityId: number): Promise<boolean>;
  getCommunityMembers(communityId: number): Promise<CommunityMember[]>;
  getUserCommunities(userId: number): Promise<Community[]>;
  
  // Community Posts methods
  getCommunityPosts(communityId: number): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getUserFeed(userId: number): Promise<CommunityPost[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private bookmarks: Map<number, Bookmark>;
  private badges: Map<number, Badge>;
  private userBadges: Map<number, UserBadge>;
  private games: Map<number, Game>;
  private gameProgress: Map<number, GameProgress>;
  private aiInsights: Map<number, AiInsight>;
  private communities: Map<number, Community>;
  private communityMembers: Map<number, CommunityMember>;
  private communityPosts: Map<number, CommunityPost>;
  
  private userIdCounter: number;
  private articleIdCounter: number;
  private bookmarkIdCounter: number;
  private badgeIdCounter: number;
  private userBadgeIdCounter: number;
  private gameIdCounter: number;
  private gameProgressIdCounter: number;
  private aiInsightIdCounter: number;
  private communityIdCounter: number;
  private communityMemberIdCounter: number;
  private communityPostIdCounter: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.bookmarks = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.games = new Map();
    this.gameProgress = new Map();
    this.aiInsights = new Map();
    this.communities = new Map();
    this.communityMembers = new Map();
    this.communityPosts = new Map();
    
    this.userIdCounter = 1;
    this.articleIdCounter = 1;
    this.bookmarkIdCounter = 1;
    this.badgeIdCounter = 1;
    this.userBadgeIdCounter = 1;
    this.gameIdCounter = 1;
    this.gameProgressIdCounter = 1;
    this.aiInsightIdCounter = 1;
    this.communityIdCounter = 1;
    this.communityMemberIdCounter = 1;
    this.communityPostIdCounter = 1;
    
    // Initialize with demo data
    this.initializeData();
  }

  private initializeData() {
    // Initialize badges
    const badgesData = [
      {
        badgeId: 'focus-champion',
        title: 'Focus Champion',
        icon: 'military_tech',
        backgroundColor: '#fbbc04',
        description: 'Completed 5 focus sessions without interruption',
      },
      {
        badgeId: 'news-explorer',
        title: 'News Explorer',
        icon: 'explore',
        backgroundColor: '#1a73e8',
        description: 'Read articles from 10 different categories',
      },
      {
        badgeId: 'daily-streak',
        title: 'Daily Streak',
        icon: 'local_fire_department',
        backgroundColor: '#34a853',
        description: 'Visited the site for 7 consecutive days',
      },
      {
        badgeId: 'puzzle-master',
        title: 'Puzzle Master',
        icon: 'extension',
        backgroundColor: '#9c27b0',
        description: 'Completed 10 mind games successfully',
      }
    ];
    
    badgesData.forEach(badge => {
      this.createBadge(badge);
    });
    
    // Initialize communities
    const communitiesData = [
      {
        name: "Tech Enthusiasts",
        description: "Discuss the latest in technology and innovation",
        topics: ["Technology", "Innovation", "Gadgets"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Tech"
      },
      {
        name: "Health & Wellness",
        description: "Share tips and news about living a healthy lifestyle",
        topics: ["Health", "Fitness", "Nutrition"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Health"
      },
      {
        name: "Business Minds",
        description: "Exchange ideas about business, entrepreneurship and finance",
        topics: ["Business", "Finance", "Entrepreneurship"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Business"
      },
      {
        name: "Science Explorers",
        description: "Discuss fascinating discoveries and scientific breakthroughs",
        topics: ["Science", "Research", "Space"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Science"
      },
      {
        name: "World Affairs",
        description: "Discuss global news, politics and international relations",
        topics: ["Politics", "International", "Current Events"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=World"
      },
      {
        name: "Sports Fans",
        description: "Discuss sports news, events, and favorite teams",
        topics: ["Sports", "Athletics", "Teams"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Sports"
      },
      {
        name: "Entertainment Buzz",
        description: "Chat about the latest in movies, TV shows, and celebrity news",
        topics: ["Entertainment", "Movies", "TV Shows"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Entertainment"
      },
      {
        name: "Travel Adventures",
        description: "Share travel experiences, tips, and news from around the world",
        topics: ["Travel", "Adventure", "Culture"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Travel"
      },
      {
        name: "Food Lovers",
        description: "Discuss recipes, restaurant reviews, and culinary news",
        topics: ["Food", "Cooking", "Restaurants"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Food"
      },
      {
        name: "Education Hub",
        description: "Discuss educational trends, learning resources, and academic news",
        topics: ["Education", "Learning", "Academic"],
        imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Education"
      }
    ];
    
    communitiesData.forEach(community => {
      this.createCommunity(community);
    });
    
    // Initialize demo user
    this.createUser({
      username: 'demo',
      email: 'demo@concentribe.com',
      password: 'password',
      name: 'Demo User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      bio: 'I love staying updated with the latest news across various categories.',
      preferences: JSON.stringify({
        interests: ['technology', 'health', 'business'],
        sources: ['bbc', 'cnn', 'reuters'],
        formats: ['text', 'video'],
        focusDuration: 20
      }),
      streaks: 0,
      lastVisit: new Date()
    });
    
    // Join demo user to some communities
    const demoUser = this.users.get(1);
    if (demoUser) {
      this.joinCommunity(demoUser.id, 1); // Join Tech Enthusiasts
      this.joinCommunity(demoUser.id, 2); // Join Health & Wellness
      this.joinCommunity(demoUser.id, 3); // Join Business Minds
      this.joinCommunity(demoUser.id, 4); // Join Science Explorers
      this.joinCommunity(demoUser.id, 6); // Join Sports Fans
    
      // Initialize community posts
      const communityPostsData = [
        {
          communityId: 1, // Tech Enthusiasts
          userId: demoUser.id, // Demo user
          title: "Latest advancements in AI",
          content: "I've been following recent developments in artificial intelligence. The pace of innovation is incredible! What are your thoughts on the future of AI?",
          createdAt: new Date()
        },
        {
          communityId: 1, // Tech Enthusiasts
          userId: demoUser.id, // Demo user
          title: "New smartphone releases this year",
          content: "Several major smartphone manufacturers are releasing new models this year. Which ones are you most excited about?",
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          communityId: 1, // Tech Enthusiasts
          userId: demoUser.id, // Demo user
          title: "Concerns about AI ethics",
          content: "With the rapid advancement of AI, ethical concerns are becoming more important. How should we approach AI governance and regulation?",
          createdAt: new Date(Date.now() - 120000000) // ~1.5 days ago
        },
        {
          communityId: 2, // Health & Wellness
          userId: demoUser.id, // Demo user
          title: "Best practices for mental health",
          content: "In today's fast-paced world, maintaining mental health is crucial. What practices have you found most effective?",
          createdAt: new Date(Date.now() - 172800000) // 2 days ago
        },
        {
          communityId: 2, // Health & Wellness
          userId: demoUser.id, // Demo user
          title: "Nutrition tips for busy professionals",
          content: "Finding time to eat healthily can be challenging with a busy schedule. What are your go-to healthy meals that don't take much time to prepare?",
          createdAt: new Date(Date.now() - 195800000) // ~2.3 days ago
        },
        {
          communityId: 3, // Business Minds
          userId: demoUser.id, // Demo user
          title: "Emerging market trends",
          content: "Several emerging markets are showing interesting growth patterns. What sectors do you think will perform best in the next quarter?",
          createdAt: new Date(Date.now() - 259200000) // 3 days ago
        },
        {
          communityId: 3, // Business Minds
          userId: demoUser.id, // Demo user
          title: "Remote work productivity strategies",
          content: "As remote work becomes more permanent for many companies, what strategies have you found effective for maintaining high productivity?",
          createdAt: new Date(Date.now() - 280000000) // ~3.2 days ago
        },
        {
          communityId: 4, // Science Explorers
          userId: demoUser.id, // Demo user
          title: "Recent space discoveries",
          content: "NASA and other space agencies have made several fascinating discoveries recently. Which ones do you find most exciting?",
          createdAt: new Date(Date.now() - 345600000) // 4 days ago
        },
        {
          communityId: 6, // Sports Fans
          userId: demoUser.id, // Demo user
          title: "Olympic Games predictions",
          content: "With the Olympics approaching, which countries do you think will lead the medal count? Any underdog athletes we should watch for?",
          createdAt: new Date(Date.now() - 130500000) // ~1.5 days ago
        },
        {
          communityId: 6, // Sports Fans
          userId: demoUser.id, // Demo user
          title: "Evolution of sports technology",
          content: "Technology is changing how we play and watch sports. What recent sports technology innovations do you find most interesting?",
          createdAt: new Date(Date.now() - 210800000) // ~2.4 days ago
        },
        {
          communityId: 7, // Entertainment Buzz
          userId: demoUser.id, // Demo user
          title: "Must-watch streaming shows",
          content: "With so many streaming platforms, it's hard to keep up with all the great content. What shows have you been enjoying lately?",
          createdAt: new Date(Date.now() - 101200000) // ~1.2 days ago
        },
        {
          communityId: 8, // Travel Adventures
          userId: demoUser.id, // Demo user
          title: "Hidden travel gems",
          content: "Beyond the typical tourist spots, what are some lesser-known destinations you've visited that deserve more attention?",
          createdAt: new Date(Date.now() - 188400000) // ~2.2 days ago
        }
      ];
      
      communityPostsData.forEach(post => {
        this.createCommunityPost(post);
      });
    }
    
    // Initialize demo AI insights
    const insightsData = [
      {
        type: 'trend',
        title: 'Technology Trend',
        content: 'Renewable energy investments are gaining momentum across developing economies',
        sentiment: 'positive',
        confidence: 85,
        relatedArticles: []
      },
      {
        type: 'trend',
        title: 'Health Trend',
        content: 'Healthcare technology startups seeing increased funding despite market uncertainty',
        sentiment: 'positive',
        confidence: 78,
        relatedArticles: []
      },
      {
        type: 'trend',
        title: 'Business Trend',
        content: 'Consumer spending on luxury goods shows decline in major markets',
        sentiment: 'negative',
        confidence: 67,
        relatedArticles: []
      },
      {
        type: 'factCheck',
        title: 'New study shows chocolate prevents heart disease',
        content: 'Misleading. The study shows only a modest correlation with specific dark chocolate consumption, not causation.',
        sentiment: 'neutral',
        confidence: 92,
        relatedArticles: []
      }
    ];
    
    insightsData.forEach(insight => {
      this.createAiInsight(insight);
    });
    
    // Initialize news articles data
    this.seedInitialArticles();
    
    // Initialize mind games data
    this.initializeGamesData();
  }
  
  private seedInitialArticles() {
    // Sample tech articles
    this.createArticle({
      apiId: 'tech1',
      title: 'AI Breakthrough Promises to Transform Healthcare',
      description: 'New AI models are showing remarkable accuracy in diagnosing rare diseases from medical images.',
      content: 'Scientists have developed a new artificial intelligence system that can detect rare diseases from medical scans with unprecedented accuracy. The system, developed by researchers at a leading university, uses deep learning to analyze patterns in medical images that are often missed by human doctors. In initial trials, the AI was able to identify rare conditions with 95% accuracy, compared to 76% for experienced physicians. "This represents a significant breakthrough that could save countless lives," said the lead researcher. The team hopes to deploy the system in hospitals within the next year, pending regulatory approval.',
      url: 'https://tech-news-example.com/ai-healthcare-breakthrough',
      imageUrl: 'https://images.unsplash.com/photo-1581093588401-fdd3d9997628',
      publishedAt: new Date('2023-03-15'),
      sourceId: 'tech-news',
      sourceName: 'Tech Chronicle',
      category: 'technology',
      estimatedReadingTime: 4,
      createdAt: new Date()
    });

    this.createArticle({
      apiId: 'tech2',
      title: 'Quantum Computing Reaches New Milestone',
      description: 'Researchers achieve quantum supremacy with a processor handling complex calculations in minutes.',
      content: 'Scientists have announced a significant breakthrough in quantum computing, with a new processor completing calculations in minutes that would take traditional supercomputers thousands of years. This achievement of "quantum supremacy" represents a major milestone in computing technology and opens the door to solving previously intractable problems in fields ranging from materials science to cryptography. "We\'ve crossed a threshold where quantum computers can tackle problems beyond the capabilities of classical machines," said the project lead. "This will accelerate research in climate modeling, drug discovery, and artificial intelligence." Industry experts predict that practical applications of quantum computing could begin to emerge within the next five years as the technology continues to mature.',
      url: 'https://tech-insider.com/quantum-computing-milestone',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      publishedAt: new Date('2023-02-22'),
      sourceId: 'tech-insider',
      sourceName: 'Tech Insider',
      category: 'technology',
      estimatedReadingTime: 5,
      createdAt: new Date()
    });

    // Sample health articles
    this.createArticle({
      apiId: 'health1',
      title: 'New Study Reveals Benefits of Intermittent Fasting',
      description: 'Research shows intermittent fasting may improve metabolic health and extend lifespan.',
      content: 'A comprehensive study published in a leading medical journal has found that intermittent fasting can significantly improve metabolic health markers and potentially extend lifespan. The research, which followed 2,000 participants over five years, found that those who practiced time-restricted eating had lower inflammation levels, improved insulin sensitivity, and better cardiovascular health compared to control groups. "What\'s particularly exciting is that these benefits were observed even without significant weight loss," noted the study\'s principal investigator. The research suggests that the timing of meals may be just as important as their content for overall health. The most effective protocol appeared to be a 16:8 schedule, where participants consumed all their calories within an 8-hour window each day.',
      url: 'https://health-journal.com/intermittent-fasting-benefits',
      imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
      publishedAt: new Date('2023-03-05'),
      sourceId: 'health-journal',
      sourceName: 'Health & Wellness Journal',
      category: 'health',
      estimatedReadingTime: 6,
      createdAt: new Date()
    });

    this.createArticle({
      apiId: 'health2',
      title: 'Breakthrough in Alzheimer\'s Treatment Shows Promise',
      description: 'Early-stage clinical trial demonstrates significant reduction in brain plaque buildup.',
      content: 'A new drug treatment for Alzheimer\'s disease has shown promising results in early clinical trials, according to researchers. The experimental treatment, which targets the amyloid beta protein that forms plaques in the brains of Alzheimer\'s patients, reduced plaque levels by an average of 65% in trial participants. More importantly, patients receiving the treatment showed slower cognitive decline compared to those receiving a placebo. "While this isn\'t a cure, it represents the most significant progress we\'ve seen in Alzheimer\'s treatment in decades," said the lead researcher. The drug works by helping the immune system identify and clear amyloid plaques. Larger trials are now being planned to confirm these preliminary findings, with researchers cautiously optimistic that the treatment could be available to patients within three to five years.',
      url: 'https://medical-news.org/alzheimers-breakthrough',
      imageUrl: 'https://images.unsplash.com/photo-1579684288903-39fad29257a4',
      publishedAt: new Date('2023-02-18'),
      sourceId: 'medical-news',
      sourceName: 'Medical News Today',
      category: 'health',
      estimatedReadingTime: 5,
      createdAt: new Date()
    });

    // Sample business articles
    this.createArticle({
      apiId: 'business1',
      title: 'Global Supply Chain Disruptions Ease as Shipping Rates Decline',
      description: 'Experts predict more stable conditions for international trade in coming months.',
      content: 'After nearly two years of unprecedented disruptions, global supply chains are showing signs of normalization as shipping rates continue to decline from their pandemic-era peaks. Industry data indicates that container shipping costs have fallen by more than 60% from their 2021 highs, though they remain above pre-pandemic levels. Port congestion has also eased significantly, with waiting times at major ports in Asia, Europe, and North America returning to more manageable levels. "We\'re seeing a gradual return to more predictable supply chain operations," said the chief economist at a leading logistics firm. "However, companies have learned valuable lessons about vulnerability and are now diversifying suppliers and building more resilience into their operations." The improvements come as consumer spending patterns normalize and retailers work through excess inventory accumulated during previous shortages.',
      url: 'https://business-observer.com/supply-chain-recovery',
      imageUrl: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7',
      publishedAt: new Date('2023-03-10'),
      sourceId: 'business-observer',
      sourceName: 'Business Observer',
      category: 'business',
      estimatedReadingTime: 4,
      createdAt: new Date()
    });

    this.createArticle({
      apiId: 'business2',
      title: 'Central Bank Raises Interest Rates to Combat Inflation',
      description: 'Economists divided on whether more aggressive measures will be needed.',
      content: 'The Central Bank announced yesterday that it is raising its benchmark interest rate by 0.5 percentage points to combat persistent inflation, the fourth such increase this year. The move brings the key rate to its highest level in over a decade, reflecting the bank\'s determination to bring inflation back to its 2% target. "The labor market remains tight, and inflation continues to run above our long-term goal," said the bank\'s chair at a press conference. "We anticipate that ongoing rate increases will be appropriate." Financial markets reacted with volatility as investors assessed the implications. Some economists warn that more aggressive measures may be needed, while others fear overtightening could trigger a recession. Consumers can expect higher borrowing costs for mortgages, auto loans, and credit cards as lenders adjust their rates in response to the central bank\'s decision.',
      url: 'https://financial-times.com/central-bank-rate-hike',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      publishedAt: new Date('2023-03-01'),
      sourceId: 'financial-times',
      sourceName: 'Financial Times',
      category: 'business',
      estimatedReadingTime: 5,
      createdAt: new Date()
    });

    // Sample world news articles
    this.createArticle({
      apiId: 'world1',
      title: 'Historic Climate Agreement Reached at International Summit',
      description: 'Over 190 countries commit to more ambitious emissions reduction targets.',
      content: 'In a landmark agreement at the latest international climate summit, more than 190 countries have committed to more ambitious greenhouse gas emissions reduction targets. The new accord, which builds on previous climate frameworks, aims to limit global warming to 1.5 degrees Celsius above pre-industrial levels. Developed nations have pledged $100 billion annually to help developing countries transition to cleaner energy sources and adapt to climate impacts. "This represents a crucial moment in our collective effort to address the climate crisis," said the summit president. "For the first time, we have concrete commitments from all major emitters." The agreement includes mechanisms for regular progress reviews and increased transparency in reporting emissions. Climate activists cautiously welcomed the deal while emphasizing that implementation will be key to its success.',
      url: 'https://global-news-network.com/climate-agreement',
      imageUrl: 'https://images.unsplash.com/photo-1532408840957-031d8034aeef',
      publishedAt: new Date('2023-03-12'),
      sourceId: 'gnn',
      sourceName: 'Global News Network',
      category: 'world',
      estimatedReadingTime: 6,
      createdAt: new Date()
    });

    this.createArticle({
      apiId: 'world2',
      title: 'Peace Negotiations Begin After Regional Conflict',
      description: 'International mediators facilitate talks between opposing factions.',
      content: 'Peace negotiations have begun between opposing factions following six months of regional conflict that displaced over 200,000 people. The talks, facilitated by international mediators, aim to establish a framework for a permanent ceasefire and address underlying political grievances. "This represents a critical opportunity to end the suffering of civilians and chart a path toward lasting peace," said the head of the mediation team. Initial discussions have focused on humanitarian access to affected areas and the withdrawal of armed forces from key locations. While significant challenges remain, observers note that both sides have shown willingness to compromise on certain issues. Regional experts emphasize that addressing economic disparities and ensuring political representation for marginalized groups will be essential for any sustainable peace agreement. Humanitarian organizations continue to provide emergency assistance to displaced populations.',
      url: 'https://international-herald.com/peace-talks-begin',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
      publishedAt: new Date('2023-02-28'),
      sourceId: 'international-herald',
      sourceName: 'International Herald',
      category: 'world',
      estimatedReadingTime: 5,
      createdAt: new Date()
    });

    // Sample sports articles
    this.createArticle({
      apiId: 'sports1',
      title: 'Underdog Team Clinches Championship in Overtime Thriller',
      description: 'Historic victory comes after remarkable playoff run that defied expectations.',
      content: 'In one of the most stunning upsets in recent sports history, the underdog team clinched the championship with a dramatic overtime victory last night. The team, which had been given just a 2% chance of making the playoffs at midseason, completed their remarkable run with a 28-25 win in the final. "Nobody believed in us except the guys in our locker room," said the team captain, who was named Most Valuable Player after scoring the winning points. The championship represents a crowning achievement for their veteran coach, who had previously experienced three runner-up finishes in his 25-year career. The team overcame multiple injuries to key players and won three consecutive playoff games on the road before last night\'s victory. City officials have announced plans for a victory parade on Monday to celebrate the historic achievement.',
      url: 'https://sports-network.com/underdog-champions',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
      publishedAt: new Date('2023-03-14'),
      sourceId: 'sports-network',
      sourceName: 'Sports Network',
      category: 'sports',
      estimatedReadingTime: 4,
      createdAt: new Date()
    });

    this.createArticle({
      apiId: 'sports2',
      title: 'Star Athlete Signs Record-Breaking Contract Extension',
      description: 'Five-year deal makes player the highest-paid in the sport\'s history.',
      content: 'The reigning MVP has signed a record-breaking five-year contract extension worth $250 million, making them the highest-paid athlete in the sport\'s history. The deal, which includes $180 million in guaranteed money, keeps the star with the team through the 2028 season. "This organization has believed in me from day one, and I\'m thrilled to continue our journey together," said the player at a press conference announcing the extension. The 27-year-old has led the team to the playoffs in each of the past four seasons, including a championship appearance two years ago. Team management emphasized that the contract reflects not only the athlete\'s performance but also their leadership and community involvement. Industry analysts note that the deal sets a new benchmark for elite players in the sport and could trigger a wave of contract renegotiations across the league.',
      url: 'https://sports-today.com/record-contract-signed',
      imageUrl: 'https://images.unsplash.com/photo-1486128105845-91daff43f404',
      publishedAt: new Date('2023-03-08'),
      sourceId: 'sports-today',
      sourceName: 'Sports Today',
      category: 'sports',
      estimatedReadingTime: 4,
      createdAt: new Date()
    });

    // Sample entertainment articles
    this.createArticle({
      apiId: 'entertainment1',
      title: 'Surprise Album Release Breaks Streaming Records',
      description: 'Artist\'s unannounced new work reaches 50 million streams in 24 hours.',
      content: 'A major recording artist shattered streaming records with the surprise release of a new album, reaching 50 million streams within the first 24 hours. The album, dropped without any prior announcement or promotion, has generated massive buzz for its innovative sound and collaborative features with several other prominent musicians. "I wanted the music to speak for itself without any marketing hype," the artist explained in a social media post. Music critics have praised the work for its artistic evolution and thematic depth. The unprecedented streaming numbers surpass the previous record by nearly 30%. Industry experts suggest that the success of this unconventional release strategy may inspire other artists to bypass traditional marketing campaigns. The album\'s lyrics address personal struggles and social issues, with several tracks already generating viral dance challenges across social media platforms.',
      url: 'https://entertainment-weekly.com/surprise-album-record',
      imageUrl: 'https://images.unsplash.com/photo-1501527460-aaaaa1e579d8',
      publishedAt: new Date('2023-03-10'),
      sourceId: 'entertainment-weekly',
      sourceName: 'Entertainment Weekly',
      category: 'entertainment',
      estimatedReadingTime: 4,
      createdAt: new Date()
    });

    this.createArticle({
      apiId: 'entertainment2',
      title: 'Film Festival Announces Diverse Lineup for Annual Event',
      description: 'Independent productions from 45 countries will compete for prestigious awards.',
      content: 'Organizers of the prestigious international film festival have announced a diverse lineup for this year\'s event, featuring 120 films from 45 countries. The selection includes work from a record number of first-time directors and female filmmakers. "This year\'s program reflects our commitment to showcasing diverse voices and perspectives from around the world," said the festival director. The competition section includes several critically acclaimed productions that have already generated Oscar buzz. A retrospective will honor the work of an influential director celebrating their 50th year in cinema. Industry panels will address timely topics including streaming platforms\' impact on theatrical distribution and ethical concerns around AI in filmmaking. The festival, which attracts celebrities and industry professionals from around the globe, will run for ten days beginning next month.',
      url: 'https://cinema-gazette.com/film-festival-lineup',
      imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
      publishedAt: new Date('2023-03-05'),
      sourceId: 'cinema-gazette',
      sourceName: 'Cinema Gazette',
      category: 'entertainment',
      estimatedReadingTime: 5,
      createdAt: new Date()
    });

    // Sample science articles
    this.createArticle({
      apiId: 'science1',
      title: 'Astronomers Discover Earth-like Planet in Habitable Zone',
      description: 'New exoplanet shows potential for liquid water and Earth-similar conditions.',
      content: 'Astronomers have announced the discovery of an Earth-like exoplanet orbiting within the habitable zone of its star, approximately 40 light-years from our solar system. The planet, designated KOI-4878.01, is approximately 1.2 times the size of Earth with similar gravity and receives comparable solar radiation to our planet. Initial spectroscopic analysis suggests the presence of an atmosphere containing water vapor. "This represents one of our most promising candidates yet for a potentially habitable world outside our solar system," said the lead astronomer. The discovery was made using a combination of space telescope data and ground-based observations. Researchers plan more detailed studies using next-generation telescopes to analyze the planet\'s atmospheric composition more thoroughly and look for potential biosignatures that could indicate the presence of life.',
      url: 'https://astronomy-today.com/earthlike-exoplanet',
      imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679',
      publishedAt: new Date('2023-03-15'),
      sourceId: 'astronomy-today',
      sourceName: 'Astronomy Today',
      category: 'science',
      estimatedReadingTime: 6,
      createdAt: new Date()
    });

    this.createArticle({
      apiId: 'science2',
      title: 'Researchers Achieve Breakthrough in Nuclear Fusion Energy',
      description: 'Experiment produces net energy gain, bringing clean fusion power closer to reality.',
      content: 'Scientists at a national laboratory have achieved a significant milestone in nuclear fusion research, demonstrating a reaction that produced more energy than was required to initiate it. The experiment, using advanced laser technology to compress hydrogen fuel, sustained fusion for 5 seconds and generated approximately 20% more energy than was input. "This represents the first scientific demonstration of fusion ignition in a controlled laboratory setting," explained the project director. "While commercial applications remain years away, this proof of concept resolves key scientific questions that have challenged researchers for decades." Nuclear fusion promises virtually limitless clean energy by replicating the process that powers the sun, without the radioactive waste associated with current nuclear fission plants. The breakthrough has attracted renewed interest from private investors, with several companies now accelerating their own fusion energy research programs.',
      url: 'https://scientific-american.com/fusion-breakthrough',
      imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
      publishedAt: new Date('2023-02-22'),
      sourceId: 'scientific-american',
      sourceName: 'Scientific American',
      category: 'science',
      estimatedReadingTime: 7,
      createdAt: new Date()
    });
  }
  
  private initializeGamesData() {
    // Riddles
    const riddlesData = [
      {
        type: 'riddle',
        data: {
          question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
          answer: 'Echo',
          difficulty: 'medium'
        },
        difficulty: 'medium'
      },
      {
        type: 'riddle',
        data: {
          question: 'The more you take, the more you leave behind. What am I?',
          answer: 'Footsteps',
          difficulty: 'easy'
        },
        difficulty: 'easy'
      },
      {
        type: 'riddle',
        data: {
          question: 'What has keys but no locks, space but no room, and you can enter but not go in?',
          answer: 'Keyboard',
          difficulty: 'medium'
        },
        difficulty: 'medium'
      }
    ];
    
    riddlesData.forEach(riddle => {
      this.createGame(riddle);
    });
    
    // Tongue twisters
    const tongueTwistersData = [
      {
        type: 'tongue-twister',
        data: {
          text: 'Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?',
          difficulty: 'medium'
        },
        difficulty: 'medium'
      },
      {
        type: 'tongue-twister',
        data: {
          text: 'She sells seashells by the seashore. The shells she sells are surely seashells.',
          difficulty: 'easy'
        },
        difficulty: 'easy'
      },
      {
        type: 'tongue-twister',
        data: {
          text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
          difficulty: 'medium'
        },
        difficulty: 'medium'
      }
    ];
    
    tongueTwistersData.forEach(twister => {
      this.createGame(twister);
    });
    
    // Sudoku puzzle
    const sudokuData = {
      type: 'sudoku',
      data: {
        grid: this.generateSudokuGrid(),
        difficulty: 'medium'
      },
      difficulty: 'medium'
    };
    
    this.createGame(sudokuData);
    
    // Crossword puzzle
    const crosswordData = {
      type: 'crossword',
      data: {
        grid: this.generateCrosswordGrid(),
        clues: [
          {
            number: 1,
            text: 'Company led by Elon Musk that builds electric vehicles',
            orientation: 'across',
            answer: 'TESLA',
            relatedArticleId: '1'
          },
          {
            number: 2,
            text: 'Artificial intelligence chatbot developed by OpenAI',
            orientation: 'down',
            answer: 'CHATGPT',
            relatedArticleId: '2'
          },
          {
            number: 3,
            text: 'Digital currency based on blockchain technology',
            orientation: 'across',
            answer: 'BITCOIN',
            relatedArticleId: '3'
          }
        ],
        size: 10
      },
      difficulty: 'medium'
    };
    
    this.createGame(crosswordData);
  }
  
  private generateSudokuGrid() {
    // Create a simple 9x9 sudoku grid with some cells filled
    const grid = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => ({ value: null, isOriginal: false }))
    );
    
    // Set some cells with initial values
    const initialCells = [
      [0, 1, 5], [0, 3, 8], [0, 5, 4], [0, 7, 2],
      [1, 2, 4], [1, 6, 5],
      [2, 0, 8], [2, 8, 1],
      [3, 2, 8], [3, 4, 7], [3, 6, 1],
      [4, 0, 6], [4, 8, 7],
      [5, 2, 1], [5, 4, 9], [5, 6, 8],
      [6, 0, 7], [6, 8, 4],
      [7, 2, 5], [7, 6, 9],
      [8, 1, 9], [8, 3, 5], [8, 5, 3], [8, 7, 8]
    ];
    
    initialCells.forEach(([row, col, value]) => {
      grid[row][col] = { value, isOriginal: true };
    });
    
    return grid;
  }
  
  private generateCrosswordGrid() {
    // Create a simple 10x10 crossword grid
    const grid = Array(10).fill(null).map(() => 
      Array(10).fill(null).map(() => ({ 
        letter: '', 
        clueNumber: undefined, 
        isBlack: false, 
        isHighlighted: false 
      }))
    );
    
    // Set black cells
    const blackCells = [
      [0, 3], [0, 7],
      [1, 3], [1, 7],
      [2, 3], [2, 7],
      [3, 0], [3, 1], [3, 2], [3, 6], [3, 7], [3, 8], [3, 9],
      [4, 3], [4, 7],
      [5, 3], [5, 7],
      [6, 0], [6, 1], [6, 2], [6, 6], [6, 7], [6, 8], [6, 9],
      [7, 3], [7, 7],
      [8, 3], [8, 7],
      [9, 3], [9, 7]
    ];
    
    blackCells.forEach(([row, col]) => {
      grid[row][col].isBlack = true;
    });
    
    // Set clue numbers
    grid[0][0].clueNumber = 1; // TESLA
    grid[0][4].clueNumber = 2; // CHATGPT
    grid[4][0].clueNumber = 3; // BITCOIN
    
    return grid;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { id, ...userData };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Article methods
  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleByApiId(apiId: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(article => article.apiId === apiId);
  }
  
  async getArticlesByCategory(category: string, page: number = 1, limit: number = 10): Promise<{ articles: Article[], hasMore: boolean }> {
    // Normalize category for case-insensitive comparison
    const normalizedCategory = category.toLowerCase();
    
    // Filter articles by category (case-insensitive match)
    const articles = Array.from(this.articles.values())
      .filter(article => {
        if (normalizedCategory === 'home') {
          return true; // Home shows all articles
        }
        return article.category.toLowerCase() === normalizedCategory;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    console.log(`Found ${articles.length} articles for category '${category}'`);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = articles.slice(startIndex, endIndex);
    
    return {
      articles: paginatedArticles,
      hasMore: endIndex < articles.length
    };
  }
  
  async getFeaturedArticles(limit: number = 3): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async getPersonalizedArticles(interests: string[], sources: string[], page: number = 1, limit: number = 10): Promise<{ articles: Article[], hasMore: boolean }> {
    let articles = Array.from(this.articles.values());
    
    // Filter by interests if provided
    if (interests && interests.length > 0) {
      articles = articles.filter(article => 
        interests.some(interest => 
          article.category.includes(interest) || 
          article.title.toLowerCase().includes(interest.toLowerCase()) ||
          article.description?.toLowerCase().includes(interest.toLowerCase())
        )
      );
    }
    
    // Filter by sources if provided
    if (sources && sources.length > 0) {
      articles = articles.filter(article => 
        sources.some(source => article.sourceName.toLowerCase().includes(source.toLowerCase()))
      );
    }
    
    // Sort by recency
    articles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = articles.slice(startIndex, endIndex);
    
    return {
      articles: paginatedArticles,
      hasMore: endIndex < articles.length
    };
  }
  
  async createArticle(articleData: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    const article: Article = { id, ...articleData };
    this.articles.set(id, article);
    return article;
  }
  
  async searchArticles(query: string, page: number = 1, limit: number = 10): Promise<{ articles: Article[], hasMore: boolean }> {
    if (!query.trim()) {
      return { articles: [], hasMore: false };
    }
    
    const normalizedQuery = query.toLowerCase();
    const articles = Array.from(this.articles.values())
      .filter(article => 
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.description?.toLowerCase().includes(normalizedQuery) ||
        article.content?.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = articles.slice(startIndex, endIndex);
    
    return {
      articles: paginatedArticles,
      hasMore: endIndex < articles.length
    };
  }
  
  // Bookmark methods
  async getBookmarks(userId: number): Promise<Article[]> {
    const bookmarks = Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.userId === userId);
    
    const articleIds = bookmarks.map(bookmark => bookmark.articleId);
    const articles = Array.from(this.articles.values())
      .filter(article => articleIds.includes(article.id));
    
    return articles;
  }
  
  async addBookmark(userId: number, articleId: number): Promise<Bookmark> {
    // Check if bookmark already exists
    const existingBookmark = Array.from(this.bookmarks.values())
      .find(bookmark => bookmark.userId === userId && bookmark.articleId === articleId);
    
    if (existingBookmark) {
      return existingBookmark;
    }
    
    const id = this.bookmarkIdCounter++;
    const bookmark: Bookmark = { 
      id, 
      userId, 
      articleId, 
      createdAt: new Date()
    };
    
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }
  
  async removeBookmark(userId: number, articleId: number): Promise<boolean> {
    const bookmark = Array.from(this.bookmarks.values())
      .find(bookmark => bookmark.userId === userId && bookmark.articleId === articleId);
    
    if (!bookmark) {
      return false;
    }
    
    this.bookmarks.delete(bookmark.id);
    return true;
  }
  
  async isBookmarked(userId: number, articleId: number): Promise<boolean> {
    return Array.from(this.bookmarks.values())
      .some(bookmark => bookmark.userId === userId && bookmark.articleId === articleId);
  }
  
  // Badge methods
  async getBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }
  
  async getUserBadges(userId: number): Promise<Badge[]> {
    const userBadges = Array.from(this.userBadges.values())
      .filter(userBadge => userBadge.userId === userId);
    
    const badgeIds = userBadges.map(userBadge => userBadge.badgeId);
    const badges = Array.from(this.badges.values())
      .filter(badge => badgeIds.includes(badge.id));
    
    return badges;
  }
  
  async createBadge(badgeData: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const badge: Badge = { id, ...badgeData };
    this.badges.set(id, badge);
    return badge;
  }
  
  async addUserBadge(userId: number, badgeId: string): Promise<UserBadge> {
    // Find the badge by badgeId string
    const badge = Array.from(this.badges.values())
      .find(badge => badge.badgeId === badgeId);
    
    if (!badge) {
      throw new Error(`Badge with id ${badgeId} not found`);
    }
    
    // Check if user already has this badge
    const existingUserBadge = Array.from(this.userBadges.values())
      .find(userBadge => userBadge.userId === userId && userBadge.badgeId === badge.id);
    
    if (existingUserBadge) {
      return existingUserBadge;
    }
    
    const id = this.userBadgeIdCounter++;
    const userBadge: UserBadge = { 
      id, 
      userId, 
      badgeId: badge.id, 
      awardedAt: new Date()
    };
    
    this.userBadges.set(id, userBadge);
    return userBadge;
  }
  
  // Game methods
  async createGame(gameData: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const game: Game = { 
      id, 
      ...gameData,
      createdAt: new Date()
    };
    
    this.games.set(id, game);
    return game;
  }
  
  async getRiddles(limit: number = 10): Promise<any[]> {
    const riddles = Array.from(this.games.values())
      .filter(game => game.type === 'riddle')
      .slice(0, limit)
      .map(game => ({
        id: game.id.toString(),
        question: game.data.question,
        answer: game.data.answer,
        difficulty: game.data.difficulty
      }));
    
    return riddles;
  }
  
  async getTongueTwisters(limit: number = 10): Promise<any[]> {
    const twisters = Array.from(this.games.values())
      .filter(game => game.type === 'tongue-twister')
      .slice(0, limit)
      .map(game => ({
        id: game.id.toString(),
        text: game.data.text,
        difficulty: game.data.difficulty
      }));
    
    return twisters;
  }
  
  async getSudokuPuzzle(): Promise<any> {
    const sudoku = Array.from(this.games.values())
      .find(game => game.type === 'sudoku');
    
    if (!sudoku) {
      throw new Error("No sudoku puzzle found");
    }
    
    return {
      grid: sudoku.data.grid
    };
  }
  
  async getCrosswordPuzzle(): Promise<any> {
    const crossword = Array.from(this.games.values())
      .find(game => game.type === 'crossword');
    
    if (!crossword) {
      throw new Error("No crossword puzzle found");
    }
    
    return {
      puzzle: crossword.data
    };
  }
  
  async checkGameSolution(gameId: number, solution: any): Promise<boolean> {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }
    
    // Implementation depends on game type
    // For this demo, just return true 50% of the time
    return Math.random() > 0.5;
  }
  
  async saveGameProgress(progressData: InsertGameProgress): Promise<GameProgress> {
    const id = this.gameProgressIdCounter++;
    const gameProgress: GameProgress = { 
      id, 
      ...progressData,
      startedAt: new Date(),
      completedAt: progressData.completed ? new Date() : null
    };
    
    this.gameProgress.set(id, gameProgress);
    return gameProgress;
  }
  
  // AI Insights methods
  async getAiInsights(): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values());
  }
  
  async createAiInsight(insightData: InsertAiInsight): Promise<AiInsight> {
    const id = this.aiInsightIdCounter++;
    const insight: AiInsight = { 
      id, 
      ...insightData,
      createdAt: new Date()
    };
    
    this.aiInsights.set(id, insight);
    return insight;
  }
  
  // Community methods
  async getCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }
  
  async getCommunityById(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }
  
  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    const id = this.communityIdCounter++;
    const community: Community = { 
      id, 
      ...communityData,
      createdAt: new Date()
    };
    
    this.communities.set(id, community);
    return community;
  }
  
  async joinCommunity(userId: number, communityId: number): Promise<CommunityMember> {
    // Check if already a member
    const existingMember = Array.from(this.communityMembers.values())
      .find(member => member.userId === userId && member.communityId === communityId);
    
    if (existingMember) {
      return existingMember;
    }
    
    const id = this.communityMemberIdCounter++;
    const member: CommunityMember = { 
      id, 
      userId, 
      communityId, 
      joinedAt: new Date()
    };
    
    this.communityMembers.set(id, member);
    return member;
  }
  
  async leaveCommunity(userId: number, communityId: number): Promise<boolean> {
    const member = Array.from(this.communityMembers.values())
      .find(member => member.userId === userId && member.communityId === communityId);
    
    if (!member) {
      return false;
    }
    
    this.communityMembers.delete(member.id);
    return true;
  }
  
  async getCommunityMembers(communityId: number): Promise<CommunityMember[]> {
    return Array.from(this.communityMembers.values())
      .filter(member => member.communityId === communityId);
  }
  
  async getUserCommunities(userId: number): Promise<Community[]> {
    const memberships = Array.from(this.communityMembers.values())
      .filter(member => member.userId === userId);
    
    const communityIds = memberships.map(member => member.communityId);
    const communities = Array.from(this.communities.values())
      .filter(community => communityIds.includes(community.id));
    
    return communities;
  }
  
  // Community Posts methods
  async getCommunityPosts(communityId: number): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .filter(post => post.communityId === communityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createCommunityPost(postData: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.communityPostIdCounter++;
    const post: CommunityPost = { 
      id, 
      ...postData,
      createdAt: new Date()
    };
    
    this.communityPosts.set(id, post);
    return post;
  }
  
  async getUserFeed(userId: number): Promise<CommunityPost[]> {
    // Get user's communities
    const communities = await this.getUserCommunities(userId);
    const communityIds = communities.map(community => community.id);
    
    // Get posts from those communities
    const posts = Array.from(this.communityPosts.values())
      .filter(post => communityIds.includes(post.communityId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return posts;
  }
}

export const storage = new MemStorage();
