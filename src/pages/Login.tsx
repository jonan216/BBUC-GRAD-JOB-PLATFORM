import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/lib/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast({ title: 'Login Failed', description: data.error, variant: 'destructive' });
        return;
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({ title: 'Logged in successfully', description: 'Welcome back!' });
      
      if (data.user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (data.user.role === 'employer') {
        navigate('/dashboard/employer');
      } else {
        navigate('/dashboard/graduate');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Could not connect to server', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <img src="/logo.png" className="h-10 w-10 object-contain" alt="UCU Logo" />
          <span className="font-display text-xl font-bold tracking-tight">BBUC GRADUATES JOB PLATFORM</span>
        </Link>

        <div className="rounded-lg border bg-card p-6">
          <h1 className="font-display text-xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Demo: use <code className="text-xs bg-muted px-1 rounded">admin@</code>, <code className="text-xs bg-muted px-1 rounded">employer@</code>, or any email
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register/graduate" className="font-medium text-primary transition-expo hover:underline">Register as Graduate</Link>
          {' · '}
          <Link to="/register/employer" className="font-medium text-primary transition-expo hover:underline">Register as Employer</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
