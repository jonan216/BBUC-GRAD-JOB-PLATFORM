import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import JobCard from '@/components/JobCard';
import { LayoutDashboard, Briefcase, FileText, User, Send, Loader2, Upload, ExternalLink } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard/graduate', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
  { label: 'My Applications', href: '/dashboard/graduate', icon: Send },
  { label: 'Profile', href: '/dashboard/graduate', icon: User },
];

const statusColor: Record<string, string> = {
  applied: 'bg-muted text-muted-foreground',
  shortlisted: 'bg-brand-gold/20 text-accent-foreground',
  rejected: 'bg-destructive/10 text-destructive',
};

const fetchWithAuth = async (url: string) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    let error = 'Request failed';
    try {
      const data = await res.json();
      error = data.error || error;
    } catch (e) {}
    throw new Error(error);
  }
  return res.json();
};

const GraduateDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['graduate-profile'],
    queryFn: () => fetchWithAuth('/api/profile/me'),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF, Word, or PowerPoint file.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        let errorMessage = 'Upload failed';
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error (${res.status}). Please contact support if this persists.`;
        }
        throw new Error(errorMessage);
      }
      
      toast({ title: 'CV Uploaded!', description: 'Employers can now view your CV.' });
      queryClient.invalidateQueries({ queryKey: ['graduate-profile'] });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const { data: applications = [], isLoading: isAppsLoading } = useQuery({
    queryKey: ['graduate-apps'],
    queryFn: () => fetchWithAuth('/api/applications/me'),
  });

  const { data: jobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetchWithAuth('/api/jobs'),
  });

  const isLoading = isProfileLoading || isAppsLoading || isJobsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Graduate Dashboard" navItems={navItems} userName="Loading..." userRole="graduate">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate recommended jobs based on skills
  const skills = profile?.skills || [];
  let recommended = [];
  if (skills.length > 0 && jobs.length > 0) {
    recommended = jobs.filter((j: any) =>
      j.requirements.some((r: string) => skills.includes(r))
    ).slice(0, 3);
  }
  
  // If no exact matches, just show the latest 3
  if (recommended.length === 0 && jobs.length > 0) {
    recommended = jobs.slice(0, 3);
  }

  return (
    <DashboardLayout
      title="Graduate Dashboard"
      navItems={navItems}
      userName={profile?.full_name || profile?.name || 'Graduate'}
      userRole="graduate"
    >
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Applications" value={applications.length} icon={Send} />
          <StatCard label="Shortlisted" value={applications.filter((a: any) => a.status === 'shortlisted').length} icon={FileText} accent />
          <StatCard label="Skills" value={skills.length} icon={User} />
        </div>

        {/* CV Upload */}
        <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Curriculum Vitae (CV)</h2>
                <p className="text-sm text-emerald-800/60 mt-1 max-w-lg">
                  Upload your CV in PDF, Word, or PowerPoint format. This will be automatically shared with employers when you apply for jobs.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {profile?.cv_url ? (
                <>
                  <a 
                    href={profile.cv_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100"
                  >
                    <ExternalLink className="h-4 w-4" /> View Current CV
                  </a>
                  <div className="relative">
                    <input
                      type="file"
                      id="cv-upload-update"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <label htmlFor="cv-upload-update">
                      <Button variant="outline" className="cursor-pointer" asChild disabled={isUploading}>
                        <span>{isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Update CV</span>
                      </Button>
                    </label>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="cv-upload-new"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label htmlFor="cv-upload-new">
                    <Button className="cursor-pointer bg-emerald-600 hover:bg-emerald-700" asChild disabled={isUploading}>
                      <span>{isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload CV</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications */}
        <div>
          <h2 className="font-display font-semibold mb-4">My Applications</h2>
          <div className="rounded-lg border bg-card">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">You haven't applied to any jobs yet.</div>
            ) : (
               applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between border-b p-4 last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{app.job_title}</p>
                    <p className="text-xs text-muted-foreground">{app.company_name} · Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={`capitalize text-xs ${statusColor[app.status] || 'bg-muted'}`}>{app.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold">Recommended for You</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommended.length === 0 ? (
              <div className="col-span-full p-8 text-center border rounded-lg text-muted-foreground">No recommended jobs available right now.</div>
            ) : (
               recommended.map((job: any, i: number) => <JobCard key={job.id} job={job} index={i} />)
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GraduateDashboard;
