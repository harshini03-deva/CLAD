import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { queryClient } from '@/lib/queryClient';

// Types for community data
interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  topics: string[];
  image: string;
  joined: boolean;
}

interface CommunityPost {
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

const Communities = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch communities
  const { 
    data: communities,
    isLoading: isLoadingCommunities,
    error: communitiesError
  } = useQuery<Community[]>({
    queryKey: ['/api/communities'],
  });
  
  // Fetch feed (posts from joined communities)
  const { 
    data: posts,
    isLoading: isLoadingPosts,
    error: postsError
  } = useQuery<CommunityPost[]>({
    queryKey: ['/api/communities/feed'],
  });
  
  // Toggle joining a community
  const handleJoinCommunity = async (communityId: string) => {
    // Get current join status
    const community = communities?.find(c => c.id === communityId);
    if (!community) return;
    
    const endpoint = community.joined 
      ? `/api/communities/${communityId}/leave` 
      : `/api/communities/${communityId}/join`;
    
    try {
      // Optimistic update
      if (communities) {
        const updatedCommunities = communities.map(community => {
          if (community.id === communityId) {
            return {
              ...community,
              joined: !community.joined,
              memberCount: community.joined ? community.memberCount - 1 : community.memberCount + 1
            };
          }
          return community;
        });
        
        // Update cache optimistically
        queryClient.setQueryData(['/api/communities'], updatedCommunities);
      }
      
      // Make the API call
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities/joined'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities/feed'] });
    } catch (error) {
      console.error('Error toggling community membership:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    }
  };
  
  // Toggle liking a post
  const handleLikePost = (postId: string) => {
    // Optimistic update
    if (posts) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      });
      
      // Update cache optimistically
      queryClient.setQueryData(['/api/communities/feed'], updatedPosts);
      
      // In a real implementation with a backend API, we would make an API call here
      // Since we're using a demo implementation, we'll just keep the optimistic update
    }
  };
  
  // Filter communities by search query
  const filteredCommunities = communities?.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Communities</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="joined">My Communities</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 material-icons">search</span>
              </div>
            </div>
            
            {isLoadingCommunities ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : communitiesError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
                  <h3 className="text-lg font-medium mb-2">Failed to load communities</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    We couldn't fetch the communities. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : filteredCommunities && filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map(community => (
                  <Card key={community.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={community.image} alt={community.name} />
                          <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{community.name}</CardTitle>
                          <CardDescription>{community.memberCount} members</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{community.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {community.topics.map(topic => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={community.joined ? 'w-full bg-gray-200 hover:bg-gray-300 text-gray-800' : 'w-full'}
                        variant={community.joined ? 'outline' : 'default'}
                        onClick={() => handleJoinCommunity(community.id)}
                      >
                        {community.joined ? 'Leave Community' : 'Join Community'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-4xl text-gray-400 mb-2">group</span>
                  <h3 className="text-lg font-medium mb-2">No communities found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery 
                      ? "We couldn't find any communities matching your search." 
                      : "No communities are available at the moment."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="joined">
            {isLoadingCommunities ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-[200px] w-full" />
                ))}
              </div>
            ) : communitiesError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
                  <h3 className="text-lg font-medium mb-2">Failed to load communities</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    We couldn't fetch your communities. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : communities && communities.filter(c => c.joined).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.filter(c => c.joined).map(community => (
                  <Card key={community.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={community.image} alt={community.name} />
                          <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{community.name}</CardTitle>
                          <CardDescription>{community.memberCount} members</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{community.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {community.topics.map(topic => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => handleJoinCommunity(community.id)}
                      >
                        Leave Community
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-4xl text-gray-400 mb-2">group</span>
                  <h3 className="text-lg font-medium mb-2">You haven't joined any communities</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Join communities to connect with like-minded readers and discover personalized content.
                  </p>
                  <Button onClick={() => setActiveTab('discover')}>Discover Communities</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="feed">
            {isLoadingPosts ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-[200px] w-full" />
                ))}
              </div>
            ) : postsError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-4xl text-red-500 mb-2">error_outline</span>
                  <h3 className="text-lg font-medium mb-2">Failed to load feed</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    We couldn't fetch your community feed. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{post.author.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge>
                          {communities?.find(c => c.id === post.communityId)?.name || 'Community'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          className={`flex items-center gap-1 ${post.liked ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <span className="material-icons text-sm">
                            {post.liked ? 'favorite' : 'favorite_border'}
                          </span>
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <span className="material-icons text-sm">chat_bubble_outline</span>
                          <span>{post.comments}</span>
                        </button>
                      </div>
                      <button className="text-gray-500 dark:text-gray-400">
                        <span className="material-icons text-sm">share</span>
                      </button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-4xl text-gray-400 mb-2">forum</span>
                  <h3 className="text-lg font-medium mb-2">Your feed is empty</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Join communities to see posts from other members in your feed.
                  </p>
                  <Button onClick={() => setActiveTab('discover')}>Discover Communities</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Communities;
