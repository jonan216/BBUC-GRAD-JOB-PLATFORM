import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }
  return res.json();
};

const JobDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetchWithAuth('/api/jobs'),
    retry: false
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => fetchWithAuth('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graduate-apps'] });
      toast({ title: 'Application submitted!', description: 'Track your application in your dashboard.' });
      navigate('/dashboard/graduate');
    },
    onError: (err: any) => {
      // If unauthorized, redirect to login
      if (err.message.includes('No token') || err.message.includes('Access denied')) {
        toast({ title: 'Please Login', description: 'You need to log in as a graduate to apply.', variant: 'destructive' });
        navigate('/login/graduate');
      } else {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  const job = jobs.find((j: any) => j.id === id);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12 text-center">
          <p className="text-muted-foreground">Job not found.</p>
          <Link to="/jobs"><Button variant="ghost" className="mt-4">Back to jobs</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleApply = () => {
    applyMutation.mutate(job.id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl">
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 transition-expo hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to jobs
          </Link>

          <div className="rounded-lg border bg-card p-6 lg:p-8">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company_name}</span>
              {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(job.created_at).toLocaleDateString()}</span>
            </div>

            {job.salary && (
              <div className="mb-6 rounded-lg bg-muted p-3">
                <span className="text-sm font-medium">Salary: {job.salary}</span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="font-display font-semibold mb-2">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="font-display font-semibold mb-3">Requirements</h2>
              <div className="flex flex-wrap gap-2">
                {job.requirements && job.requirements.map((req: string) => (
                  <Badge key={req} variant="secondary">{req}</Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleApply} size="lg" className="w-full sm:w-auto" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Apply Now
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;
