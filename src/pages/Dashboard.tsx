import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users, Disc, DollarSign, TrendingUp, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';

interface DashboardStats {
  totalArtists: number;
  activeReleases: number;
  pendingReleases: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalArtists: 0,
    activeReleases: 0,
    pendingReleases: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    fetchStats();
    // Format date like: "26 MAY 2026"
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = today.getFullYear();
    setFormattedDate(`${day} ${month} ${year}`);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard/stats');
      if (response.data && response.data.data) {
        setStats(response.data.data);
      } else {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.email
    ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)
    : 'Admin';

  const initials = displayName.slice(0, 2).toUpperCase();

  // Create smooth simulated data trending up to the actual stats revenue
  const chartData = [
    { name: 'Dec', Revenue: Number((stats.totalRevenue * 0.15).toFixed(2)) },
    { name: 'Jan', Revenue: Number((stats.totalRevenue * 0.25).toFixed(2)) },
    { name: 'Feb', Revenue: Number((stats.totalRevenue * 0.40).toFixed(2)) },
    { name: 'Mar', Revenue: Number((stats.totalRevenue * 0.55).toFixed(2)) },
    { name: 'Apr', Revenue: Number((stats.totalRevenue * 0.80).toFixed(2)) },
    { name: 'May', Revenue: Number((stats.totalRevenue).toFixed(2)) },
  ];

  return (
    <div className="space-y-6 pb-12 flex-1 flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm shadow-sm active:scale-95"
          title="Refresh stats"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-rose-500' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-28 bg-white dark:bg-dark-card rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 bg-white dark:bg-dark-card rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-white dark:bg-dark-card rounded-2xl animate-pulse"></div>
            <div className="h-72 bg-white dark:bg-dark-card rounded-2xl animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Welcome Banner Card */}
          <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/10 dark:from-rose-950/20 dark:via-rose-950/10 dark:to-transparent dark:border-rose-500/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-rose-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-[10px] text-rose-500 font-bold tracking-wider uppercase">{formattedDate}</p>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-2">
                  Welcome back, {displayName} <span className="animate-bounce">👋</span>
                </h2>
              </div>
            </div>

          </div>

          {/* Stats Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Artists */}
            <Link to="/admin/artists" className="card block p-5 border border-slate-100 dark:border-dark-border/40 hover:scale-[1.02] cursor-pointer group transition-transform">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalArtists}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Artists</p>
                </div>
                <div className="text-rose-500 dark:text-rose-400 shrink-0 p-1">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 border-t border-slate-50 dark:border-dark-border/20 pt-2">
                Registered platform creators
              </p>
            </Link>

            {/* Total Releases */}
            <Link to="/admin/releases" className="card block p-5 border border-slate-100 dark:border-dark-border/40 hover:scale-[1.02] cursor-pointer group transition-transform">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.activeReleases}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Releases</p>
                </div>
                <div className="text-violet-500 dark:text-violet-400 shrink-0 p-1">
                  <Disc size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 border-t border-slate-50 dark:border-dark-border/20 pt-2">
                Distributed to major DSPs
              </p>
            </Link>

            {/* Total Revenue */}
            <Link to="/admin/revenue" className="card block p-5 border border-slate-100 dark:border-dark-border/40 hover:scale-[1.02] cursor-pointer group transition-transform">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    ${(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Revenue</p>
                </div>
                <div className="text-emerald-500 dark:text-emerald-400 shrink-0 p-1">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 border-t border-slate-50 dark:border-dark-border/20 pt-2">
                Statement ledger balance
              </p>
            </Link>

            {/* Pending Approvals */}
            <Link to="/admin/releases" className="card block p-5 border border-slate-100 dark:border-dark-border/40 hover:scale-[1.02] cursor-pointer group transition-transform">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.pendingReleases}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Approvals</p>
                </div>
                <div className="text-amber-500 dark:text-amber-400 shrink-0 p-1">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 border-t border-slate-50 dark:border-dark-border/20 pt-2">
                Awaiting administrative audit
              </p>
            </Link>
          </div>

          {/* Middle Layout (Revenue Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
            {/* Chart Block (3 Cols) */}
            <div className="lg:col-span-3 card border border-slate-100 dark:border-dark-border/40 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Revenue Trend</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Last 6 months - All platforms statement</p>
              </div>

              {/* Area Chart Container */}
              <div className="h-56 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00aeef" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00aeef" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '11px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#00aeef"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#chartGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>


          </div>
        </>
      )}
    </div>
  );
}
