import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/Home';
import Article from '@/pages/Article';
import Bookmarks from '@/pages/Bookmarks';
import Games from '@/pages/Games';
import Discover from '@/pages/Discover';
import Communities from '@/pages/Communities';
import Search from '@/pages/Search';
import AuthPage from '@/pages/auth-page';
import FocusMode from '@/components/focus/FocusMode';
import { useTheme } from '@/lib/store';
import { useEffect } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from './lib/protected-route';

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/article/:id" component={Article} />
      <ProtectedRoute path="/bookmarks" component={Bookmarks} />
      <ProtectedRoute path="/games/:gameId?" component={Games} />
      <ProtectedRoute path="/discover" component={Discover} />
      <ProtectedRoute path="/category/:category" component={Discover} />
      <ProtectedRoute path="/communities" component={Communities} />
      <ProtectedRoute path="/search" component={Search} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <Router />
        </main>
      </div>
      
      <Footer />
      
      {/* Focus Mode Dialog */}
      <FocusMode />
    </div>
  );
}

function App() {
  const { theme } = useTheme();
  
  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
