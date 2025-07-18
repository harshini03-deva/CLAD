import { Link, useLocation } from 'wouter';
import { AVAILABLE_BADGES } from '@/lib/constants';
import { useFocusMode, useUserStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const [location] = useLocation();
  const { toggleFocusMode } = useFocusMode();
  const { badges } = useUserStore();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-md hidden md:block h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/" 
              className={`flex items-center p-2 text-gray-700 dark:text-gray-200 rounded ${
                location === '/' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-icons mr-3">home</span>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/discover" 
              className={`flex items-center p-2 text-gray-700 dark:text-gray-200 rounded ${
                location === '/discover' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-icons mr-3">explore</span>
              <span>Discover</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/bookmarks" 
              className={`flex items-center p-2 text-gray-700 dark:text-gray-200 rounded ${
                location === '/bookmarks' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-icons mr-3">bookmark</span>
              <span>Bookmarks</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/communities" 
              className={`flex items-center p-2 text-gray-700 dark:text-gray-200 rounded ${
                location === '/communities' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-icons mr-3">groups</span>
              <span>Communities</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/games" 
              className={`flex items-center p-2 text-gray-700 dark:text-gray-200 rounded ${
                location.startsWith('/games') ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-icons mr-3">sports_esports</span>
              <span>Games</span>
            </Link>
          </li>

          <li className="pt-4">
            <p className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Focus Mode</p>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start p-2 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={toggleFocusMode}
            >
              <span className="material-icons mr-3">center_focus_strong</span>
              <span>Start Focus Mode</span>
            </Button>
          </li>

          <li className="pt-4">
            <p className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">My Badges</p>
          </li>
          <li>
            <div className="flex p-2 space-x-2">
              {badges.length > 0 ? (
                badges.map(badge => (
                  <span 
                    key={badge.id} 
                    className="w-8 h-8 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: badge.backgroundColor }}
                    title={badge.title}
                  >
                    <span className="material-icons text-white text-sm">{badge.icon}</span>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No badges earned yet</p>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
