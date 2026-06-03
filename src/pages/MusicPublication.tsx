import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Upload,
  Trash2,
  CheckCircle2,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface PublicationStats {
  totalReports: number;
  pendingReports: number;
  totalRevenue: number;
}

interface RevenueItem {
  platform: string;
  amount: number;
}

interface MonthlyRevenueItem {
  month: string;
  amount: number;
}

interface PublicationReport {
  id: number;
  report_file: string;
  upload_date: string;
  month: string;
  year: number;
  status: 'draft' | 'published' | 'retracted';
  created_at: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function MusicPublication() {
  const [stats, setStats] = useState<PublicationStats>({
    totalReports: 0,
    pendingReports: 0,
    totalRevenue: 0
  });
  const [revenueData, setRevenueData] = useState<{ platform: RevenueItem[]; monthly: MonthlyRevenueItem[] }>({
    platform: [],
    monthly: []
  });
  const [reports, setReports] = useState<PublicationReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMonth, setUploadMonth] = useState<number>(new Date().getMonth() + 1);
  const [uploadYear, setUploadYear] = useState<number>(new Date().getFullYear());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, reportsRes] = await Promise.all([
        axios.get('/api/admin/music-publication/stats'),
        axios.get('/api/admin/music-publication/revenue'),
        axios.get('/api/admin/music-publication/reports')
      ]);

      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Failed to fetch music publishing data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a CSV or report file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('month', uploadMonth.toString());
    formData.append('year', uploadYear.toString());

    try {
      await axios.post('/api/admin/music-publication/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Publishing report uploaded and processed successfully');
      setSelectedFile(null);
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to upload publishing report');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await axios.post(`/api/admin/music-publication/reports/${id}/publish`);
      alert('Report published successfully');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to publish report');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report? This will remove all associated revenue records.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/music-publication/reports/${id}`);
      alert('Report deleted successfully');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to delete report');
    }
  };

  const getFileName = (path: string) => {
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  const formatMonth = (monthStr: string) => {
    if (!monthStr) return 'N/A';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Music Publishing Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage publishing revenue, track claims, and upload mechanical/performance reports.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Publishing Revenue</p>
              <p className="text-3xl font-bold text-emerald-500 mt-1">
                ${(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Reports Uploaded</p>
              <p className="text-3xl font-bold mt-1">{stats.totalReports}</p>
            </div>
            <FileText className="h-10 w-10 text-indigo-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Draft Reports</p>
              <p className="text-3xl font-bold text-amber-500 mt-1">{stats.pendingReports}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-amber-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading publishing data...</div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="card lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Monthly Publishing Revenue</h2>
              {revenueData.monthly.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No monthly data available. Upload a report to see details.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.375rem' }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                      itemStyle={{ color: '#f3f4f6' }}
                      formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']}
                    />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Platform / Source Breakdown */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Revenue by Source</h2>
              {revenueData.platform.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No platform data available.
                </div>
              ) : (
                <div className="flex flex-col justify-between h-64">
                  <div className="flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={revenueData.platform}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="amount"
                          nameKey="platform"
                        >
                          {revenueData.platform.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.375rem' }}
                          itemStyle={{ color: '#f3f4f6' }}
                          formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Amount']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend list */}
                  <div className="mt-4 space-y-1.5 overflow-y-auto max-h-24 pr-1">
                    {revenueData.platform.map((item, index) => (
                      <div key={item.platform} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-gray-300 truncate">{item.platform}</span>
                        </div>
                        <span className="font-semibold text-white ml-2 shrink-0">
                          ${(item.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Report Section */}
            <div className="card h-fit">
              <h2 className="text-xl font-semibold mb-4">Upload Publishing Report</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-medium">Reporting Period</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        value={uploadMonth}
                        onChange={(e) => setUploadMonth(parseInt(e.target.value))}
                        className="input-field w-full"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={uploadYear}
                        onChange={(e) => setUploadYear(parseInt(e.target.value))}
                        className="input-field w-full"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-medium">Report File (CSV)</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                    <span className="text-xs text-gray-400 block">
                      {selectedFile ? selectedFile.name : 'Select or drag CSV file here'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
                >
                  {uploading ? 'Processing...' : 'Upload & Process'}
                </button>
              </form>

              {/* CSV Schema help */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-900/50 border border-blue-100 dark:border-gray-800 rounded-lg text-xs text-blue-800 dark:text-gray-400">
                <div className="flex gap-2 font-semibold text-blue-900 dark:text-gray-300 mb-1">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>Expected CSV Headers</span>
                </div>
                <p className="mb-2 text-blue-700 dark:text-gray-400">Your CSV file should contain columns representing sources and earnings. For example:</p>
                <code className="block bg-white dark:bg-gray-950 border border-blue-100 dark:border-gray-800 p-2 rounded text-blue-900 dark:text-white font-mono text-[10px] select-all">
                  platform,amount<br />
                  YouTube Publishing,450.50<br />
                  Mechanical Royalties,210.00
                </code>
              </div>
            </div>

            {/* Uploaded Reports List */}
            <div className="card lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Uploaded Reports</h2>
              {reports.length === 0 ? (
                <div className="py-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                  <Calendar className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                  <p>No reports uploaded yet.</p>
                  <p className="text-sm text-gray-600 mt-1">Upload a CSV report to populate publishing data.</p>
                </div>
              ) : (
                <div className="card overflow-x-auto p-0">
                  <div className="overflow-x-auto p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-sm">
                          <th className="text-left py-3 px-4 font-semibold">Reporting Month</th>
                          <th className="text-left py-3 px-4 font-semibold">File Name</th>
                          <th className="text-center py-3 px-4 font-semibold">Status</th>
                          <th className="text-center py-3 px-4 font-semibold">Upload Date</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report) => (
                          <tr key={report.id} className="border-b border-gray-850 hover:bg-gray-800/30 transition-colors text-sm">
                            <td className="py-3.5 px-4 font-medium">{formatMonth(report.month)}</td>
                            <td className="py-3.5 px-4 text-gray-300 max-w-[150px] truncate" title={getFileName(report.report_file)}>
                              {getFileName(report.report_file)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${report.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center text-gray-400">
                              {new Date(report.upload_date).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {report.status === 'draft' && (
                                  <button
                                    onClick={() => handlePublish(report.id)}
                                    className="text-emerald-400 hover:text-emerald-300 p-1 transition-colors"
                                    title="Publish Report"
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(report.id)}
                                  className="text-rose-400 hover:text-rose-300 p-1 transition-colors"
                                  title="Delete Report"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Controls */}
                  {Math.ceil(reports.length / itemsPerPage) > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-700/50 px-6 py-4">
                      <div className="text-sm text-gray-500">
                        Showing <span className="font-bold text-gray-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-300">{Math.min(currentPage * itemsPerPage, reports.length)}</span> of <span className="font-bold text-gray-300">{reports.length}</span> entries
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} /> Prev
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.ceil(reports.length / itemsPerPage) }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentPage(idx + 1)}
                              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors border ${currentPage === idx + 1
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                                }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(reports.length / itemsPerPage), p + 1))}
                          disabled={currentPage === Math.ceil(reports.length / itemsPerPage)}
                          className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
