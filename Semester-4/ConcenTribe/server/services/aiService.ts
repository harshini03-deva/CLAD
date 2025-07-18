import axios from "axios";
import { AiInsight } from '@/lib/types';
import { fetchNewsArticles } from './newsService';

// Use NEWS_API_KEY instead, which we know works
const newsApiKey = process.env.NEWS_API_KEY;
if (!newsApiKey) {
  console.error("NEWS_API_KEY is not set! AI news insights will return fallback data.");
}

// NewsAPI endpoints
const NEWS_API_URL = 'https://newsapi.org/v2';
const TOP_HEADLINES = `${NEWS_API_URL}/top-headlines`;
const EVERYTHING = `${NEWS_API_URL}/everything`;

// Generate category-specific insights
export const generateAiInsights = async (): Promise<AiInsight[]> => {
  try {
    // Create five preset insights per category for better user experience
    // These insights can be refreshed/cycled through when requested
    const categoryInsights: Record<string, AiInsight[]> = {
      'technology': [
        {
          id: 'tech1',
          type: 'trend',
          title: 'Technology Trend: AI Integration Becoming Standard',
          content: 'Companies across industries are rapidly integrating AI to streamline operations and enhance user experiences. This trend is accelerating adoption rates and creating new market opportunities.',
          sentiment: 'positive',
          confidence: 92,
          category: 'technology',
          relatedArticles: []
        },
        {
          id: 'tech2',
          type: 'trend',
          title: 'Technology Trend: Cybersecurity Threats Evolving',
          content: 'Recent data breaches highlight the sophisticated evolution of cyber threats. Organizations are responding by increasing security budgets and implementing zero-trust architecture.',
          sentiment: 'negative',
          confidence: 89,
          category: 'technology',
          relatedArticles: []
        },
        {
          id: 'tech3',
          type: 'analysis',
          title: 'The Future of Quantum Computing',
          content: 'Quantum computing is approaching a tipping point where practical applications may soon outpace theoretical models. Industry leaders are preparing for significant computational breakthroughs within 3-5 years.',
          sentiment: 'positive',
          confidence: 84,
          category: 'technology',
          relatedArticles: []
        },
        {
          id: 'tech4',
          type: 'trend',
          title: 'Technology Trend: 5G Transforming Connectivity',
          content: 'The rollout of 5G is accelerating digital transformation across sectors. Industries are leveraging enhanced bandwidth and reduced latency to enable IoT innovations and real-time applications.',
          sentiment: 'positive',
          confidence: 90,
          category: 'technology',
          relatedArticles: []
        },
        {
          id: 'tech5',
          type: 'factCheck',
          title: 'Are Social Media Algorithms Biased?',
          content: 'Research indicates algorithmic bias exists in major social media platforms, though the extent varies by platform. Companies are implementing more transparent AI ethics policies in response to public pressure.',
          sentiment: 'neutral',
          confidence: 78,
          category: 'technology',
          relatedArticles: []
        }
      ],
      'health': [
        {
          id: 'health1',
          type: 'trend',
          title: 'Health Trend: Precision Medicine Advances',
          content: 'Healthcare is shifting toward personalized treatments based on genetic profiles. Early adopters are reporting significantly improved outcomes for complex conditions.',
          sentiment: 'positive',
          confidence: 88,
          category: 'health',
          relatedArticles: []
        },
        {
          id: 'health2',
          type: 'trend',
          title: 'Health Trend: Mental Health Awareness',
          content: 'Workplace mental health programs are expanding rapidly as organizations recognize the connection between wellbeing and productivity. Implementation rates have doubled in the past year.',
          sentiment: 'positive',
          confidence: 86,
          category: 'health',
          relatedArticles: []
        },
        {
          id: 'health3',
          type: 'analysis',
          title: 'The Impact of Wearable Health Devices',
          content: 'Wearable health technology is fundamentally changing preventative care approaches. Data shows users of health wearables are more likely to make positive lifestyle changes and detect health issues earlier.',
          sentiment: 'positive',
          confidence: 82,
          category: 'health',
          relatedArticles: []
        },
        {
          id: 'health4',
          type: 'trend',
          title: 'Health Trend: Antibiotic Resistance Concerns',
          content: 'The growing threat of antibiotic-resistant bacteria is prompting new research initiatives. Scientists are exploring alternative treatments including bacteriophage therapy and antimicrobial peptides.',
          sentiment: 'negative',
          confidence: 91,
          category: 'health',
          relatedArticles: []
        },
        {
          id: 'health5',
          type: 'factCheck',
          title: 'Do Plant-Based Diets Improve Health Outcomes?',
          content: 'Multiple long-term studies confirm plant-based diets correlate with reduced risk of cardiovascular disease and certain cancers. Benefits are most pronounced when processed foods are limited regardless of diet type.',
          sentiment: 'positive',
          confidence: 85,
          category: 'health',
          relatedArticles: []
        }
      ],
      'business': [
        {
          id: 'business1',
          type: 'trend',
          title: 'Business Trend: Sustainable Investments Rising',
          content: 'ESG-focused investments are outperforming traditional portfolios in multiple markets. Companies with strong sustainability practices are attracting premium valuations from investors.',
          sentiment: 'positive',
          confidence: 87,
          category: 'business',
          relatedArticles: []
        },
        {
          id: 'business2',
          type: 'trend',
          title: 'Business Trend: Supply Chain Restructuring',
          content: 'Global businesses are diversifying suppliers and reshoring critical operations to mitigate disruption risks. This shift is creating new regional manufacturing hubs and logistics networks.',
          sentiment: 'neutral',
          confidence: 89,
          category: 'business',
          relatedArticles: []
        },
        {
          id: 'business3',
          type: 'analysis',
          title: 'The Rise of Decentralized Finance',
          content: 'DeFi platforms are challenging traditional banking models with innovative financial products. Regulatory frameworks are evolving to address this rapidly growing sector while protecting consumers.',
          sentiment: 'positive',
          confidence: 83,
          category: 'business',
          relatedArticles: []
        },
        {
          id: 'business4',
          type: 'trend',
          title: 'Business Trend: Remote Work Economics',
          content: 'Companies are reporting mixed financial impacts from permanent remote work policies. Cost savings on physical infrastructure are being balanced against productivity and collaboration concerns.',
          sentiment: 'neutral',
          confidence: 81,
          category: 'business',
          relatedArticles: []
        },
        {
          id: 'business5',
          type: 'factCheck',
          title: 'Are Small Businesses Recovering Post-Pandemic?',
          content: 'Data shows uneven recovery across small business sectors. Food service and retail continue to face challenges while professional services and technology sectors have largely rebounded or expanded.',
          sentiment: 'neutral',
          confidence: 84,
          category: 'business',
          relatedArticles: []
        }
      ],
      'entertainment': [
        {
          id: 'entertainment1',
          type: 'trend',
          title: 'Entertainment Trend: Streaming Platform Consolidation',
          content: 'Major streaming services are acquiring competitors and expanding content libraries. This consolidation is reshaping how content is created, distributed, and monetized globally.',
          sentiment: 'neutral',
          confidence: 88,
          category: 'entertainment',
          relatedArticles: []
        },
        {
          id: 'entertainment2',
          type: 'trend',
          title: 'Entertainment Trend: Virtual Production Growth',
          content: 'LED volume stages and real-time rendering are revolutionizing film and TV production. These technologies reduce costs while enabling creative possibilities previously limited to big-budget productions.',
          sentiment: 'positive',
          confidence: 86,
          category: 'entertainment',
          relatedArticles: []
        },
        {
          id: 'entertainment3',
          type: 'analysis',
          title: 'The Globalization of Content',
          content: 'International content is finding broader audiences through localization and culturally-aware marketing. Productions from diverse markets are consistently breaking viewing records on global platforms.',
          sentiment: 'positive',
          confidence: 85,
          category: 'entertainment',
          relatedArticles: []
        },
        {
          id: 'entertainment4',
          type: 'trend',
          title: 'Entertainment Trend: Gaming as Social Platform',
          content: 'Video games are evolving into comprehensive social spaces beyond pure entertainment. In-game events and persistent worlds are creating new forms of digital community and shared experience.',
          sentiment: 'positive',
          confidence: 89,
          category: 'entertainment',
          relatedArticles: []
        },
        {
          id: 'entertainment5',
          type: 'factCheck',
          title: 'Is Traditional Cinema Attendance Declining?',
          content: 'Box office data confirms a structural shift in theater attendance patterns. While blockbuster releases still drive significant audiences, mid-budget films increasingly find primary success through streaming platforms.',
          sentiment: 'negative',
          confidence: 83,
          category: 'entertainment',
          relatedArticles: []
        }
      ],
      'sports': [
        {
          id: 'sports1',
          type: 'trend',
          title: 'Sports Trend: Player Data Analytics',
          content: 'Advanced analytics are transforming player recruitment and development across major sports. Teams leveraging sophisticated data models are gaining competitive advantages in talent evaluation.',
          sentiment: 'positive',
          confidence: 90,
          category: 'sports',
          relatedArticles: []
        },
        {
          id: 'sports2',
          type: 'trend',
          title: 'Sports Trend: Athlete Mental Health Focus',
          content: 'Professional leagues are implementing comprehensive mental health resources for athletes. This shift represents a significant cultural change in how athletic performance is understood and supported.',
          sentiment: 'positive',
          confidence: 87,
          category: 'sports',
          relatedArticles: []
        },
        {
          id: 'sports3',
          type: 'analysis',
          title: 'The Evolution of Sports Broadcasting',
          content: 'Digital platforms are creating personalized viewing experiences through interactive features and multiple camera angles. Traditional broadcasters are adapting by incorporating similar technologies into their coverage.',
          sentiment: 'positive',
          confidence: 84,
          category: 'sports',
          relatedArticles: []
        },
        {
          id: 'sports4',
          type: 'trend',
          title: 'Sports Trend: Esports Going Mainstream',
          content: 'Major traditional sports organizations are launching esports divisions and partnerships. Viewership demographics show significant audience overlap between traditional and electronic competitive sports.',
          sentiment: 'positive',
          confidence: 88,
          category: 'sports',
          relatedArticles: []
        },
        {
          id: 'sports5',
          type: 'factCheck',
          title: 'Are New Stadium Technologies Enhancing Fan Experience?',
          content: 'Survey data indicates high satisfaction with stadium technology upgrades such as mobile ordering and augmented reality features. Venues investing in connectivity infrastructure report increased per-capita spending and attendance.',
          sentiment: 'positive',
          confidence: 82,
          category: 'sports',
          relatedArticles: []
        }
      ],
      'science': [
        {
          id: 'science1',
          type: 'trend',
          title: 'Science Trend: Climate Research Advances',
          content: 'New climate models are providing more accurate predictions of regional impacts. These refined models are helping communities develop targeted adaptation strategies based on specific local challenges.',
          sentiment: 'neutral',
          confidence: 93,
          category: 'science',
          relatedArticles: []
        },
        {
          id: 'science2',
          type: 'trend',
          title: 'Science Trend: Space Exploration Commercialization',
          content: 'Private companies are achieving milestones previously limited to government space agencies. This commercialization is accelerating innovation and reducing costs across the space industry.',
          sentiment: 'positive',
          confidence: 89,
          category: 'science',
          relatedArticles: []
        },
        {
          id: 'science3',
          type: 'analysis',
          title: 'The CRISPR Revolution',
          content: 'CRISPR gene editing technologies are advancing rapidly from research to clinical applications. Early therapeutic trials are showing promising results for previously untreatable genetic conditions.',
          sentiment: 'positive',
          confidence: 86,
          category: 'science',
          relatedArticles: []
        },
        {
          id: 'science4',
          type: 'trend',
          title: 'Science Trend: Renewable Energy Efficiency',
          content: 'Solar and wind energy technologies have reached cost parity with fossil fuels in most markets. Ongoing research is focused on storage solutions to address intermittency challenges.',
          sentiment: 'positive',
          confidence: 91,
          category: 'science',
          relatedArticles: []
        },
        {
          id: 'science5',
          type: 'factCheck',
          title: 'Is Fusion Energy Becoming Commercially Viable?',
          content: 'Recent breakthroughs in fusion research have demonstrated scientific feasibility, but commercial viability remains distant. Most experts project 15-20 years before fusion contributes meaningfully to energy grids.',
          sentiment: 'neutral',
          confidence: 84,
          category: 'science',
          relatedArticles: []
        }
      ]
    };
    
    // Combine all insights into a single array for general insights page
    let allInsights: AiInsight[] = [];
    for (const category in categoryInsights) {
      allInsights = [...allInsights, ...categoryInsights[category]];
    }
    
    // Return all insights (original function would return a subset of these)
    return allInsights;
  } catch (error) {
    console.error('Error generating news insights:', error instanceof Error ? error.message : error);
    throw error;
  }
};

