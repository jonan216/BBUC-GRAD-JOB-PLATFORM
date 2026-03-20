import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  onClick?: () => void;
  active?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  userName: string;
  userRole: string;
}

const DashboardLayout = ({ children, title, navItems, userName, userRole }: DashboardLayoutProps) => {
  const location = useLocation();
  const isAdmin = userRole === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={cn(
        "hidden w-64 border-r lg:block font-body",
        isAdmin ? "bg-emerald-900 text-white border-white/10 shadow-2xl" : "bg-card border-border"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b px-6 border-current/10">
              <img src="/logo.png" className="h-8 w-8 object-contain" alt="UCU Logo" />
            <span className={cn("font-display font-medium text-xs", isAdmin ? "text-white" : "text-foreground")}>BBUC GRADUATES JOB PLATFORM</span>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = item.active !== undefined ? item.active : location.pathname === item.href;
              const content = (
                <>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </>
              );
              const className = cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-expo",
                isActive 
                  ? "bg-brand-gold text-emerald-950 shadow-lg shadow-brand-gold/20" 
                  : isAdmin ? "text-white/60 hover:bg-white/5 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              );

              if (item.onClick) {
                return (
                  <button key={item.label} onClick={item.onClick} className={className}>
                    {content}
                  </button>
                );
              }

              return (
                <Link key={item.href} to={item.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="mb-2">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Button 
              onClick={handleLogout}
              className="w-full justify-start gap-2 bg-white text-emerald-600 border border-emerald-600/20 hover:bg-emerald-50 shadow-sm font-medium"
            >
              <LogOut className="h-4 w-4" />Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={cn("flex-1", isAdmin ? "bg-[#052e16] text-white" : "bg-background")}>
        <header className={cn("flex h-16 items-center border-b px-6 lg:px-8", isAdmin ? "bg-emerald-900/50 border-white/10 backdrop-blur-md" : "border-border")}>
          <h1 className="font-display text-lg font-bold tracking-tight">{title}</h1>
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
