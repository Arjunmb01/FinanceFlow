import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, User, UserPlus, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupProps {
  role?: 'viewer' | 'analyst' | 'admin';
}

export function Signup({ role = 'viewer' }: SignupProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const theme = {
    viewer: {
      bg: 'bg-viewer-100/50',
      text: 'text-viewer-600',
      btn: 'from-viewer-600 to-indigo-600 hover:from-viewer-500 hover:to-indigo-500 hover:shadow-viewer-200',
      alertBg: 'bg-viewer-50/80',
      alertBorder: 'border-viewer-100',
      alertColor: 'text-viewer-700'
    },
    analyst: {
      bg: 'bg-analyst-100/50',
      text: 'text-analyst-600',
      btn: 'from-analyst-600 to-teal-600 hover:from-analyst-500 hover:to-teal-500 hover:shadow-analyst-200',
      alertBg: 'bg-emerald-50/80',
      alertBorder: 'border-emerald-100',
      alertColor: 'text-emerald-700'
    },
    admin: {
      bg: 'bg-admin-100/50',
      text: 'text-admin-600',
      btn: 'from-admin-600 to-orange-600 hover:from-admin-500 hover:to-orange-500 hover:shadow-admin-200',
      alertBg: 'bg-admin-50/80',
      alertBorder: 'border-admin-100',
      alertColor: 'text-admin-700'
    }
  }[role];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: role,
      });

      login(response.data.user, response.data.accessToken);
      
      const targetPath = {
        viewer: '/',
        analyst: '/analyst',
        admin: '/admin'
      }[role];
      
      navigate(targetPath);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 relative overflow-hidden">
      <div className={`fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full ${theme.bg} blur-3xl pointer-events-none`} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
      
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white p-8 relative z-10">
        <div className="text-center mb-8">
          <div className={`inline-flex p-3 rounded-2xl ${theme.bg} ${theme.text} mb-4`}>
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className={`text-3xl font-extrabold bg-gradient-to-r ${theme.btn.split(' ').slice(0, 2).join(' ')} bg-clip-text text-transparent mb-2`}>
            {role.charAt(0).toUpperCase() + role.slice(1)} Registration
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">Join FinanceFlow Today</p>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-2xl ${theme.alertBg} border ${theme.alertBorder} flex items-center gap-3 ${theme.alertColor} animate-in fade-in slide-in-from-top-4 duration-300`}>
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('fullName')}
                type="text" 
                className={`w-full pl-12 pr-5 py-3.5 bg-white/50 border ${errors.fullName ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-viewer-100 focus:border-viewer-400'} rounded-2xl outline-none transition-all font-medium`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && <p className="text-xs font-medium text-red-500 ml-1">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('email')}
                type="email" 
                className={`w-full pl-12 pr-5 py-3.5 bg-white/50 border ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-viewer-100 focus:border-viewer-400'} rounded-2xl outline-none transition-all font-medium`}
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
                type={showPassword ? "text" : "password"} 
                className={`w-full pl-12 pr-12 py-3.5 bg-white/50 border ${errors.password ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-viewer-100 focus:border-viewer-400'} rounded-2xl outline-none transition-all font-medium`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center group"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 transition-transform group-active:scale-95" />
                ) : (
                  <Eye className="w-5 h-5 transition-transform group-active:scale-95" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('confirmPassword')}
                type={showConfirmPassword ? "text" : "password"} 
                className={`w-full pl-12 pr-12 py-3.5 bg-white/50 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-viewer-100 focus:border-viewer-400'} rounded-2xl outline-none transition-all font-medium`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center group"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 transition-transform group-active:scale-95" />
                ) : (
                  <Eye className="w-5 h-5 transition-transform group-active:scale-95" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs font-medium text-red-500 ml-1">{errors.confirmPassword.message}</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-viewer-600 to-indigo-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-viewer-100/50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-viewer-600 hover:opacity-80 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
