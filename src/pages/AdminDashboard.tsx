import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Users, Building2, CheckCircle, XCircle, Briefcase, Loader2, UserCog, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '#overview', icon: LayoutDashboard },
  { label: "User's Accounts", href: '#accounts', icon: UserCog },
];

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

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchWithAuth('/api/profile/me'),
    retry: false,
  });

  useEffect(() => {
    if (profile === null) navigate('/login');
  }, [profile, navigate]);

  const { data: overview, isLoading: isOverviewLoading, isError: isOverviewError, error: overviewError } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => fetchWithAuth('/api/admin/overview')
  });

  const { data: allUsers, isLoading: isUsersLoading, isError: isUsersError, error: usersError } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => fetchWithAuth('/api/admin/users/all')
  });

  // Mutations
  const userActionMutation = useMutation({
    mutationFn: ({ type, id, action }: { type: string, id: any, action: string }) => 
      fetchWithAuth(`/api/admin/${action}-user/${type}/${id}`, { method: 'PUT' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      toast({ title: 'Success', description: `User ${variables.action}d successfully.` });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({ type, id }: { type: string, id: any }) => 
      fetchWithAuth(`/api/admin/delete-user/${type}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast({ title: 'Success', description: 'User account deleted permanently.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const jobActionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string, action: string }) => 
      fetchWithAuth(`/api/admin/${action}-job/${id}`, { method: 'PUT' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      toast({ title: 'Success', description: `Job ${variables.action}d successfully.` });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const isLoading = activeTab === 'overview' ? isOverviewLoading : isUsersLoading;

  if (isLoading) {
    return (
      <DashboardLayout 
        title="Admin Center" 
        navItems={navItems.map(item => ({ ...item, onClick: () => setActiveTab(item.href.replace('#', '')) }))} 
        userName="Loading..." 
        userRole="admin"
      >
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const { graduates = [], employers = [], jobs = [], all_users = [] } = (overview as any) || {};
  const pendingGraduates = (graduates as any[]).filter((u: any) => u.status === 'pending');
  const pendingEmployers = (employers as any[]).filter((u: any) => u.status === 'pending');
  const pendingJobs = (jobs as any[]).filter((j: any) => j.status === 'pending');
  const approvedUsersCount = (all_users as any[]).filter((u: any) => u.status === 'approved').length;

  return (
    <DashboardLayout
      title={activeTab === 'overview' ? "Admin Center" : "User Accounts Management"}
      navItems={navItems.map(item => ({ 
        ...item, 
        onClick: () => setActiveTab(item.href.replace('#', '')),
        active: activeTab === item.href.replace('#', '')
      }))}
      userName={(profile as any)?.name || (profile as any)?.full_name || 'Admin'}
      userRole="admin"
    >
      {(isOverviewError || isUsersError) && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-200 text-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <p>Error loading dashboard data: {(overviewError as any)?.message || (usersError as any)?.message || 'Unknown error'}</p>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden mb-6 rounded-lg bg-white/5 p-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.href.replace('#', '');
          return (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.href.replace('#', ''))}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-all",
                isActive ? "bg-brand-gold text-emerald-950 shadow-sm" : "text-white/60 hover:text-white"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pending Graduates" value={pendingGraduates.length.toString()} icon={Users} />
            <StatCard label="Pending Employers" value={pendingEmployers.length.toString()} icon={Building2} />
            <StatCard label="Pending Jobs" value={pendingJobs.length.toString()} icon={Briefcase} />
            <StatCard label="Approved Users" value={approvedUsersCount.toString()} icon={CheckCircle} accent />
          </div>

          {/* Pending Sections */}
          <section>
            <h2 className="font-display font-semibold mb-4 text-lg text-white">Pending Graduates Verification</h2>
            <div className="rounded-lg border border-white/10 bg-emerald-900/40 backdrop-blur-md overflow-hidden">
              {pendingGraduates.length === 0 ? (
                <div className="p-12 text-center text-sm text-white/40">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  No pending graduates at the moment.
                </div>
              ) : (
                pendingGraduates.map((grad: any) => (
                  <div key={grad.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 p-4 last:border-b-0 gap-4">
                    <div>
                      <p className="font-medium text-sm text-white">{grad.name}</p>
                      <p className="text-xs text-white/60">{grad.email} · {grad.extra}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-white/20 text-white hover:bg-white/10" onClick={() => userActionMutation.mutate({ type: 'graduate', id: grad.id, action: 'reject' })} disabled={userActionMutation.isPending}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                      <Button size="sm" className="h-8 text-xs gap-1 bg-brand-gold text-emerald-950 hover:bg-brand-gold/90" onClick={() => userActionMutation.mutate({ type: 'graduate', id: grad.id, action: 'approve' })} disabled={userActionMutation.isPending}>
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display font-semibold mb-4 text-lg text-white">Pending Employers Verification</h2>
            <div className="rounded-lg border border-white/10 bg-emerald-900/40 backdrop-blur-md overflow-hidden">
              {pendingEmployers.length === 0 ? (
                <div className="p-12 text-center text-sm text-white/40">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  No pending employers at the moment.
                </div>
              ) : (
                pendingEmployers.map((emp: any) => (
                  <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 p-4 last:border-b-0 gap-4">
                    <div>
                      <p className="font-medium text-sm text-white">{emp.name}</p>
                      <p className="text-xs text-white/60">{emp.email} · {emp.extra}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-white/20 text-white hover:bg-white/10" onClick={() => userActionMutation.mutate({ type: 'employer', id: emp.id, action: 'reject' })} disabled={userActionMutation.isPending}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                      <Button size="sm" className="h-8 text-xs gap-1 bg-brand-gold text-emerald-950 hover:bg-brand-gold/90" onClick={() => userActionMutation.mutate({ type: 'employer', id: emp.id, action: 'approve' })} disabled={userActionMutation.isPending}>
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display font-semibold mb-4 text-lg text-white">Pending Job Approvals</h2>
            <div className="rounded-lg border border-white/10 bg-emerald-900/40 backdrop-blur-md overflow-hidden">
              {pendingJobs.length === 0 ? (
                <div className="p-12 text-center text-sm text-white/40">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  No pending job posts to review.
                </div>
              ) : (
                pendingJobs.map((job: any) => (
                  <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 p-4 last:border-b-0 gap-4">
                    <div>
                      <p className="font-medium text-sm text-white">{job.title}</p>
                      <p className="text-xs text-white/60">{job.company} · Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-white/20 text-white hover:bg-white/10" onClick={() => jobActionMutation.mutate({ id: job.id, action: 'reject' })} disabled={jobActionMutation.isPending}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                      <Button size="sm" className="h-8 text-xs gap-1 bg-brand-gold text-emerald-950 hover:bg-brand-gold/90" onClick={() => jobActionMutation.mutate({ id: job.id, action: 'approve' })} disabled={jobActionMutation.isPending}>
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl text-white">All System Accounts</h2>
            <Badge variant="outline" className="text-brand-gold border-brand-gold/30">Total: {allUsers?.length || 0}</Badge>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-emerald-900/40 backdrop-blur-md overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">User Details</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {!allUsers || allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                      <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      No registered accounts found in the system.
                    </td>
                  </tr>
                ) : (
                  allUsers.map((user: any) => (
                    <tr key={`${user.role}-${user.id}`} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-xs text-white/70">{user.email}</div>
                        <div className="text-[10px] mt-1 p-1 bg-white/10 rounded inline-block text-white/60 font-medium">{user.detail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/20' : 
                          user.role === 'employer' ? 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/20' : 
                          'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20'
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          user.status === 'approved' || user.status === 'active' ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-500"
                        )}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to PERMANENTLY delete account: ${user.name}? This cannot be undone.`)) {
                              deleteUserMutation.mutate({ type: user.role, id: user.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
