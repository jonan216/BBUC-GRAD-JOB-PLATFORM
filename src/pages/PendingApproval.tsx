import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PendingApproval = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-brand-gold animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight">Account Pending</h1>
            <p className="text-muted-foreground italic">"Patience is the key to paradise."</p>
          </div>
          
          <div className="bg-card border rounded-xl p-6 text-left space-y-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm">Your registration details have been received successfully.</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm">BBUC Admin has been notified of your new account request.</p>
            </div>
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <p className="text-sm">Please allow 24-48 hours for our team to verify your information.</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            You will be able to log in once your account has been approved. You'll receive no notification, so please check back soon!
          </p>

          <div className="pt-4">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">Return to Home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PendingApproval;
