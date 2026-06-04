import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Upload,
  DollarSign,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface PublicationStats {
  totalReports: number;
  totalRevenue: number;
}

interface MonthlyRevenueItem {
  month: string;
  amount: number;
}

interface FileReport {
  reportName: string;
  dateUploaded: string;
  fileIncome: string;
}

export default function MusicPublication() {
  const [stats, setStats] = useState<PublicationStats>({
    totalReports: 0,
    totalRevenue: 0
  });
  const [revenueData, setRevenueData] = useState<{ monthly: MonthlyRevenueItem[] }>({
    monthly: []
  });
  const [reports, setReports] = useState<FileReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Royalty Report Upload States (Moved from Payments)
  const royaltyFileInputRef = useRef<HTMLInputElement>(null);
  const [royaltyUploading, setRoyaltyUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<any[] | null>(null);
  const [uploadCurrentPage, setUploadCurrentPage] = useState(1);
  const uploadItemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summaryRes = await axios.get('/api/admin/report/summary');
      const summaryData = summaryRes.data?.data || { totalIncome: 0, totalReports: 0, files: [] };

      setStats({
        totalRevenue: summaryData.totalIncome || 0,
        totalReports: summaryData.totalReports || 0
      });

      // Group files by month for the chart
      const monthlyMap: { [key: string]: number } = {};
      (summaryData.files || []).forEach((file: any) => {
        const date = new Date(file.dateUploaded);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap[monthStr]) {
          monthlyMap[monthStr] = 0;
        }
        monthlyMap[monthStr] += parseFloat(file.fileIncome) || 0;
      });

      const monthlyData = Object.keys(monthlyMap).sort().map(monthStr => {
         return {
            month: monthStr,
            amount: monthlyMap[monthStr]
         };
      });

      setRevenueData({
        monthly: monthlyData
      });

      setReports(summaryData.files || []);
    } catch (error) {
      console.error('Failed to fetch summary data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoyaltyFileSelectAndUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRoyaltyUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/admin/royalty-report/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Show upload summary modal if data is returned
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setUploadSummary(response.data.data);
      } else {
        alert('Royalty report uploaded successfully');
      }
      fetchData(); // refresh data after upload
    } catch (error) {
      console.error(error);
      alert('Failed to upload royalty report');
    } finally {
      setRoyaltyUploading(false);
      if (royaltyFileInputRef.current) {
        royaltyFileInputRef.current.value = '';
      }
    }
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
        <div className="flex gap-2">
          <input
            type="file"
            ref={royaltyFileInputRef}
            className="hidden"
            accept=".csv,.xlsx"
            onChange={handleRoyaltyFileSelectAndUpload}
          />
          <button
            onClick={() => royaltyFileInputRef.current?.click()}
            disabled={royaltyUploading}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Upload size={20} />
            {royaltyUploading ? 'Uploading...' : 'Upload Reports'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Income</p>
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
      </div>

      {loading ? (
        <div className="text-center py-12">Loading data...</div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Monthly Trend Chart */}
            <div className="card w-full">
              <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
              {revenueData.monthly.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No monthly data available. Upload a report to see details.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData.monthly} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00aeef" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00aeef" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={formatMonth} 
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
                      itemStyle={{ color: '#00aeef' }}
                      formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone"
                      dataKey="amount" 
                      stroke="#00aeef" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#chartGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Uploaded Reports List */}
            <div className="card w-full">
              <h2 className="text-xl font-semibold mb-4">Uploaded Reports</h2>
              {reports.length === 0 ? (
                <div className="py-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                  <Calendar className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                  <p>No reports uploaded yet.</p>
                </div>
              ) : (
                <div className="card overflow-x-auto p-0">
                  <div className="overflow-x-auto p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-sm">
                          <th className="text-left py-3 px-4 font-semibold">File Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Upload Date</th>
                          <th className="text-right py-3 px-4 font-semibold">Income</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report, idx) => (
                          <tr key={idx} className="border-b border-gray-850 hover:bg-gray-800/30 transition-colors text-sm">
                            <td className="py-3.5 px-4 text-gray-300 max-w-[200px] truncate" title={report.reportName}>
                              {report.reportName}
                            </td>
                            <td className="py-3.5 px-4 text-gray-400">
                              {new Date(report.dateUploaded).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                              ${parseFloat(report.fileIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Controls */}
                  {reports.length > 0 && (
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

      {/* Upload Summary Modal (Moved from Payments) */}
      {uploadSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl border border-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">Royalty Upload Summary</h2>
                <p className="text-sm text-gray-400 mt-1">Successfully imported {uploadSummary.length} records</p>
              </div>
              <button 
                onClick={() => {
                  setUploadSummary(null);
                  setUploadCurrentPage(1);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Main Label</th>
                    <th className="text-left py-3 px-4">Sub Label</th>
                    <th className="text-left py-3 px-4">Month</th>
                    <th className="text-right py-3 px-4">Records</th>
                    <th className="text-right py-3 px-4">Total Plays</th>
                    <th className="text-right py-3 px-4">Streams</th>
                    <th className="text-right py-3 px-4">Income</th>
                    <th className="text-right py-3 px-4">Admin Exp</th>
                    <th className="text-right py-3 px-4">Royalty</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadSummary
                    .slice((uploadCurrentPage - 1) * uploadItemsPerPage, uploadCurrentPage * uploadItemsPerPage)
                    .map((report, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4">{report.mainLabel || '-'}</td>
                      <td className="py-3 px-4">{report.subLabel || '-'}</td>
                      <td className="py-3 px-4">{report.month || '-'}</td>
                      <td className="text-right py-3 px-4">{report.records}</td>
                      <td className="text-right py-3 px-4">{report.totalPlays ?? '-'}</td>
                      <td className="text-right py-3 px-4">{report.stream ?? '-'}</td>
                      <td className="text-right py-3 px-4 font-medium text-emerald-500">
                        ${parseFloat(String(report.income)).toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 text-rose-500">
                        ${report.adminExp ? parseFloat(String(report.adminExp)).toFixed(2) : '0.00'}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-emerald-400">
                        ${parseFloat(String(report.royalty)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for Upload Summary */}
            {Math.ceil(uploadSummary.length / uploadItemsPerPage) > 1 && (
              <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-300">{(uploadCurrentPage - 1) * uploadItemsPerPage + 1}</span> to <span className="font-bold text-gray-300">{Math.min(uploadCurrentPage * uploadItemsPerPage, uploadSummary.length)}</span> of <span className="font-bold text-gray-300">{uploadSummary.length}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUploadCurrentPage(p => Math.max(1, p - 1))}
                    disabled={uploadCurrentPage === 1}
                    className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-400 font-medium px-2">
                      Page {uploadCurrentPage} of {Math.ceil(uploadSummary.length / uploadItemsPerPage)}
                    </span>
                  </div>
                  <button
                    onClick={() => setUploadCurrentPage(p => Math.min(Math.ceil(uploadSummary.length / uploadItemsPerPage), p + 1))}
                    disabled={uploadCurrentPage === Math.ceil(uploadSummary.length / uploadItemsPerPage)}
                    className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-6 border-t border-gray-800 flex justify-end">
              <button 
                onClick={() => {
                  setUploadSummary(null);
                  setUploadCurrentPage(1);
                }}
                className="btn-primary px-6 py-2"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