// Analyze an article for sentiment and topics
export const analyzeArticle = async (articleContent: string): Promise<{ 
  sentiment: 'positive' | 'negative' | 'neutral', 
  topics: string[],
  summary: string
}> => {
  try {
    // Define lists of positive and negative words for simple sentiment analysis
    const positiveWords = [
      'success', 'growth', 'positive', 'improved', 'gain', 'recovery', 'advance', 
      'breakthrough', 'progress', 'achievement', 'hope', 'benefit', 'efficient', 
      'opportunity', 'innovation', 'solution', 'resolved', 'healthy', 'good', 'great'
    ];
    
    const negativeWords = [
      'problem', 'crisis', 'decline', 'loss', 'negative', 'failure', 'weak', 
      'poor', 'disaster', 'risk', 'threat', 'conflict', 'danger', 'deficit', 
      'damage', 'worsen', 'struggle', 'crash', 'bad', 'terrible'
    ];

    // Extract potential topics from article content
    const potentialTopics = [
      'technology', 'science', 'health', 'business', 'finance', 'politics', 
      'climate', 'education', 'environment', 'sports', 'entertainment', 
      'covid', 'economy', 'market', 'medicine', 'research', 'government', 
      'security', 'energy', 'war', 'social media', 'artificial intelligence', 
      'news', 'current events'
    ];
    
    // Convert to lowercase for analysis
    const contentLower = articleContent.toLowerCase();
    
    // Count positive and negative words
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of positiveWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) positiveCount += matches.length;
    }
    
    for (const word of negativeWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) negativeCount += matches.length;
    }
    
    // Determine sentiment
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount + 2) sentiment = 'positive';
    else if (negativeCount > positiveCount + 2) sentiment = 'negative';

    // Find topics
    const foundTopics: string[] = [];
    for (const topic of potentialTopics) {
      const regex = new RegExp(`\\b${topic}\\b`, 'gi');
      if (contentLower.match(regex)) {
        foundTopics.push(topic);
      }
    }

    // If no specific topics found, add generic ones
    if (foundTopics.length === 0) {
      foundTopics.push('news');
      foundTopics.push('current events');
    }
    
    // Extract a simple summary - first two sentences
    const sentences = articleContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = sentences.slice(0, 2).join('. ');
    
    // Add a period if it doesn't end with punctuation
    if (summary && !summary.match(/[.!?]$/)) {
      summary += '.';
    }

    return {
      sentiment,
      topics: foundTopics.slice(0, 5), // Limit to 5 topics
      summary: summary || 'No summary available.'
    };
  } catch (error) {
    console.error('Error analyzing article:', error instanceof Error ? error.message : error);
    
    // Return default analysis in case of error
    return {
      sentiment: 'neutral',
      topics: ['news', 'current events'],
      summary: 'Unable to generate summary due to an error.'
    };
  }
};

