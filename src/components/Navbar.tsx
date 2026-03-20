import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 border-b transition-all duration-300",
      isLanding ? "bg-black/20 border-white/10 backdrop-blur-md text-white" : "bg-card/95 border-b backdrop-blur supports-[backdrop-filter]:bg-card/80"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" className="h-9 w-9 object-contain" alt="UCU Logo" />
          <span className="font-display text-lg font-bold tracking-tight">BBUC GRADUATES JOB PLATFORM</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/jobs" className={cn("text-sm font-medium transition-expo", isLanding ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground")}>
            Browse Jobs
          </Link>
          {user ? (
            <>
              <Link to={`/dashboard/${user.role}`}>
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button size="sm" className="bg-white text-emerald-600 border border-emerald-600/20 hover:bg-emerald-50 shadow-sm" onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className={isLanding ? "text-white hover:bg-white/10" : ""}>Log in</Button>
              </Link>
              <Link to="/register/graduate">
                <Button size="sm" className={isLanding ? "bg-brand-gold text-emerald-950 hover:bg-brand-gold/90 shadow-lg shadow-brand-gold/20" : ""}>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/jobs" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Browse Jobs</Link>
            {user ? (
              <>
                <Link to={`/dashboard/${user.role}`} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">Dashboard</Button>
                </Link>
                <Button size="sm" className="w-full justify-start bg-white text-emerald-600 border border-emerald-600/20 hover:bg-emerald-50 shadow-sm font-medium" onClick={handleLogout}>Log out</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">Log in</Button>
                </Link>
                <Link to="/register/graduate" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
