import OpenAI from "openai";
import { AiInsight } from '@shared/schema';

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const summarizeText = async (text: string, maxLength: number = 200): Promise<string> => {
  try {
    console.log("Generating AI summary with OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
          "You are a summarization expert. Provide a concise summary of the following text in about 2-3 sentences. Focus on the main points only. Return just the summary text with no additional formatting or explanation."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.5,
      max_tokens: 150
    });

    const summary = response.choices[0].message.content?.trim() || '';
    console.log("Successfully generated summary");
    return summary;
  } catch (error) {
    console.error("Error in OpenAI text summarization:", error instanceof Error ? error.message : String(error));
    
    // Fallback - extract first sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let simpleSummary = sentences.slice(0, 2).join('. ');
    if (simpleSummary.length > maxLength) {
      simpleSummary = simpleSummary.substring(0, maxLength) + '...';
    }
    
    return simpleSummary || "Unable to generate a summary.";
  }
};

export const generateAiAnalysisForArticle = async (articleContent: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral',
  topics: string[],
  summary: string
}> => {
  try {
    console.log("Generating AI analysis with OpenAI for article content...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
          "You are an expert news analyst. Analyze the provided article and return a JSON response with the following fields:\n" +
          "1. sentiment: The overall sentiment of the article (must be exactly one of these values: 'positive', 'negative', or 'neutral')\n" +
          "2. topics: An array of 3-5 relevant topics mentioned in the article\n" +
          "3. summary: A concise 2-3 sentence summary of the key points of the article"
        },
        {
          role: "user",
          content: articleContent
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    console.log("Successfully received OpenAI analysis response");
    const content = response.choices[0].message.content || '{"sentiment":"neutral","topics":[],"summary":"No summary available."}';
    const result = JSON.parse(content);

    return {
      sentiment: result.sentiment as 'positive' | 'negative' | 'neutral',
      topics: result.topics || [],
      summary: result.summary || "No summary available."
    };
  } catch (error) {
    console.error("Error in OpenAI article analysis:", error instanceof Error ? error.message : String(error));
    
    // Fallback to rule-based analysis
    return {
      sentiment: 'neutral',
      topics: ['news', 'current events'],
      summary: "Unable to generate AI analysis. The article appears to be about current events."
    };
  }
};

export const generateNewsInsights = async (topArticlesByCategory: Record<string, any[]>): Promise<AiInsight[]> => {
  try {
    console.log("Generating news insights with OpenAI...");
    
    const categories = Object.keys(topArticlesByCategory);
    const insights: AiInsight[] = [];
    let insightId = 1;
    
    for (const category of categories) {
      const articlesInCategory = topArticlesByCategory[category];
      if (!articlesInCategory || articlesInCategory.length === 0) continue;
      
      const topArticle = articlesInCategory[0];
      
      // Prepare article data for OpenAI
      const articleInfo = {
        title: topArticle.title,
        description: topArticle.description || "",
        category: category,
        source: topArticle.source?.name || "Unknown Source"
      };
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: 
              "You are an expert news analyst. Based on the article information provided, generate a concise insight that explains the significance of this news item. Return a JSON response with the following fields:\n" +
              "1. insight: A brief, insightful analysis of the news item (max 2 sentences)\n" +
              "2. sentiment: The sentiment of the analysis (must be exactly one of these values: 'positive', 'negative', or 'neutral')\n" +
              "3. confidence: A confidence score between 60 and 95"
            },
            {
              role: "user",
              content: JSON.stringify(articleInfo)
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        
        const content = response.choices[0].message.content || '{"insight":"No insight available.","sentiment":"neutral","confidence":70}';
        const result = JSON.parse(content);
        
        // Create insight
        const insight: AiInsight = {
          id: String(insightId++),
          type: 'trend',
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} Trend: ${topArticle.title.split(' ').slice(0, 6).join(' ')}...`,
          content: result.insight || 'No insight available',
          sentiment: result.sentiment as 'positive' | 'negative' | 'neutral',
          confidence: Number(result.confidence) || 70,
          createdAt: new Date(),
          relatedArticles: [Buffer.from(topArticle.url || '').toString('base64')]
        };
        
        insights.push(insight);
        
      } catch (error) {
        console.error(`Error generating insight for ${category}:`, error);
        continue;
      }
    }
    
    if (insights.length === 0) {
      throw new Error('Failed to generate insights with OpenAI');
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating news insights with OpenAI:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export const factCheckWithAI = async (claim: string): Promise<{
  isReliable: boolean,
  confidence: number,
  explanation: string
}> => {
  try {
    console.log("Fact checking with OpenAI for claim:", claim);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
          "You are a fact-checking expert. Analyze the provided claim and determine if it appears reliable based on your knowledge. Return a JSON response with the following fields:\n" +
          "1. isReliable: Boolean indicating if the claim appears reliable\n" +
          "2. confidence: A confidence score between 30 and 90\n" +
          "3. explanation: A brief explanation for your assessment (2-3 sentences)"
        },
        {
          role: "user",
          content: claim
        }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{"isReliable":false,"confidence":50,"explanation":"Unable to verify this claim."}';
    const result = JSON.parse(content);
    
    return {
      isReliable: Boolean(result.isReliable),
      confidence: Number(result.confidence) || 50,
      explanation: result.explanation || "Unable to verify this claim."
    };
  } catch (error) {
    console.error("Error in AI fact checking:", error instanceof Error ? error.message : String(error));
    
    // Fallback
    return {
      isReliable: false,
      confidence: 50,
      explanation: "Unable to verify this claim due to technical difficulties. Please cross-reference with trusted sources."
    };
  }
};