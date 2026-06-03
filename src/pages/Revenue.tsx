import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  streams: number;
}

export default function Revenue() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalStreams, setTotalStreams] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await axios.get('/api/admin/revenue');
      setData(response.data.monthly);
      setTotalRevenue(response.data.totalRevenue);
      setTotalStreams(response.data.totalStreams);
    } catch (error) {
      console.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Platform Revenue Analytics</h1>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <p className="text-gray-400 text-sm mb-2">Total Platform Revenue</p>
              <p className="text-4xl font-bold text-primary">${(totalRevenue || 0).toFixed(2)}</p>
            </div>

            <div className="card">
              <p className="text-gray-400 text-sm mb-2">Total Streams</p>
              <p className="text-4xl font-bold text-secondary">{(totalStreams || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Month</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Streams</th>
                  </tr>
                </thead>
                <tbody>
                  {(data || []).map((item, index) => (
                    <tr key={index} className="border-b border-gray-800">
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
          </div>
        </>
      )}
    </div>
  );
}
