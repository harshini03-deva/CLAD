import { useState } from 'react';
import { useRoute } from 'wouter';
import { GAMES } from '@/lib/constants';
import GameCard from '@/components/games/GameCard';
import Riddles from '@/components/games/Riddles';
import TongueTwisters from '@/components/games/TongueTwisters';
import Sudoku from '@/components/games/Sudoku';
import Crossword from '@/components/games/Crossword';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/lib/store';

const Games = () => {
  const [_, params] = useRoute('/games/:gameId?');
  const { badges } = useUserStore();
  const gameId = params?.gameId;
  
  if (gameId) {
    // Render specific game based on ID
    switch (gameId) {
      case 'riddles':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <Button variant="outline" asChild>
                <a href="/games">← Back to Games</a>
              </Button>
            </div>
            <Riddles />
          </div>
        );
      case 'tongue-twisters':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <Button variant="outline" asChild>
                <a href="/games">← Back to Games</a>
              </Button>
            </div>
            <TongueTwisters />
          </div>
        );
      case 'sudoku':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <Button variant="outline" asChild>
                <a href="/games">← Back to Games</a>
              </Button>
            </div>
            <Sudoku />
          </div>
        );
      case 'crossword':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <Button variant="outline" asChild>
                <a href="/games">← Back to Games</a>
              </Button>
            </div>
            <Crossword />
          </div>
        );
      default:
        return <div>Game not found</div>;
    }
  }
  
  // Render games overview
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Mind Games</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Boost your cognitive abilities while taking a break from your news reading. Choose from a variety of 
          brain-stimulating games designed to challenge different aspects of your mind.
        </p>
      </div>
      
      {/* Badges Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Your Game Achievements</h2>
        <Card>
          <CardContent className="p-6">
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-2" 
                      style={{ backgroundColor: badge.backgroundColor }}
                    >
                      <span className="material-icons text-white text-xl">{badge.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="material-icons text-4xl text-gray-400 mb-2">emoji_events</span>
                <p className="text-gray-500 dark:text-gray-400">
                  You haven't earned any badges yet. Complete games to earn achievements!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Games Grid */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Choose a Game</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {GAMES.map((game) => (
          <GameCard 
            key={game.id}
            id={game.id}
            title={game.title}
            description={game.description}
            icon={game.icon}
            color={game.color}
          />
        ))}
      </div>
      
      {/* Benefits Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Benefits of Mind Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <span className="material-icons text-primary text-2xl mr-2">psychology</span>
                <h3 className="text-lg font-bold">Cognitive Improvement</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Regular play enhances memory, problem-solving skills, and mental processing speed.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <span className="material-icons text-primary text-2xl mr-2">self_improvement</span>
                <h3 className="text-lg font-bold">Stress Reduction</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Taking mental breaks with games helps reduce stress and improves overall mental wellbeing.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <span className="material-icons text-primary text-2xl mr-2">school</span>
                <h3 className="text-lg font-bold">Knowledge Retention</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Our news-based games help you better retain information from articles you've read.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Games;
