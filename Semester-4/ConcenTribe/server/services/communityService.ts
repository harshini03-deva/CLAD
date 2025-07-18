import { storage } from '../storage';

// Interface for community data to return to client
interface CommunityResponse {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  topics: string[];
  image: string;
  joined: boolean;
}

// Interface for community post data to return to client
interface CommunityPostResponse {
  id: string;
  communityId: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  liked: boolean;
}

// Get all communities
export const getCommunities = async (): Promise<CommunityResponse[]> => {
  try {
    // Get communities from storage
    const communities = await storage.getCommunities();
    const userId = 1; // Demo user ID
    
    // Get user's joined communities
    const userCommunities = await storage.getUserCommunities(userId);
    const userCommunityIds = userCommunities.map(c => c.id);
    
    // Map to response format
    return communities.map(community => ({
      id: community.id.toString(),
      name: community.name,
      description: community.description,
      memberCount: Math.floor(Math.random() * 500) + 50, // Random member count for demo
      topics: community.topics as string[],
      image: `https://api.dicebear.com/7.x/identicon/svg?seed=${community.name}`, // Generate icon from name
      joined: userCommunityIds.includes(community.id)
    }));
  } catch (error) {
    console.error('Error fetching communities:', error);
    
    // Return some default communities in case of error
    return [
      {
        id: "1",
        name: "Tech Enthusiasts",
        description: "Discuss the latest in technology and innovation",
        memberCount: 342,
        topics: ["Technology", "Innovation", "Gadgets"],
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=Tech",
        joined: false
      },
      {
        id: "2",
        name: "Health & Wellness",
        description: "Share tips and news about living a healthy lifestyle",
        memberCount: 187,
        topics: ["Health", "Fitness", "Nutrition"],
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=Health",
        joined: true
      },
      {
        id: "3",
        name: "Business Insights",
        description: "Analysis and discussion of business trends and economics",
        memberCount: 215,
        topics: ["Business", "Economics", "Finance"],
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=Business",
        joined: false
      }
    ];
  }
};

// Get communities joined by user
export const getUserCommunities = async (userId: number): Promise<CommunityResponse[]> => {
  try {
    // Get user's joined communities
    const communities = await storage.getUserCommunities(userId);
    
    // Map to response format
    return communities.map(community => ({
      id: community.id.toString(),
      name: community.name,
      description: community.description,
      memberCount: Math.floor(Math.random() * 500) + 50, // Random member count for demo
      topics: community.topics as string[],
      image: `https://api.dicebear.com/7.x/identicon/svg?seed=${community.name}`, // Generate icon from name
      joined: true
    }));
  } catch (error) {
    console.error('Error fetching user communities:', error);
    
    // Return some default communities in case of error
    return [
      {
        id: "2",
        name: "Health & Wellness",
        description: "Share tips and news about living a healthy lifestyle",
        memberCount: 187,
        topics: ["Health", "Fitness", "Nutrition"],
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=Health",
        joined: true
      }
    ];
  }
};

// Get community feed (posts from joined communities)
export const getCommunityFeed = async (userId: number): Promise<CommunityPostResponse[]> => {
  try {
    // Get user's feed
    const posts = await storage.getUserFeed(userId);
    
    // Get community information for each post
    const communitiesMap = new Map();
    for (const post of posts) {
      if (!communitiesMap.has(post.communityId)) {
        const community = await storage.getCommunityById(post.communityId);
        if (community) {
          communitiesMap.set(post.communityId, community);
        }
      }
    }
    
    // Get user information for each post
    const usersMap = new Map();
    for (const post of posts) {
      if (!usersMap.has(post.userId)) {
        const user = await storage.getUser(post.userId);
        if (user) {
          usersMap.set(post.userId, user);
        }
      }
    }
    
    // Map to response format
    return posts.map(post => {
      const user = usersMap.get(post.userId);
      return {
        id: post.id.toString(),
        communityId: post.communityId.toString(),
        title: post.title,
        content: post.content,
        author: {
          name: user?.displayName || "Anonymous",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Anonymous'}`
        },
        createdAt: post.createdAt.toISOString(),
        likes: Math.floor(Math.random() * 50), // Random likes for demo
        comments: Math.floor(Math.random() * 10), // Random comments for demo
        liked: Math.random() > 0.5 // Random liked status for demo
      };
    });
  } catch (error) {
    console.error('Error fetching community feed:', error);
    
    // Return some default posts in case of error
    return [
      {
        id: "1",
        communityId: "2",
        title: "10 Foods That Boost Your Immune System",
        content: "Here's a list of foods that can help strengthen your immune system during cold and flu season...",
        author: {
          name: "HealthGuru",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HealthGuru"
        },
        createdAt: new Date().toISOString(),
        likes: 24,
        comments: 7,
        liked: false
      },
      {
        id: "2",
        communityId: "2",
        title: "The Benefits of Morning Exercise",
        content: "Starting your day with exercise can boost your metabolism and improve your mood throughout the day...",
        author: {
          name: "FitnessCoach",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessCoach"
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        likes: 18,
        comments: 4,
        liked: true
      }
    ];
  }
};

// Join a community
export const joinCommunity = async (userId: number, communityId: number): Promise<void> => {
  try {
    await storage.joinCommunity(userId, communityId);
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

// Leave a community
export const leaveCommunity = async (userId: number, communityId: number): Promise<void> => {
  try {
    await storage.leaveCommunity(userId, communityId);
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};
