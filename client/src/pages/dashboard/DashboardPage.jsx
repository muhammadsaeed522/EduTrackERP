import { useEffect, useState } from 'react';
import { Users, TrendingUp, Home, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/dashboard')
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-slate-500 text-sm">Overview of student performance & discipline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} />
        <StatCard title="Top Performer" value={stats?.topStudents?.[0]?.fullName || '—'} subtitle={`Score: ${stats?.topStudents?.[0]?.finalScore || 0}`} icon={TrendingUp} color="green" />
        <StatCard title="Houses" value={stats?.houseRankings?.length || 0} icon={Home} color="amber" />
        <StatCard title="Leading House" value={stats?.houseRankings?.[0]?.name || '—'} subtitle={`${stats?.houseRankings?.[0]?.totalPoints || 0} pts`} icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Attendance Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats?.attendanceTrend || []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Discipline Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats?.disciplineTrend || []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Students</h3>
          <div className="space-y-2">
            {stats?.topStudents?.map((s, i) => (
              <Link key={s._id} to={`/students/${s._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600">{i + 1}</span>
                  <span>
                    <p className="font-medium">{s.fullName}</p>
                    <p className="text-xs text-slate-500">{s.rollNumber} · {s.class}</p>
                  </span>
                </span>
                <span className="font-bold text-primary-600">{s.finalScore}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Students Needing Attention</h3>
          <div className="space-y-2">
            {stats?.weakStudents?.map((s) => (
              <Link key={s._id} to={`/students/${s._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <span>
                  <p className="font-medium">{s.fullName}</p>
                  <p className="text-xs text-slate-500">{s.rollNumber}</p>
                </span>
                <span className="font-bold text-red-500">{s.finalScore}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {stats?.classDistribution?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Students by Class</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.classDistribution.map((c) => ({ name: c._id, count: c.count }))}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
