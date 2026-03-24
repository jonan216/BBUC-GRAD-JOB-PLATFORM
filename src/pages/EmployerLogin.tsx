import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/lib/api';

const EmployerLogin = () => {
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
      
      if (data.user.role !== 'employer' && data.user.role !== 'admin') {
        toast({ title: 'Invalid Role', description: 'Please use the Graduate login page for graduate accounts.', variant: 'destructive' });
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({ title: 'Logged in successfully', description: 'Welcome back to the employer portal!' });
      
      navigate(data.user.role === 'admin' ? '/dashboard/admin' : '/dashboard/employer');
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
          <h1 className="font-display text-xl font-bold tracking-tight mb-1">Employer Login</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your employer account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="company@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register/employer" className="font-medium text-primary transition-expo hover:underline">Register as Employer</Link>
        </p>
      </div>
    </div>
  );
};

export default EmployerLogin;
