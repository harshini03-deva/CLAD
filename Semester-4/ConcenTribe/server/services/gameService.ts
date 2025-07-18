import { storage } from '../storage';

// Fetch riddles
export const getRiddles = async (limit: number = 10): Promise<any[]> => {
  try {
    const riddles = await storage.getRiddles(limit);
    
    if (riddles.length === 0) {
      // If no riddles in DB, return some defaults
      return [
        {
          id: "1",
          question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
          answer: "Echo",
          difficulty: "medium"
        },
        {
          id: "2",
          question: "The more you take, the more you leave behind. What am I?",
          answer: "Footsteps",
          difficulty: "easy"
        },
        {
          id: "3",
          question: "What has keys but no locks, space but no room, and you can enter but not go in?",
          answer: "Keyboard",
          difficulty: "medium"
        }
      ];
    }
    
    return riddles;
  } catch (error) {
    console.error('Error fetching riddles:', error);
    
    // Return some default riddles in case of error
    return [
      {
        id: "1",
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "Echo",
        difficulty: "medium"
      },
      {
        id: "2",
        question: "The more you take, the more you leave behind. What am I?",
        answer: "Footsteps",
        difficulty: "easy"
      },
      {
        id: "3",
        question: "What has keys but no locks, space but no room, and you can enter but not go in?",
        answer: "Keyboard",
        difficulty: "medium"
      }
    ];
  }
};

// Fetch tongue twisters
export const getTongueTwisters = async (limit: number = 10): Promise<any[]> => {
  try {
    const twisters = await storage.getTongueTwisters(limit);
    
    if (twisters.length === 0) {
      // If no tongue twisters in DB, return some defaults
      return [
        {
          id: "1",
          text: "Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?",
          difficulty: "medium"
        },
        {
          id: "2",
          text: "She sells seashells by the seashore. The shells she sells are surely seashells.",
          difficulty: "easy"
        },
        {
          id: "3",
          text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
          difficulty: "medium"
        }
      ];
    }
    
    return twisters;
  } catch (error) {
    console.error('Error fetching tongue twisters:', error);
    
    // Return some default tongue twisters in case of error
    return [
      {
        id: "1",
        text: "Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?",
        difficulty: "medium"
      },
      {
        id: "2",
        text: "She sells seashells by the seashore. The shells she sells are surely seashells.",
        difficulty: "easy"
      },
      {
        id: "3",
        text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        difficulty: "medium"
      }
    ];
  }
};

// Get a Sudoku puzzle
export const getSudokuPuzzle = async (): Promise<any> => {
  try {
    const sudoku = await storage.getSudokuPuzzle();
    return sudoku;
  } catch (error) {
    console.error('Error fetching Sudoku puzzle:', error);
    
    // Return a default sudoku grid in case of error
    return {
      grid: generateSudokuGrid()
    };
  }
};

// Check a Sudoku solution
export const checkSudokuSolution = async (grid: any[][]): Promise<{
  isCorrect: boolean;
  validCells: boolean[][];
}> => {
  try {
    // Check if the solution is valid
    const validCells = Array(9).fill(null).map(() => Array(9).fill(true));
    let isCorrect = true;
    
    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Set();
      for (let col = 0; col < 9; col++) {
        const cell = grid[row][col];
        if (cell.value === null) {
          validCells[row][col] = false;
          isCorrect = false;
          continue;
        }
        
        if (seen.has(cell.value)) {
          validCells[row][col] = false;
          isCorrect = false;
        }
        seen.add(cell.value);
      }
    }
    
    // Check columns
    for (let col = 0; col < 9; col++) {
      const seen = new Set();
      for (let row = 0; row < 9; row++) {
        const cell = grid[row][col];
        if (cell.value === null) continue;
        
        if (seen.has(cell.value)) {
          validCells[row][col] = false;
          isCorrect = false;
        }
        seen.add(cell.value);
      }
    }
    
    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set();
        for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
          for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
            const cell = grid[row][col];
            if (cell.value === null) continue;
            
            if (seen.has(cell.value)) {
              validCells[row][col] = false;
              isCorrect = false;
            }
            seen.add(cell.value);
          }
        }
      }
    }
    
    return {
      isCorrect,
      validCells
    };
  } catch (error) {
    console.error('Error checking Sudoku solution:', error);
    
    // Return a default response in case of error
    return {
      isCorrect: false,
      validCells: Array(9).fill(null).map(() => Array(9).fill(false))
    };
  }
};

// Get a Crossword puzzle
export const getCrosswordPuzzle = async (difficulty: string = 'medium'): Promise<any> => {
  try {
    const crossword = await storage.getCrosswordPuzzle();
    return crossword;
  } catch (error) {
    console.error('Error fetching Crossword puzzle:', error);
    
    // Return a default crossword puzzle in case of error
    return {
      puzzle: {
        grid: generateCrosswordGrid(),
        clues: [
          {
            number: 1,
            text: "Company led by Elon Musk that builds electric vehicles",
            orientation: "across",
            answer: "TESLA",
            relatedArticleId: "1"
          },
          {
            number: 2,
            text: "Artificial intelligence chatbot developed by OpenAI",
            orientation: "down",
            answer: "CHATGPT",
            relatedArticleId: "2"
          },
          {
            number: 3,
            text: "Digital currency based on blockchain technology",
            orientation: "across",
            answer: "BITCOIN",
            relatedArticleId: "3"
          }
        ],
        size: 10
      }
    };
  }
};

// Check Crossword answers
export const checkCrosswordAnswers = async (puzzleId: string, userAnswers: Record<string, string[]>): Promise<{
  isCorrect: boolean;
  correctCount: number;
  totalCount: number;
}> => {
  try {
    // Get puzzle from storage to check against correct answers
    const crosswordData = await storage.getCrosswordPuzzle();
    const puzzle = crosswordData.puzzle;
    
    if (!puzzle) {
      throw new Error('Puzzle not found');
    }
    
    // Check each clue
    let correctCount = 0;
    const totalCount = puzzle.clues.length;
    
    puzzle.clues.forEach((clue: any) => {
      const clueId = `${clue.orientation}-${clue.number}`;
      const userAnswer = userAnswers[clueId];
      
      if (!userAnswer) return;
      
      // Join the user's answer letters
      const userAnswerStr = userAnswer.join('').toUpperCase();
      
      if (userAnswerStr === clue.answer) {
        correctCount++;
      }
    });
    
    const isCorrect = correctCount === totalCount;
    
    return {
      isCorrect,
      correctCount,
      totalCount
    };
  } catch (error) {
    console.error('Error checking Crossword answers:', error);
    
    // Return a default response in case of error
    return {
      isCorrect: false,
      correctCount: 0,
      totalCount: 1
    };
  }
};

// Helper functions to generate default games

function generateSudokuGrid() {
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

function generateCrosswordGrid() {
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
