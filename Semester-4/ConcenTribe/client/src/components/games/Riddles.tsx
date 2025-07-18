import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Riddle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Riddles = () => {
  const [currentRiddle, setCurrentRiddle] = useState<Riddle | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const { addBadge } = useUserStore();
  const { toast } = useToast();

  // Fetch riddles
  const { data: riddles, isLoading, error } = useQuery<Riddle[]>({
    queryKey: ['/api/games/riddles'],
  });

  useEffect(() => {
    if (riddles && riddles.length > 0 && !currentRiddle) {
      // Set a random riddle on initial load
      const randomIndex = Math.floor(Math.random() * riddles.length);
      setCurrentRiddle(riddles[randomIndex]);
    }
  }, [riddles, currentRiddle]);

  const handleCheckAnswer = () => {
    if (!currentRiddle) return;
    
    // Simple case-insensitive check
    const isUserCorrect = userAnswer.toLowerCase().includes(currentRiddle.answer.toLowerCase());
    setIsCorrect(isUserCorrect);
    setAnsweredCount(prev => prev + 1);
    
    if (isUserCorrect) {
      setCorrectCount(prev => prev + 1);
      toast({
        title: "Correct!",
        description: "Well done, that's the right answer!",
        variant: "success",
      });
      
      // 20% chance to earn a badge when answering correctly
      if (Math.random() < 0.2) {
        addBadge('puzzle-master');
        toast({
          title: "Achievement Unlocked!",
          description: "You've earned the 'Puzzle Master' badge!",
          variant: "success",
        });
      }
    } else {
      toast({
        title: "Not quite right",
        description: "Try again or reveal the answer",
        variant: "destructive",
      });
    }
  };

  const handleNextRiddle = () => {
    if (!riddles || riddles.length === 0) return;
    
    // Pick a different riddle
    let newRiddle;
    do {
      const randomIndex = Math.floor(Math.random() * riddles.length);
      newRiddle = riddles[randomIndex];
    } while (newRiddle.id === currentRiddle?.id && riddles.length > 1);
    
    setCurrentRiddle(newRiddle);
    setUserAnswer('');
    setShowAnswer(false);
    setIsCorrect(null);
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    if (!isCorrect && isCorrect !== null) {
      // Count as an attempt if they revealed the answer after getting it wrong
      setAnsweredCount(prev => prev + 1);
    }
  };

  const accuracyPercentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Riddles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full mt-6" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
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
          <p className="text-red-500">Failed to load riddles. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="material-icons text-yellow-500">lightbulb</span>
            Riddles
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
              <span className="material-icons text-sm mr-1 text-green-500">check_circle</span>
              {correctCount} correct
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
              <span className="material-icons text-sm mr-1 text-blue-500">help</span>
              {answeredCount} attempted
            </Badge>
          </div>
        </div>
        {answeredCount > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Accuracy</span>
              <span>{accuracyPercentage}%</span>
            </div>
            <Progress value={accuracyPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      {currentRiddle ? (
        <>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900">
              <h3 className="font-medium text-lg mb-2">Question:</h3>
              <p className="text-gray-700 dark:text-gray-300">{currentRiddle.question}</p>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <span className="material-icons text-xs mr-1">trending_up</span>
                Difficulty: <span className="ml-1 font-medium">{currentRiddle.difficulty.charAt(0).toUpperCase() + currentRiddle.difficulty.slice(1)}</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Your Answer:</h3>
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                rows={3}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
            
            {isCorrect !== null && (
              <div className={`p-3 rounded-md ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900' : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900'}`}>
                <p className={`font-medium flex items-center ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <span className="material-icons mr-2">{isCorrect ? 'check_circle' : 'error'}</span>
                  {isCorrect ? 'Correct! Well done.' : 'Not quite right. Try again or reveal the answer.'}
                </p>
              </div>
            )}
            
            {showAnswer && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium mb-1 flex items-center">
                  <span className="material-icons text-blue-500 mr-2">info</span>
                  Answer:
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{currentRiddle.answer}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div>
              <Button
                variant="outline"
                className="mr-2 flex items-center gap-1"
                onClick={handleRevealAnswer}
                disabled={showAnswer}
              >
                <span className="material-icons text-sm">visibility</span>
                Reveal Answer
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={handleNextRiddle}
              >
                <span className="material-icons text-sm">skip_next</span>
                Next Riddle
              </Button>
            </div>
            
            <Button
              onClick={handleCheckAnswer}
              disabled={!userAnswer.trim()}
              className="flex items-center gap-1"
            >
              <span className="material-icons text-sm">check</span>
              Check Answer
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardContent>
          <p>No riddles available. Please try again later.</p>
        </CardContent>
      )}
    </Card>
  );
};

export default Riddles;
