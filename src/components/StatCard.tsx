import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}

const StatCard = ({ label, value, icon: Icon, accent }: StatCardProps) => (
  <div className={cn(
    "rounded-xl border p-5 transition-all hover:shadow-lg",
    accent 
      ? "border-brand-gold/40 bg-brand-gold/15 text-white shadow-brand-gold/10" 
      : "border-emerald-700/30 bg-emerald-800/20 text-white backdrop-blur-md shadow-lg"
  )}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</span>
      <Icon className={cn("h-4 w-4", accent ? "text-brand-gold" : "text-white/40")} />
    </div>
    <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
  </div>
);

export default StatCard;
