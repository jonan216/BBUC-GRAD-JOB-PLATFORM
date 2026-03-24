import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/lib/api';

const RegisterEmployer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    companyName: '', industry: '', email: '', password: '',
    website: '', location: '', description: '',
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/auth/register/employer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.companyName,
          industry: form.industry,
          email: form.email,
          password: form.password,
          location: form.location,
          phone: '00000000'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return toast({ title: 'Error', description: data.error || 'Failed to register', variant: 'destructive' });
      }
      toast({ title: 'Registration successful!', description: data.message });
      navigate('/pending-approval');
    } catch(err) {
      toast({ title: 'Error', description: 'Server connection failed', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <img src="/logo.png" className="h-10 w-10 object-contain" alt="UCU Logo" />
          <span className="font-display text-xl font-bold tracking-tight">BBUC GRADUATES JOB PLATFORM</span>
        </Link>

        <div className="rounded-lg border bg-card p-6">
          <h1 className="font-display text-xl font-bold tracking-tight mb-1">Employer Registration</h1>
          <p className="text-sm text-muted-foreground mb-6">Register your company to start hiring BBUC graduates</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Acme Corp" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="Technology" value={form.industry} onChange={(e) => update('industry', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="hr@company.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => update('password', e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://..." value={form.website} onChange={(e) => update('website', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Kampala" value={form.location} onChange={(e) => update('location', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea id="description" placeholder="Tell graduates about your company..." rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Register Company</Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already registered? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          {' · '}
          <Link to="/register/graduate" className="font-medium text-primary hover:underline">Register as Graduate</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterEmployer;
