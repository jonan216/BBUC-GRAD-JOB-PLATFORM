import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/hooks/use-toast';

const RegisterGraduate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: '', studentNumber: '', email: '', password: '',
    course: '', graduationYear: '', skills: '', bio: '',
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register/graduate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName,
          student_number: form.studentNumber,
          email: form.email,
          password: form.password,
          course: form.course,
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
          <h1 className="font-display text-xl font-bold tracking-tight mb-1">Graduate Registration</h1>
          <p className="text-sm text-muted-foreground mb-6">Create your account with your BBUC student number</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Sarah Ainembabazi" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentNumber">Student Number</Label>
                <Input id="studentNumber" placeholder="BBUC/2022/1234" value={form.studentNumber} onChange={(e) => update('studentNumber', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => update('password', e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Course of Study</Label>
                <Input id="course" placeholder="BBA" value={form.course} onChange={(e) => update('course', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input id="graduationYear" type="number" placeholder="2025" value={form.graduationYear} onChange={(e) => update('graduationYear', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input id="skills" placeholder="Accounting, Excel, Communication" value={form.skills} onChange={(e) => update('skills', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea id="bio" placeholder="Tell employers about yourself..." rows={3} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          {' · '}
          <Link to="/register/employer" className="font-medium text-primary hover:underline">Register as Employer</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterGraduate;
