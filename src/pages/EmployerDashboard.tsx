import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LayoutDashboard, Briefcase, Users, Building2, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/dashboard/employer', icon: LayoutDashboard },
  { label: 'My Jobs', href: '/dashboard/employer', icon: Briefcase },
  { label: 'Applicants', href: '/dashboard/employer', icon: Users },
  { label: 'Company', href: '/dashboard/employer', icon: Building2 },
];

const EmployerDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [requirements, setRequirements] = useState('');

  // Queries
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchWithAuth('/api/profile/me'),
  });

  const { data: jobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => fetchWithAuth('/api/jobs/me'),
  });

  const { data: applications = [], isLoading: isAppsLoading } = useQuery({
    queryKey: ['employer-apps'],
    queryFn: () => fetchWithAuth('/api/applications/employer'),
  });

  // Mutations
  const postJobMutation = useMutation({
    mutationFn: (newJob: any) => fetchWithAuth('/api/jobs', { method: 'POST', body: JSON.stringify(newJob) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast({ title: 'Job posted!', description: 'Your job is pending admin approval.' });
      setDialogOpen(false);
      setTitle(''); setDescription(''); setLocation(''); setSalary(''); setRequirements('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      fetchWithAuth(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-apps'] });
      toast({ title: 'Status updated' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    postJobMutation.mutate({ title, description, location, salary, requirements });
  };

  const isLoading = isProfileLoading || isJobsLoading || isAppsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Employer Dashboard" navItems={navItems} userName="Loading..." userRole="employer">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const shortlistedCount = applications.filter((a: any) => a.status === 'shortlisted').length;

  return (
    <DashboardLayout
      title="Employer Dashboard"
      navItems={navItems}
      userName={profile?.company_name || profile?.name || 'Employer'}
      userRole="employer"
    >
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active Jobs" value={jobs.length} icon={Briefcase} />
          <StatCard label="Total Applicants" value={applications.length} icon={Users} accent />
          <StatCard label="Shortlisted" value={shortlistedCount} icon={Users} />
        </div>

        {/* Post Job */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">My Job Posts</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Post Job</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Post a New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input placeholder="e.g. Junior Accountant" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Job description..." rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input placeholder="Kampala" value={location} onChange={e => setLocation(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <Input placeholder="UGX 800k-1.2M" value={salary} onChange={e => setSalary(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Requirements (comma separated)</Label>
                  <Input placeholder="Accounting, Excel, Communication" value={requirements} onChange={e => setRequirements(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={postJobMutation.isPending}>
                  {postJobMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Post Job
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-card">
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No jobs posted yet.</div>
          ) : (
            jobs.map((job: any) => (
              <div key={job.id} className="flex items-center justify-between border-b p-4 last:border-b-0">
                <div>
                  <p className="font-medium text-sm">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.location} · {new Date(job.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="secondary" className="capitalize text-xs">{job.status}</Badge>
              </div>
            ))
          )}
        </div>

        {/* Applicants preview */}
        <div>
          <h2 className="font-display font-semibold mb-4">Recent Applicants</h2>
          <div className="rounded-lg border bg-card">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No applicants yet.</div>
            ) : (
              applications.map((a: any, i: number) => (
                <div key={a.id || i} className="flex items-center justify-between border-b p-4 last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{a.graduate_name}</p>
                    <p className="text-xs text-muted-foreground">Applied for {a.job_title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium capitalize text-muted-foreground mr-2">{a.status}</span>
                    {a.cv_url ? (
                      <a 
                        href={a.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-3 gap-1"
                      >
                         Download CV
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic px-2">No CV</span>
                    )}
                    {a.status === 'applied' && (
                      <Button 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={() => changeStatusMutation.mutate({ id: a.id, status: 'shortlisted' })}
                        disabled={changeStatusMutation.isPending}
                      >
                        Shortlist
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
