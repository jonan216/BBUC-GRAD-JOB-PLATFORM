import { Job } from '@/lib/types';
import { MapPin, Building2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: Job;
  index?: number;
}

const JobCard = ({ job, index = 0 }: JobCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    <Link to={`/jobs/${job.id}`} className="block">
      <div className="rounded-lg border bg-card p-6 transition-expo hover:border-primary">
        <div className="mb-3">
          <h3 className="font-display text-lg font-semibold tracking-tight">{job.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company_name}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
          </div>
        </div>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {job.requirements.slice(0, 3).map((req) => (
              <Badge key={req} variant="secondary" className="text-xs font-normal">{req}</Badge>
            ))}
            {job.requirements.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">+{job.requirements.length - 3}</Badge>
            )}
          </div>
          {job.salary_range && (
            <span className="text-xs font-medium text-muted-foreground">{job.salary_range}</span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

export default JobCard;
