import { useState, useEffect, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { INTERESTS, NEWS_SOURCES, CONTENT_FORMATS } from '@/lib/constants';
import { YouTubeVideo } from '@/lib/types';
import { useFocusMode, useUserStore } from '@/lib/store';
import NewsGrid from '@/components/news/NewsGrid';
import YouTubeGrid from '@/components/youtube/YouTubeGrid';
import { getFocusModeVideos } from '@/lib/youtubeService';
import Challenges from './Challenges';

const FocusMode = () => {
  const { isFocusModeOpen, toggleFocusMode, focusSession, startFocusSession, endFocusSession } = useFocusMode();
  const { preferences, updatePreferences } = useUserStore();
  
  // Local state for setup form
  const [selectedInterests, setSelectedInterests] = useState<string[]>(preferences.interests || []);
  const [selectedSources, setSelectedSources] = useState<string[]>(preferences.sources || []);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(preferences.formats || []);
  const [focusDuration, setFocusDuration] = useState<number>(preferences.focusDuration || 20);
  
  // YouTube videos state
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
  
  // Focus session timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Fetch YouTube videos when focus mode starts
  useEffect(() => {
    if (focusSession.active && selectedFormats.includes('video')) {
      // Fetch YouTube videos based on interests and sources
      const fetchVideos = async () => {
        setIsLoadingVideos(true);
        try {
          const videos = await getFocusModeVideos(selectedInterests, selectedSources);
          setYoutubeVideos(videos);
        } catch (error) {
          console.error('Error fetching YouTube videos:', error);
        } finally {
          setIsLoadingVideos(false);
        }
      };
      
      fetchVideos();
    }
  }, [focusSession.active, selectedInterests, selectedSources, selectedFormats]);

  // Setup timer when focus session starts
  useEffect(() => {
    if (focusSession.active) {
      setTimeRemaining(focusSession.duration * 60);
      
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up, end session and award badge
            clearInterval(timerRef.current!);
            endFocusSession(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Clear timer if session ends
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [focusSession.active, focusSession.duration]);
  
  const handleStartFocusSession = () => {
    // Save preferences
    updatePreferences({
      interests: selectedInterests,
      sources: selectedSources,
      formats: selectedFormats,
      focusDuration
    });
    
    // Start focus session
    startFocusSession(focusDuration);
  };
  
  const handleCancelFocusSession = () => {
    if (focusSession.active) {
      endFocusSession(false);
    }
    toggleFocusMode();
  };
  
  return (
    <Dialog open={isFocusModeOpen} onOpenChange={toggleFocusMode}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {!focusSession.active ? (
          // Focus Mode Setup
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Focus Mode Setup</DialogTitle>
              <DialogDescription>
                Personalize your news experience and set your focus time
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Select Your Interests</h3>
                <div className="grid grid-cols-2 gap-4">
                  {INTERESTS.map(interest => (
                    <div 
                      key={interest.id}
                      className="flex items-center space-x-2 p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <Checkbox 
                        id={`interest-${interest.id}`}
                        checked={selectedInterests.includes(interest.id)}
                        onCheckedChange={(checked) => {
                          setSelectedInterests(prev => 
                            checked 
                              ? [...prev, interest.id]
                              : prev.filter(i => i !== interest.id)
                          );
                        }}
                      />
                      <Label 
                        htmlFor={`interest-${interest.id}`}
                        className="text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {interest.label}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">Select News Sources</h3>
                <div className="grid grid-cols-2 gap-4">
                  {NEWS_SOURCES.map(source => (
                    <div 
                      key={source.id}
                      className="flex items-center space-x-2 p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <Checkbox 
                        id={`source-${source.id}`}
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={(checked) => {
                          setSelectedSources(prev => 
                            checked 
                              ? [...prev, source.id]
                              : prev.filter(s => s !== source.id)
                          );
                        }}
                      />
                      <Label 
                        htmlFor={`source-${source.id}`}
                        className="text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {source.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Select Content Formats</h3>
                <div className="space-y-4">
                  {CONTENT_FORMATS.map(format => (
                    <div 
                      key={format.id}
                      className="flex items-center p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <Checkbox 
                        id={`format-${format.id}`}
                        className="mr-2"
                        checked={selectedFormats.includes(format.id)}
                        onCheckedChange={(checked) => {
                          setSelectedFormats(prev => 
                            checked 
                              ? [...prev, format.id]
                              : prev.filter(f => f !== format.id)
                          );
                        }}
                      />
                      <div>
                        <Label 
                          htmlFor={`format-${format.id}`}
                          className="text-gray-900 dark:text-white font-medium cursor-pointer"
                        >
                          {format.label}
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">Set Focus Time</h3>
                <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Focus Duration</span>
                    <span className="text-gray-900 dark:text-white font-medium">{focusDuration} minutes</span>
                  </div>
                  <Slider
                    min={5}
                    max={60}
                    step={5}
                    value={[focusDuration]}
                    onValueChange={(value) => setFocusDuration(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>5 min</span>
                    <span>30 min</span>
                    <span>60 min</span>
                  </div>
                </div>
                
                <DialogFooter className="mt-8">
                  <Button
                    variant="outline"
                    onClick={toggleFocusMode}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartFocusSession}
                    disabled={
                      selectedInterests.length === 0 || 
                      selectedSources.length === 0 || 
                      selectedFormats.length === 0
                    }
                  >
                    Start Focus Mode
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </>
        ) : (
          // Active Focus Mode
          <>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl font-bold">Focus Mode</DialogTitle>
                <div className="text-xl font-bold text-primary">{formatTime(timeRemaining)}</div>
              </div>
              <DialogDescription>
                Personalized content based on your interests. Remain focused to earn badges!
              </DialogDescription>
            </DialogHeader>
            
            <Challenges />
            
            {selectedFormats.includes('video') ? (
              <Tabs defaultValue="videos" className="mt-6">
                <TabsList>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="articles">Articles</TabsTrigger>
                </TabsList>
                <TabsContent value="videos" className="mt-4">
                  <YouTubeGrid 
                    title="Video News For You"
                    videos={youtubeVideos}
                    isLoading={isLoadingVideos}
                    hasMore={false}
                  />
                </TabsContent>
                <TabsContent value="articles" className="mt-4">
                  <NewsGrid 
                    title="Personalized Articles"
                    articles={focusSession.articles || []}
                    hasMore={false}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <NewsGrid 
                title="Personalized For You"
                articles={focusSession.articles || []}
                hasMore={false}
              />
            )}
            
            <DialogFooter className="mt-4">
              <Button
                variant="destructive"
                onClick={handleCancelFocusSession}
              >
                End Focus Session
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FocusMode;
