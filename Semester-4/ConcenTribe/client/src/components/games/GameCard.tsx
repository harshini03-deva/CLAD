import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const GameCard = ({ id, title, description, icon, color }: GameCardProps) => {
  // Tailwind dynamic color classes
  const colorMap: Record<string, { bg: string; text: string; bgButton: string; hoverBg: string }> = {
    yellow: { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
      text: 'text-yellow-500',
      bgButton: 'bg-yellow-500', 
      hoverBg: 'hover:bg-yellow-600' 
    },
    blue: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-500',
      bgButton: 'bg-blue-500', 
      hoverBg: 'hover:bg-blue-600' 
    },
    green: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-500',
      bgButton: 'bg-green-500', 
      hoverBg: 'hover:bg-green-600' 
    },
    purple: { 
      bg: 'bg-purple-100 dark:bg-purple-900/30', 
      text: 'text-purple-500',
      bgButton: 'bg-purple-500', 
      hoverBg: 'hover:bg-purple-600' 
    }
  };

  const colorClasses = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all h-full flex flex-col">
      <div className={`h-40 ${colorClasses.bg} flex items-center justify-center`}>
        <span className={`material-icons text-5xl ${colorClasses.text}`}>{icon}</span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 flex-grow">
          {description}
        </p>
        <Link to={`/games/${id}`} className="w-full">
          <Button 
            className={`w-full ${colorClasses.bgButton} ${colorClasses.hoverBg} text-white`}
          >
            Play Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GameCard;
