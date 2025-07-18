import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CrosswordPuzzle, CrosswordClue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const Crossword = () => {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const { addBadge } = useUserStore();
  const { toast } = useToast();

  // Fetch crossword puzzle
  const { 
    data: crosswordData, 
    isLoading, 
    error, 
    refetch: fetchNewPuzzle 
  } = useQuery<{ puzzle: CrosswordPuzzle }>({
    queryKey: ['/api/games/crossword'],
  });

  useEffect(() => {
    if (crosswordData && crosswordData.puzzle) {
      setPuzzle(crosswordData.puzzle);
      
      // Initialize empty user answers
      const initialAnswers: Record<string, string[]> = {};
      crosswordData.puzzle.clues.forEach(clue => {
        initialAnswers[`${clue.orientation}-${clue.number}`] = Array(clue.answer.length).fill('');
      });
      setUserAnswers(initialAnswers);
      
      // Select first clue by default
      if (crosswordData.puzzle.clues.length > 0) {
        setSelectedClue(crosswordData.puzzle.clues[0]);
        setSelectedDirection(crosswordData.puzzle.clues[0].orientation);
      }
    }
  }, [crosswordData]);

  const handleClueSelect = (clue: CrosswordClue) => {
    setSelectedClue(clue);
    setSelectedDirection(clue.orientation);
  };

  const handleLetterInput = (clueId: string, index: number, value: string) => {
    if (!value || /^[A-Za-z]$/.test(value)) {
      const newUserAnswers = { ...userAnswers };
      const upperValue = value.toUpperCase();
      
      if (!newUserAnswers[clueId]) {
        newUserAnswers[clueId] = [];
      }
      
      newUserAnswers[clueId][index] = upperValue;
      setUserAnswers(newUserAnswers);
      
      // Auto-advance to next cell
      if (value && selectedClue) {
        const inputs = document.querySelectorAll(`[data-clue-id="${clueId}"]`);
        if (index < inputs.length - 1) {
          (inputs[index + 1] as HTMLInputElement).focus();
        }
      }
    }
  };

  const checkAnswers = async () => {
    if (!puzzle) return;
    
    try {
      const response = await fetch('/api/games/crossword/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          puzzleId: puzzle.clues[0].number, // Use first clue number as puzzle ID
          userAnswers 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check answers');
      }
      
      const result = await response.json();
      
      if (result.isCorrect) {
        toast({
          title: "Congratulations!",
          description: "You've completed the crossword puzzle correctly!",
          variant: "success",
        });
        
        // 40% chance to earn a badge
        if (Math.random() < 0.4) {
          addBadge('puzzle-master');
          toast({
            title: "Achievement Unlocked!",
            description: "You've earned the 'Puzzle Master' badge!",
            variant: "success",
          });
        }
      } else {
        toast({
          title: "Not Quite Right",
          description: `You've got ${result.correctCount} out of ${result.totalCount} answers correct.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking answers:', error);
      toast({
        title: "Error",
        description: "Failed to check answers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const revealHint = () => {
    if (!selectedClue || !puzzle) return;
    
    const clueId = `${selectedClue.orientation}-${selectedClue.number}`;
    const randomIndex = Math.floor(Math.random() * selectedClue.answer.length);
    
    const newUserAnswers = { ...userAnswers };
    newUserAnswers[clueId][randomIndex] = selectedClue.answer[randomIndex];
    setUserAnswers(newUserAnswers);
    
    toast({
      title: "Hint Revealed",
      description: `Revealed letter ${randomIndex + 1} for "${selectedClue.text}"`,
    });
  };

  const handleNewPuzzle = () => {
    fetchNewPuzzle();
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>News Crossword</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[450px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (error || !puzzle) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load crossword puzzle. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  // Get across and down clues
  const acrossClues = puzzle.clues.filter(clue => clue.orientation === 'across');
  const downClues = puzzle.clues.filter(clue => clue.orientation === 'down');

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span className="material-icons text-purple-500">extension</span>
          News Crossword
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Crossword Grid */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
            <div
              className="grid gap-0.5 bg-gray-300 dark:bg-gray-700 p-0.5 border-2 border-gray-800 dark:border-gray-500 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${puzzle.size}, minmax(0, 1fr))`,
                width: '100%',
                maxWidth: '500px',
                aspectRatio: '1/1'
              }}
            >
              {puzzle.grid.flat().map((cell, index) => {
                const row = Math.floor(index / puzzle.size);
                const col = index % puzzle.size;
                
                // Find the clue this cell belongs to
                const cellClue = selectedClue && 
                  ((selectedDirection === 'across' && row === selectedClue.number) || 
                   (selectedDirection === 'down' && col === selectedClue.number));
                
                const clueId = selectedClue ? `${selectedClue.orientation}-${selectedClue.number}` : '';
                const cellIndex = selectedDirection === 'across' ? col : row;
                const userInput = userAnswers[clueId]?.[cellIndex] || '';
                
                return cell.isBlack ? (
                  <div
                    key={index}
                    className="bg-gray-800 dark:bg-gray-900"
                  />
                ) : (
                  <div
                    key={index}
                    className={`
                      relative aspect-square flex items-center justify-center 
                      bg-white dark:bg-gray-800
                      ${cell.isHighlighted ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                      ${cellClue ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
                      border border-gray-300 dark:border-gray-700
                    `}
                  >
                    {cell.clueNumber && (
                      <div className="absolute top-0 left-0 text-xs text-gray-500 dark:text-gray-400 p-0.5">
                        {cell.clueNumber}
                      </div>
                    )}
                    <input
                      type="text"
                      maxLength={1}
                      value={userInput}
                      onChange={(e) => handleLetterInput(clueId, cellIndex, e.target.value)}
                      className="w-full h-full text-center bg-transparent text-gray-900 dark:text-gray-100 font-bold text-lg focus:outline-none uppercase"
                      data-clue-id={clueId}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Clues Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Tabs defaultValue="across" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="across">Across</TabsTrigger>
                <TabsTrigger value="down">Down</TabsTrigger>
              </TabsList>
              <TabsContent value="across" className="pt-4 px-4 h-[300px] overflow-y-auto">
                <ul className="space-y-2">
                  {acrossClues.map(clue => (
                    <li 
                      key={`across-${clue.number}`}
                      className={`
                        p-2 rounded cursor-pointer
                        ${selectedClue?.number === clue.number && selectedDirection === 'across' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}
                      onClick={() => handleClueSelect(clue)}
                    >
                      <strong>{clue.number}.</strong> {clue.text}
                      {clue.relatedArticleId && (
                        <Link 
                          to={`/article/${clue.relatedArticleId}`}
                          className="text-primary hover:underline text-sm ml-2"
                        >
                          (Read Article)
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="down" className="pt-4 px-4 h-[300px] overflow-y-auto">
                <ul className="space-y-2">
                  {downClues.map(clue => (
                    <li 
                      key={`down-${clue.number}`}
                      className={`
                        p-2 rounded cursor-pointer
                        ${selectedClue?.number === clue.number && selectedDirection === 'down' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}
                      onClick={() => handleClueSelect(clue)}
                    >
                      <strong>{clue.number}.</strong> {clue.text}
                      {clue.relatedArticleId && (
                        <Link 
                          to={`/article/${clue.relatedArticleId}`}
                          className="text-primary hover:underline text-sm ml-2"
                        >
                          (Read Article)
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between flex-wrap gap-2">
        <div>
          <Button
            variant="outline"
            onClick={handleNewPuzzle}
            className="mr-2"
          >
            New Puzzle
          </Button>
          <Button
            variant="outline"
            onClick={revealHint}
          >
            Hint
          </Button>
        </div>
        
        <Button
          onClick={checkAnswers}
        >
          Check Answers
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Crossword;
