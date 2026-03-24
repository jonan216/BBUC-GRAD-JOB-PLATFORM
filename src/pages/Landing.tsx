import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import { motion } from 'framer-motion';
import { Building2, Shield, ArrowRight, Users, Briefcase, TrendingUp, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const fetchPublicStats = async () => {
  const res = await fetch('/api/public/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

const fetchLatestJobs = async () => {
  const res = await fetch('/api/public/latest-jobs');
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
};

const Landing = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: fetchPublicStats,
  });

  const { data: latestJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['latest-jobs'],
    queryFn: fetchLatestJobs,
  });

  // Fallback data if needed
  const displayStats = stats || {
    totalGraduates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    placementRate: 85,
    hiredThisMonth: 0
  };

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-brand-gold selection:text-emerald-950">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 -z-20 bg-no-repeat bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/graduates.png')" }}
      />
      
      {/* Brand Overlay for Readability */}
      <div className="fixed inset-0 -z-10 bg-black/50" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-950/60 via-emerald-900/40 to-brand-gold/20" />

      <Navbar />

      {/* Decorative Light Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-gold/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="container relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
              </span>
              {statsLoading ? '...' : displayStats.hiredThisMonth} graduates hired this month
            </motion.div>
            
            <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 text-white leading-[1.1] drop-shadow-2xl">
              From BBUC<br />to the World.
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl leading-relaxed mb-10 drop-shadow-md font-medium">
              The official bridge between Bishop Barham University College excellence and Uganda's leading employers. We connect talent with opportunity.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/login/graduate">
                <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 bg-brand-gold text-emerald-950 hover:bg-brand-gold/90 shadow-lg shadow-brand-gold/20 transition-all hover:scale-105 active:scale-95">
                  I'm a Graduate <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login/employer">
                <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 bg-brand-gold text-emerald-950 hover:bg-brand-gold/90 shadow-lg shadow-brand-gold/20 transition-all hover:scale-105 active:scale-95">
                  I'm an Employer
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="h-14 px-6 text-lg font-bold gap-2 bg-brand-gold/80 text-emerald-950 hover:bg-brand-gold shadow-lg shadow-brand-gold/10 transition-all hover:scale-105 active:scale-95">
                  Admin Access <Shield className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white/5 backdrop-blur-md border-y border-white/10">
        <div className="container px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 max-w-5xl mx-auto">
            {[
              { label: 'Registered Graduates', value: displayStats.totalGraduates.toLocaleString(), icon: Users, color: 'text-white' },
              { label: 'Partner Employers', value: displayStats.totalEmployers, icon: Building2, color: 'text-brand-gold' },
              { label: 'Active Jobs', value: displayStats.totalJobs, icon: Briefcase, color: 'text-white' },
              { label: 'Placement Rate', value: `${displayStats.placementRate}%`, icon: TrendingUp, color: 'text-brand-gold' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex flex-col items-center text-center p-4 rounded-2xl transition-all hover:bg-white/5 hover:shadow-xl hover:shadow-black/20 group"
              >
                <div className={`mb-4 p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="font-display text-4xl font-black tracking-tight mb-1 text-white">
                  {statsLoading ? '...' : stat.value}
                </p>
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 lg:py-32 bg-transparent">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-4xl font-extrabold tracking-tight mb-4 text-white">How it works</h2>
            <p className="text-lg text-white/80">The platform is designed to be simple and efficient for everyone in the BBUC community.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              { icon: () => <img src="/logo.png" className="h-7 w-7 object-contain" alt="UCU Logo" />, title: 'Graduates', desc: 'Register with your BBUC student number, complete your profile, upload your CV, and start applying to jobs with one click.', color: 'bg-brand-gold' },
              { icon: Building2, title: 'Employers', desc: 'Register your company, get verified by BBUC admin, post job opportunities, and find the best talent from BBUC graduates.', color: 'bg-brand-gold' },
              { icon: Shield, title: 'University Admin', desc: 'Verify accounts, approve job posts, monitor platform activity, and track graduate employment statistics.', color: 'bg-brand-gold' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="relative group p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm hover:shadow-2xl hover:shadow-brand-gold/10 transition-all hover:-translate-y-1"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} shadow-lg shadow-current/20`}>
                  <item.icon className="h-7 w-7 text-emerald-950" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-white/90 leading-relaxed text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-24 lg:py-32 border-t border-white/10">
        <div className="container px-4">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="font-display text-4xl font-extrabold tracking-tight mb-4 text-white">Latest Opportunities</h2>
            <p className="text-lg text-white/80 mb-8">Discover your next career move with top employers in Uganda.</p>
            <Link to="/jobs">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-2 border-white/20 hover:border-brand-gold/50 hover:bg-brand-gold/10 text-brand-gold transition-all">
                View all jobs <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {jobsLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
              </div>
            ) : (latestJobs || []).length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10">
                <p className="text-xl text-white/60">No job opportunities posted yet. Check back soon!</p>
              </div>
            ) : (
              (latestJobs || []).map((job: any, i: number) => (
                <JobCard key={job.id} job={job} index={i} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-700">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_-20%,#fff,transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
        </div>
        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">Ready to take the next step in your career?</h2>
            <p className="text-xl text-white/90 mb-10 max-w-xl mx-auto opacity-95">Join hundreds of BBUC graduates who have found meaningful employment through our platform.</p>
            <Link to="/login/graduate">
              <Button size="lg" className="h-16 px-10 text-xl font-bold gap-3 bg-brand-gold text-emerald-950 hover:bg-brand-gold/90 shadow-2xl transition-all hover:scale-105 active:scale-95">
                Go to Dashboard <ArrowRight className="h-6 w-6 text-emerald-950" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
