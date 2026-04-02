import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldAlert, UserPlus, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupProps {
  role: 'viewer' | 'analyst' | 'admin';
}

export function Signup({ role }: SignupProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const theme = {
    viewer: {
      bg: 'bg-viewer-100/50',
      text: 'text-viewer-600',
      btn: 'from-viewer-600 to-indigo-600 hover:from-viewer-500 hover:to-indigo-500 hover:shadow-viewer-200',
      ring: 'focus:ring-viewer-100 focus:border-viewer-400',
    },
    analyst: {
      bg: 'bg-analyst-100/50',
      text: 'text-analyst-600',
      btn: 'from-analyst-600 to-emerald-600 hover:from-analyst-500 hover:to-emerald-500 hover:shadow-analyst-200',
      ring: 'focus:ring-analyst-100 focus:border-analyst-400',
    },
    admin: {
      bg: 'bg-admin-100/50',
      text: 'text-admin-600',
      btn: 'from-admin-600 to-amber-600 hover:from-admin-500 hover:to-amber-500 hover:shadow-admin-200',
      ring: 'focus:ring-admin-100 focus:border-admin-400',
    }
  }[role];

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: role
      });
      login(response.data.user, response.data.accessToken);
      
      const targetPath = {
        viewer: '/',
        analyst: '/analyst',
        admin: '/admin'
      }[role];

      navigate(targetPath);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 relative overflow-hidden">
      <div className={`fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full ${theme.bg} blur-3xl pointer-events-none`} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
      
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white p-8 relative z-10">
        <div className="text-center mb-8">
          <div className={`inline-flex p-3 rounded-2xl ${theme.bg} ${theme.text} mb-4`}>
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className={`text-3xl font-extrabold bg-gradient-to-r ${theme.btn.split(' ').slice(0, 2).join(' ')} bg-clip-text text-transparent mb-2`}>
            {role.charAt(0).toUpperCase() + role.slice(1)} Registration
          </h1>
          <p className="text-gray-500 font-medium">Join FinanceFlow today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-100 flex items-center gap-3 text-red-700">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('name')}
                type="text" 
                className={`w-full pl-12 pr-5 py-3.5 bg-white/50 border ${errors.name ? 'border-red-300 focus:ring-red-100' : `border-gray-200 ${theme.ring}`} rounded-2xl outline-none transition-all`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-xs font-medium text-red-500 ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('email')}
                type="email" 
                className={`w-full pl-12 pr-5 py-3.5 bg-white/50 border ${errors.email ? 'border-red-300 focus:ring-red-100' : `border-gray-200 ${theme.ring}`} rounded-2xl outline-none transition-all`}
                placeholder="email@example.com"
              />
            </div>
            {errors.email && <p className="text-xs font-medium text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('password')}
                type="password" 
                className={`w-full pl-12 pr-5 py-3.5 bg-white/50 border ${errors.password ? 'border-red-300 focus:ring-red-100' : `border-gray-200 ${theme.ring}`} rounded-2xl outline-none transition-all`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('confirmPassword')}
                type="password" 
                className={`w-full pl-12 pr-5 py-3.5 bg-white/50 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-100' : `border-gray-200 ${theme.ring}`} rounded-2xl outline-none transition-all`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="text-xs font-medium text-red-500 ml-1">{errors.confirmPassword.message}</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold text-lg bg-gradient-to-r ${theme.btn} active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to={role === 'viewer' ? '/login' : `/${role}/login`} className={`${theme.text} hover:opacity-80 font-bold decoration-2 underline-offset-4 hover:underline transition-all`}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
