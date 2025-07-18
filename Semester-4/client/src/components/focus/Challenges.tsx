import { useState } from 'react';
import { CHALLENGES } from '@/lib/constants';
import { useUserStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Challenges = () => {
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { addBadge } = useUserStore();
  const { toast } = useToast();

  const startChallenge = (challengeId: string) => {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (challenge) {
      setActiveChallenge(challengeId);
      setTimeLeft(challenge.duration * 60);
      
      // Start countdown
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            completeChallenge(challengeId);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Open the external website in a new tab if URL is available
      if (challenge.externalUrl) {
        window.open(challenge.externalUrl, '_blank', 'noopener,noreferrer');
      }
      
      toast({
        title: "Challenge Started",
        description: `${challenge.title} - ${challenge.duration} minutes`,
      });
    }
  };

  const completeChallenge = (challengeId: string) => {
    setActiveChallenge(null);
    
    // 50% chance of earning a badge for simplicity
    if (Math.random() > 0.5) {
      addBadge('focus-champion');
      
      toast({
        title: "Challenge Completed!",
        description: "You've earned the 'Focus Champion' badge!",
        variant: "success",
      });
    } else {
      toast({
        title: "Challenge Completed!",
        description: "Well done on completing the challenge.",
      });
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="mb-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-md p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Today's Focus Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CHALLENGES.map(challenge => (
          <div 
            key={challenge.id}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4"
          >
            <div className="flex items-center mb-3">
              <span className="material-icons mr-2">{challenge.icon}</span>
              <h3 className="font-medium">{challenge.title}</h3>
            </div>
            <p className="text-sm mb-3">{challenge.description}</p>
            
            {activeChallenge === challenge.id ? (
              <div className="text-center">
                <div className="font-bold mb-1">{formatTime(timeLeft)}</div>
                <p className="text-xs">Challenge in progress...</p>
              </div>
            ) : (
              <Button 
                variant="secondary"
                size="sm"
                className="text-sm bg-white text-primary px-3 py-1 rounded-full hover:bg-opacity-90 transition-all"
                onClick={() => startChallenge(challenge.id)}
                disabled={!!activeChallenge}
              >
                Start Now
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Challenges;