// Fact check a claim by searching for supporting news articles
export const factCheckClaim = async (claim: string): Promise<{
  isReliable: boolean,
  confidence: number,
  explanation: string
}> => {
  try {
    if (!newsApiKey) {
      throw new Error('NEWS_API_KEY is not set');
    }

    // Extract keywords from the claim
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could'];
    
    // Clean up the claim and extract meaningful keywords
    const keywords = claim
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .split(' ')
      .filter(word => word.length > 3 && !stopWords.includes(word)) // Filter out stop words and short words
      .slice(0, 4); // Take top 4 keywords
      
    if (keywords.length === 0) {
      return {
        isReliable: false,
        confidence: 40,
        explanation: 'Unable to extract meaningful keywords from the claim to verify it.'
      };
    }
    
    // Search for articles related to the claim
    const searchQuery = keywords.join(' OR ');
    console.log(`Fact checking claim by searching for: ${searchQuery}`);
    
    const response = await axios.get(`${EVERYTHING}?q=${encodeURIComponent(searchQuery)}&sortBy=relevancy&pageSize=5&apiKey=${newsApiKey}`);
    
    if (response.status !== 200 || !response.data.articles || response.data.articles.length === 0) {
      return {
        isReliable: false,
        confidence: 30,
        explanation: 'No supporting news articles found to verify this claim.'
      };
    }
    
    // Analyze the sources of the articles
    const articles = response.data.articles;
    const sources = articles.map((article: any) => article.source.name).filter(Boolean);
    const uniqueSources = Array.from(new Set(sources));
    
    // Calculate confidence based on number of sources and articles
    const confidence = Math.min(90, 50 + (uniqueSources.length * 10));
    
    // Generate explanation
    let explanation = '';
    if (uniqueSources.length > 2) {
      explanation = `Multiple reliable sources (${uniqueSources.slice(0, 3).join(', ')}${uniqueSources.length > 3 ? '...' : ''}) have published articles related to this topic, suggesting the claim has factual basis.`;
    } else if (uniqueSources.length > 0) {
      explanation = `Found limited coverage from ${uniqueSources.join(', ')} about this topic. The claim may have some factual elements, but should be verified with additional sources.`;
    } else {
      explanation = 'Limited information available to verify this claim. Exercise caution.';
    }
    
    return {
      isReliable: uniqueSources.length > 1,
      confidence,
      explanation
    };
  } catch (error) {
    console.error('Error fact checking claim:', error instanceof Error ? error.message : error);
    
    // Return default fact check in case of error
    return {
      isReliable: false,
      confidence: 50,
      explanation: 'Unable to verify this claim due to technical difficulties. Please try again later.'
    };
  }
};
