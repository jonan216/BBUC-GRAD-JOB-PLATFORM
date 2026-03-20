import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-white/10 bg-transparent">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" className="h-8 w-8 object-contain" alt="UCU Logo" />
            <span className="font-display font-bold text-white">BBUC GRADUATES JOB PLATFORM</span>
          </div>
          <p className="text-sm text-white/70">The official bridge between Bishop Barham University College excellence and Uganda's leading employers.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm text-white">For Graduates</h4>
          <div className="flex flex-col gap-2 text-sm text-white/60">
            <Link to="/register/graduate" className="transition-expo hover:text-white">Register</Link>
            <Link to="/jobs" className="transition-expo hover:text-white">Browse Jobs</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm text-white">For Employers</h4>
          <div className="flex flex-col gap-2 text-sm text-white/60">
            <Link to="/register/employer" className="transition-expo hover:text-white">Register Company</Link>
            <Link to="/login" className="transition-expo hover:text-white">Post a Job</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm text-white">Platform</h4>
          <div className="flex flex-col gap-2 text-sm text-white/60">
            <Link to="/login" className="transition-expo hover:text-white">Login</Link>
            <span>Contact: info@bbuc.ac.ug</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Bishop Barham University College. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
