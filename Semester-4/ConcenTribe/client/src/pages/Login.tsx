import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/lib/constants';
import { useUserStore } from '@/lib/store';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const updateUser = useUserStore((state) => state.updateUser);

  // Check if there's an error parameter in the URL (for OAuth failures)
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');

  if (error) {
    toast({
      title: "Authentication failed",
      description: "There was an error during authentication. Please try again.",
      variant: "destructive",
    });
    
    // Clear the error from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/login', { username, password });
      
      // Update user store with the response data
      updateUser(response.data);
      
      toast({
        title: "Welcome back!",
        description: `You've successfully logged into ${APP_NAME}`,
      });
      
      // Redirect to home page
      setLocation('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/register', { 
        username, 
        password, 
        email,
        name: name || username 
      });
      
      // Update user store with the response data
      updateUser(response.data);
      
      toast({
        title: "Welcome to ConcenTribe!",
        description: "Your account has been created successfully",
      });
      
      // Redirect to home page
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Please try again with different credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-muted-foreground mt-2">
              Stay focused, stay informed with personalized news
            </p>
          </div>
          
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to access your personalized experience
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        placeholder="Your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : 'Sign In'}
                    </Button>
                    
                    <div className="flex items-center w-full">
                      <Separator className="flex-1" />
                      <span className="px-3 text-xs text-muted-foreground">OR</span>
                      <Separator className="flex-1" />
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={handleGoogleLogin}
                    >
                      <FcGoogle className="h-5 w-5" />
                      <span>Continue with Google</span>
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username<span className="text-red-500">*</span></Label>
                      <Input
                        id="register-username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email<span className="text-red-500">*</span></Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password<span className="text-red-500">*</span></Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    
                    <div className="flex items-center w-full">
                      <Separator className="flex-1" />
                      <span className="px-3 text-xs text-muted-foreground">OR</span>
                      <Separator className="flex-1" />
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={handleGoogleLogin}
                    >
                      <FcGoogle className="h-5 w-5" />
                      <span>Sign up with Google</span>
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/90 to-purple-700 text-white">
        <div className="flex flex-col justify-center p-12 max-w-md mx-auto">
          <h2 className="text-4xl font-bold mb-6">Personalized News Experience</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="mr-2 text-xl">✓</span>
              <span>Customized content based on your interests</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-xl">✓</span>
              <span>Focus Mode with productivity tools</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-xl">✓</span>
              <span>Interactive mind games and challenges</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-xl">✓</span>
              <span>Join specialized news communities</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-xl">✓</span>
              <span>AI-powered insights and analysis</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}