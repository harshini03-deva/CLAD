import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SudokuGrid } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Sudoku = () => {
  const [grid, setGrid] = useState<SudokuGrid | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [filledCells, setFilledCells] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [validatedGrid, setValidatedGrid] = useState(false);
  const [completedGames, setCompletedGames] = useState(0);
  const { addBadge } = useUserStore();
  const { toast } = useToast();

  // Fetch Sudoku puzzle
  const { 
    data: sudokuData, 
    isLoading, 
    error, 
    refetch: fetchNewPuzzle 
  } = useQuery<{ grid: SudokuGrid }>({
    queryKey: ['/api/games/sudoku'],
  });

  useEffect(() => {
    if (sudokuData && sudokuData.grid) {
      setGrid(sudokuData.grid);
      setSelectedCell(null);
      setFilledCells(0);
      setValidatedGrid(false);
      
      // Count initially filled cells
      let initialFilledCount = 0;
      sudokuData.grid.forEach(row => {
        row.forEach(cell => {
          if (cell.value !== null) {
            initialFilledCount++;
          }
        });
      });
      
      // Set difficulty based on filled cells count
      if (initialFilledCount >= 45) {
        setDifficulty('easy');
      } else if (initialFilledCount >= 35) {
        setDifficulty('medium');
      } else {
        setDifficulty('hard');
      }
      
      // Reset timer
      setTimeElapsed(0);
      setIsTimerRunning(true);
    }
  }, [sudokuData]);

  // Timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    
    if (isTimerRunning) {
      timerId = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isTimerRunning]);

  // Calculate filled percentage
  useEffect(() => {
    if (!grid) return;
    
    let filledCount = 0;
    let totalCells = 0;
    
    grid.forEach(row => {
      row.forEach(cell => {
        totalCells++;
        if (cell.value !== null) {
          filledCount++;
        }
      });
    });
    
    setFilledCells(filledCount);
  }, [grid]);

  const handleCellClick = (row: number, col: number) => {
    // Only allow selecting cells that are not part of the original puzzle
    if (grid && !grid[row][col].isOriginal) {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell || !grid) return;
    
    const { row, col } = selectedCell;
    
    // Only allow numbers 1-9
    if (e.key >= '1' && e.key <= '9') {
      const newValue = parseInt(e.key);
      updateCellValue(row, col, newValue);
    } 
    // Allow deleting with Delete or Backspace keys
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      updateCellValue(row, col, null);
    }
    // Handle arrow keys for navigation
    else if (e.key === 'ArrowUp' && row > 0) {
      navigateToNextEditableCell(row - 1, col, 'up');
    } else if (e.key === 'ArrowDown' && row < 8) {
      navigateToNextEditableCell(row + 1, col, 'down');
    } else if (e.key === 'ArrowLeft' && col > 0) {
      navigateToNextEditableCell(row, col - 1, 'left');
    } else if (e.key === 'ArrowRight' && col < 8) {
      navigateToNextEditableCell(row, col + 1, 'right');
    }
  };
  
  // Helper to navigate to next editable cell
  const navigateToNextEditableCell = (row: number, col: number, direction: 'up' | 'down' | 'left' | 'right') => {
    if (!grid) return;
    
    // If current target is not original, select it
    if (!grid[row][col].isOriginal) {
      setSelectedCell({ row, col });
      return;
    }
    
    // Otherwise, continue in the same direction until we find an editable cell
    switch (direction) {
      case 'up':
        if (row > 0) navigateToNextEditableCell(row - 1, col, direction);
        break;
      case 'down':
        if (row < 8) navigateToNextEditableCell(row + 1, col, direction);
        break;
      case 'left':
        if (col > 0) navigateToNextEditableCell(row, col - 1, direction);
        break;
      case 'right':
        if (col < 8) navigateToNextEditableCell(row, col + 1, direction);
        break;
    }
  };

  const updateCellValue = (row: number, col: number, value: number | null) => {
    if (!grid) return;
    
    const newGrid = [...grid];
    newGrid[row][col] = { 
      ...newGrid[row][col], 
      value: value,
      isValid: undefined  // Clear validation when changing value
    };
    setGrid(newGrid);
    
    // Mark grid as not validated when making changes
    if (validatedGrid) {
      setValidatedGrid(false);
    }
  };

  const checkSolution = () => {
    if (!grid) return;
    
    // Check if the grid is complete
    const isComplete = grid.every(row => row.every(cell => cell.value !== null));
    if (!isComplete) {
      toast({
        title: "Incomplete Puzzle",
        description: "Please fill in all cells before checking the solution",
        variant: "destructive",
      });
      return;
    }
    
    // Make API call to check solution
    const checkSolution = async () => {
      try {
        const response = await fetch('/api/games/sudoku/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grid }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to check solution');
        }
        
        const result = await response.json();
        
        // Update grid with validation results
        const newGrid = grid.map((row, rowIndex) => 
          row.map((cell, colIndex) => ({
            ...cell,
            isValid: result.validCells[rowIndex][colIndex]
          }))
        );
        
        setGrid(newGrid);
        setValidatedGrid(true);
        
        if (result.isCorrect) {
          // Stop timer when puzzle is correctly solved
          setIsTimerRunning(false);
          setCompletedGames(prev => prev + 1);
          
          toast({
            title: "Congratulations!",
            description: `You've solved the puzzle correctly in ${formatTime(timeElapsed)}!`,
            variant: "success",
          });
          
          // 30% chance to earn a badge
          if (Math.random() < 0.3) {
            addBadge('puzzle-master');
            toast({
              title: "Achievement Unlocked!",
              description: "You've earned the 'Puzzle Master' badge!",
              variant: "success",
            });
          }
        } else {
          toast({
            title: "Incorrect Solution",
            description: "There are some errors in your solution. Incorrect cells are highlighted in red.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking solution:', error);
        toast({
          title: "Error",
          description: "Failed to check solution. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    checkSolution();
  };

  const handleNewGame = () => {
    // Confirm if there's an ongoing game
    if (grid && !validatedGrid && filledCells > 30) {
      if (window.confirm("Are you sure you want to start a new game? Your current progress will be lost.")) {
        fetchNewPuzzle();
      }
    } else {
      fetchNewPuzzle();
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate fill percentage (excluding original cells)
  const calculateFillPercentage = (): number => {
    if (!grid) return 0;
    
    let filledByUser = 0;
    let editableCells = 0;
    
    grid.forEach(row => {
      row.forEach(cell => {
        if (!cell.isOriginal) {
          editableCells++;
          if (cell.value !== null) {
            filledByUser++;
          }
        }
      });
    });
    
    return editableCells > 0 ? Math.round((filledByUser / editableCells) * 100) : 0;
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Sudoku</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-[450px] w-[450px]" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (error || !grid) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load Sudoku puzzle. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="material-icons text-green-500">grid_view</span>
            Sudoku
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
              <span className="material-icons text-sm mr-1 text-green-500">timer</span>
              {formatTime(timeElapsed)}
            </Badge>
            
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
              <span className="material-icons text-sm mr-1 text-blue-500">emoji_events</span>
              {completedGames} completed
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`
                ${difficulty === 'easy' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 
                difficulty === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 
                'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}
              `}
            >
              <span className="material-icons text-sm mr-1">signal_cellular_alt</span>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{calculateFillPercentage()}%</span>
          </div>
          <Progress value={calculateFillPercentage()} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className="w-full max-w-[450px] mx-auto"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="grid grid-cols-9 gap-0.5 bg-gray-300 dark:bg-gray-700 p-0.5 border-2 border-gray-800 dark:border-gray-500">
            {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isSameBlock = 
                  selectedCell && 
                  Math.floor(rowIndex / 3) === Math.floor(selectedCell.row / 3) && 
                  Math.floor(colIndex / 3) === Math.floor(selectedCell.col / 3);
                const isSameRowOrCol = 
                  selectedCell && 
                  (rowIndex === selectedCell.row || colIndex === selectedCell.col);
                
                // Add borders for the 3x3 blocks
                const borderTop = rowIndex % 3 === 0 && rowIndex > 0 ? 'border-t-2 border-gray-800 dark:border-gray-500' : '';
                const borderLeft = colIndex % 3 === 0 && colIndex > 0 ? 'border-l-2 border-gray-800 dark:border-gray-500' : '';
                
                // Cell color based on validation
                let cellColorClass = cell.isOriginal 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                  : 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400';
                
                if (cell.isValid === false) {
                  cellColorClass = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
                } else if (cell.isValid === true && !cell.isOriginal) {
                  cellColorClass = 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
                }
                
                return (
                  <TooltipProvider key={`${rowIndex}-${colIndex}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            relative aspect-square flex items-center justify-center 
                            text-lg font-bold cursor-pointer
                            ${cellColorClass}
                            ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                            ${isSameBlock && !isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                            ${isSameRowOrCol && !isSelected && !isSameBlock ? 'bg-gray-50 dark:bg-gray-800/70' : ''}
                            ${borderTop} ${borderLeft}
                            transition-all duration-150
                          `}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {cell.value}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {cell.isOriginal 
                          ? 'Original cell (cannot edit)' 
                          : cell.isValid === false 
                            ? 'Incorrect value' 
                            : cell.isValid === true 
                              ? 'Correct value' 
                              : 'Editable cell'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear'].map((num, index) => (
                <Button
                  key={index}
                  variant={typeof num === 'number' ? 'default' : 'outline'}
                  className={`w-12 h-12 text-lg ${index === 9 ? 'col-span-2' : ''}`}
                  onClick={() => {
                    if (selectedCell && grid) {
                      const { row, col } = selectedCell;
                      if (!grid[row][col].isOriginal) {
                        updateCellValue(row, col, typeof num === 'number' ? num : null);
                      }
                    }
                  }}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
          
          {validatedGrid && grid.some(row => row.some(cell => cell.isValid === false)) && (
            <Alert className="mt-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <span className="material-icons mr-2 text-red-500">error</span>
              <AlertTitle>Incorrect Solution</AlertTitle>
              <AlertDescription>
                There are errors in your solution. The incorrect cells are highlighted in red.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={handleNewGame}
        >
          <span className="material-icons text-sm">refresh</span>
          New Game
        </Button>
        
        <Button
          className="flex items-center gap-1"
          onClick={checkSolution}
        >
          <span className="material-icons text-sm">check_circle</span>
          Check Solution
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Sudoku;
