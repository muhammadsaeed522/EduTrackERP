import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { GraduationCap, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['teacher', 'admin']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'teacher' },
  });

  if (user) {
    navigate('/dashboard', { replace: true });
  }

  const onSubmit = async (data) => {
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      toast.success('Account created! Data is saved on this device only.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      <div className="w-full max-w-md card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">EduTrack — local storage only</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" {...register('role')}>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input className="input" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={isSubmitting}>
            <UserPlus className="w-4 h-4" />
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-xs text-center text-slate-400 mt-4">
          Demo: admin@edutrack.com / admin123
        </p>
      </div>
    </div>
  );
}
