import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TongueTwister } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const TongueTwisters = () => {
  const [currentTwister, setCurrentTwister] = useState<TongueTwister | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [completedTwisters, setCompletedTwisters] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { addBadge } = useUserStore();
  const { toast } = useToast();

  // Fetch tongue twisters
  const { data: tongueTwisters, isLoading, error } = useQuery<TongueTwister[]>({
    queryKey: ['/api/games/tongue-twisters'],
  });

  useEffect(() => {
    if (tongueTwisters && tongueTwisters.length > 0 && !currentTwister) {
      // Set a random tongue twister on initial load
      const randomIndex = Math.floor(Math.random() * tongueTwisters.length);
      setCurrentTwister(tongueTwisters[randomIndex]);
    }
  }, [tongueTwisters, currentTwister]);

  useEffect(() => {
    // Clean up audio URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Update completed twisters count
        setCompletedTwisters(prev => prev + 1);
        
        // 25% chance to earn a badge
        if (Math.random() < 0.25) {
          addBadge('puzzle-master');
          toast({
            title: "Achievement Unlocked!",
            description: "You've earned the 'Puzzle Master' badge!",
            variant: "success",
          });
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer for recording
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Speak the tongue twister clearly",
      });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "You can now play back your recording",
      });
    }
  };

  const readAloud = () => {
    if (!currentTwister || isSpeaking) return;
    
    // Cancel any previous speech
    window.speechSynthesis.cancel();
    
    // Use the Web Speech API to read the tongue twister
    const utterance = new SpeechSynthesisUtterance(currentTwister.text);
    utterance.rate = 0.9; // Slightly slower for clarity
    
    // Set up speech events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "There was an error reading the text aloud",
        variant: "destructive",
      });
    };
    
    window.speechSynthesis.speak(utterance);
    
    toast({
      title: "Reading Aloud",
      description: "Listen carefully to the pronunciation",
    });
  };

  const handleNextTwister = () => {
    if (!tongueTwisters || tongueTwisters.length === 0) return;
    
    // Pick a different tongue twister
    let newTwister;
    do {
      const randomIndex = Math.floor(Math.random() * tongueTwisters.length);
      newTwister = tongueTwisters[randomIndex];
    } while (newTwister.id === currentTwister?.id && tongueTwisters.length > 1);
    
    setCurrentTwister(newTwister);
    setAudioBlob(null);
    setAudioUrl(null);
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Tongue Twisters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full mt-6" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load tongue twisters. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="material-icons text-blue-500">record_voice_over</span>
            Tongue Twisters
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
            <span className="material-icons text-sm mr-1 text-blue-500">check_circle</span>
            {completedTwisters} completed
          </Badge>
        </div>
      </CardHeader>
      
      {currentTwister ? (
        <>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-900">
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium text-center">
                "{currentTwister.text}"
              </p>
              <div className="mt-3 text-xs text-gray-500 flex items-center justify-center">
                <span className="material-icons text-xs mr-1">trending_up</span>
                Difficulty: <span className="ml-1 font-medium">{currentTwister.difficulty.charAt(0).toUpperCase() + currentTwister.difficulty.slice(1)}</span>
              </div>
            </div>
            
            <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <span className="material-icons mr-2 text-yellow-500">tips_and_updates</span>
              <AlertTitle>Challenge Yourself!</AlertTitle>
              <AlertDescription>
                Try saying the tongue twister three times fast without stumbling!
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={readAloud}
                disabled={isSpeaking}
              >
                <span className="material-icons">{isSpeaking ? 'volume_off' : 'volume_up'}</span>
                {isSpeaking ? 'Speaking...' : 'Read Aloud'}
              </Button>
              
              {!isRecording ? (
                <Button
                  variant="default"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                  onClick={startRecording}
                >
                  <span className="material-icons">mic</span>
                  Record Yourself
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={stopRecording}
                >
                  <span className="material-icons">stop</span>
                  Stop Recording ({formatTime(recordingTime)})
                </Button>
              )}
            </div>
            
            {isRecording && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Recording...</span>
                  <span>{formatTime(recordingTime)}</span>
                </div>
                <Progress value={(recordingTime % 60) * 1.66} className="h-1" />
              </div>
            )}
            
            {audioUrl && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-2 flex items-center">
                  <span className="material-icons text-green-500 mr-2">mic</span>
                  Your Recording:
                </h3>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <p className="text-sm text-gray-500 mt-2">
                  Compare your pronunciation with the original. Practice makes perfect!
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleNextTwister}
              className="flex items-center gap-1"
            >
              <span className="material-icons text-sm">skip_next</span>
              Next Tongue Twister
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardContent>
          <p>No tongue twisters available. Please try again later.</p>
        </CardContent>
      )}
    </Card>
  );
};

export default TongueTwisters;
