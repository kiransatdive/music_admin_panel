import { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
  streams: number; // Represents live releases uploaded
}

export default function Revenue() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [totalRoyalty, setTotalRoyalty] = useState(0);
  const [liveReleasesCount, setLiveReleasesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const analyticsRes = await axios.get('/api/admin/royalty-report/analytics').catch(() => ({ 
        data: { data: { totalRoyalty: 0, liveReleasesCount: 0, monthwiseRevenue: [], monthwiseLiveReleases: [] } } 
      }));
      
      const analyticsData = analyticsRes.data?.data || {};
      setTotalRoyalty(analyticsData.totalRoyalty || 0);
      setLiveReleasesCount(analyticsData.liveReleasesCount || 0);

      const revenueData = analyticsData.monthwiseRevenue || [];
      const streamsData = analyticsData.monthwiseLiveReleases || [];

      const mergedDataMap: { [key: string]: RevenueData } = {};

      revenueData.forEach((item: any) => {
        const month = item.month || 'Unknown';
        if (!mergedDataMap[month]) {
          mergedDataMap[month] = { month, revenue: 0, streams: 0 };
        }
        mergedDataMap[month].revenue += parseFloat(item.revenue) || 0;
      });

      streamsData.forEach((item: any) => {
        const month = item.month || 'Unknown';
        if (!mergedDataMap[month]) {
          mergedDataMap[month] = { month, revenue: 0, streams: 0 };
        }
        mergedDataMap[month].streams += parseInt(item.count, 10) || 0;
      });

      const mergedDataArray = Object.values(mergedDataMap).sort((a, b) => a.month.localeCompare(b.month));

      setData(mergedDataArray);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch revenue data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Revenue Analytics</h1>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <p className="text-gray-400 text-sm mb-2">Total Platform Revenue</p>
              <p className="text-4xl font-bold text-primary">${(totalRoyalty || 0).toFixed(2)}</p>
            </div>

            <div className="card">
              <p className="text-gray-400 text-sm mb-2">Total Live Releases</p>
              <p className="text-4xl font-bold text-secondary">{(liveReleasesCount || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00aeef" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00aeef" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
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
                    dataKey="revenue"
                    stroke="#00aeef"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card overflow-x-auto p-0">
            <div className="p-6 pb-4">
              <h2 className="text-xl font-semibold">Monthly Breakdown</h2>
            </div>
            <div className="overflow-x-auto px-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Month</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Live Streams Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {(data || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4">{item.month}</td>
                      <td className="text-right py-3 px-4 text-primary font-semibold">
                        ${(item.revenue || 0).toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 text-secondary">
                        {(item.streams || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {Math.ceil((data || []).length / itemsPerPage) > 1 && (
              <div className="flex items-center justify-between border-t border-gray-700/50 px-6 py-4 mt-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-300">{Math.min(currentPage * itemsPerPage, data.length)}</span> of <span className="font-bold text-gray-300">{data.length}</span> entries
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
                    {Array.from({ length: Math.ceil(data.length / itemsPerPage) }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors border ${
                          currentPage === idx + 1
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(data.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
                    className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
