import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const AdminLogin = () => {
  const { setIsAuthenticated } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication - just redirect
    if (username && password) {
      setIsAuthenticated(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md glass-card relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gold/10 flex items-center justify-center hexagon">
            <HexagonIcon size="xl" className="text-gold">
              <Lock className="h-8 w-8 text-gold" />
            </HexagonIcon>
          </div>
          <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="bg-secondary/50"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary/50"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
