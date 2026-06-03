import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/5 dark:bg-rose-500/3 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/5 dark:bg-violet-500/3 blur-3xl pointer-events-none"></div>

      <div className="card w-full max-w-md p-8 shadow-soft-lg dark:shadow-soft-dark border border-slate-100 dark:border-dark-border/40 relative z-10">
        {/* Branding Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/LOGOMusic.png"
            alt="Shivam Music Group Logo"
            className="h-14 w-auto object-contain mb-3 drop-shadow-sm"
          />
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-rose-500">
            Admin Workspace
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Access secure admin control panel
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl mb-6 text-sm font-medium animate-pulse-soft">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="admin@shivam.com"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full py-3 mt-4 text-sm tracking-wide uppercase font-bold">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
