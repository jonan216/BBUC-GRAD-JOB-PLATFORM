import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';

const PAGE_SIZE = 6;

const JobListing = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetchWithAuth('/api/jobs'),
    retry: false
  });

  const filtered = useMemo(() =>
    jobs.filter((j: any) => {
      const q = search.toLowerCase();
      return j.title.toLowerCase().includes(q) ||
        (j.company_name && j.company_name.toLowerCase().includes(q)) ||
        (j.requirements && j.requirements.some((r: string) => r.toLowerCase().includes(q))) ||
        (j.location && j.location.toLowerCase().includes(q));
    }), [search, jobs]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-6">Browse Jobs</h1>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, skill, or location..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {isLoading ? (
            <div className="rounded-lg border bg-card p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : paged.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">No jobs found matching "{search}"</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((job: any, i: number) => <JobCard key={job.id} job={job} index={i} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobListing;
