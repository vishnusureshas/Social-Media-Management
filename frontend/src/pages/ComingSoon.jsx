import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const ComingSoon = ({ title, description }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center animate-fade-up">
    <div className="glass-strong rounded-3xl p-10 max-w-md">
      <div className="mx-auto mb-6 flex h-16 w-16 animate-float items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 shadow-glow">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
      <Link to="/account" className="mt-6 inline-block">
        <Button variant="secondary" size="sm">
          Back to profile
        </Button>
      </Link>
    </div>
  </div>
);

export default ComingSoon;