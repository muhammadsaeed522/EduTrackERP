import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { GraduationCap, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const teacherSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
});

const studentSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number required'),
  password: z.string().min(4, 'Min 4 characters'),
});

export default function LoginPage() {
  const [mode, setMode] = useState('teacher');
  const { teacherLogin, studentLogin, user, isStaff } = useAuth();
  const navigate = useNavigate();

  const teacherForm = useForm({ resolver: zodResolver(teacherSchema) });
  const studentForm = useForm({ resolver: zodResolver(studentSchema) });

  if (user) {
    navigate(isStaff ? '/dashboard' : '/portal', { replace: true });
  }

  const onTeacherSubmit = async (data) => {
    try {
      await teacherLogin(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const onStudentSubmit = async (data) => {
    try {
      await studentLogin(data.rollNumber, data.password);
      toast.success('Welcome!');
      navigate('/portal');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      <div className="w-full max-w-md card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">EduTrack ERP</h1>
          <p className="text-slate-500 text-sm mt-1">Smart Student Performance System</p>
        </div>

        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode('teacher')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'teacher' ? 'bg-white dark:bg-slate-900 shadow' : ''}`}
          >
            Teacher / Admin
          </button>
          <button
            type="button"
            onClick={() => setMode('student')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'student' ? 'bg-white dark:bg-slate-900 shadow' : ''}`}
          >
            Student
          </button>
        </div>

        {mode === 'teacher' ? (
          <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" {...teacherForm.register('email')} />
              {teacherForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{teacherForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" {...teacherForm.register('password')} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={teacherForm.formState.isSubmitting}>
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
            <div>
              <label className="label">Roll Number</label>
              <input className="input" {...studentForm.register('rollNumber')} placeholder="e.g. STU001" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" {...studentForm.register('password')} />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={studentForm.formState.isSubmitting}>
              <User className="w-4 h-4" />
              Student Login
            </button>
          </form>
        )}

        <p className="text-sm text-center text-slate-500 mt-6">
          No account?{' '}
          <Link to="/signup" className="text-primary-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-xs text-center text-amber-700 dark:text-amber-400 mt-3 px-2">
          Local mode: all data is stored in this browser only (localStorage). No server required.
        </p>

        <p className="text-xs text-center text-slate-500 mt-3">
          Demo: admin@edutrack.com / admin123 or STU001 / student123
        </p>
      </div>
    </div>
  );
}
