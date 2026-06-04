import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RoyaltyReport {
  id?: number;
  reportName?: string;
  mainLabel: string | null;
  subLabel: string | null;
  records: number;
  totalPlays: number | null;
  income: number | string;
  adminExp: number | string | null;
  royalty: number | string;
  month?: string | null;
  stream?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function Payments() {
  const [reports, setReports] = useState<RoyaltyReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/royalty-report');
      let fetchedData: RoyaltyReport[] = [];
      if (response.data && response.data.data) {
        fetchedData = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedData = response.data;
      }

      // Filter out duplicate reports based on unique combinations
      const uniqueReports = fetchedData.filter((report, index, self) =>
        index === self.findIndex((t) => (
          t.mainLabel === report.mainLabel &&
          t.subLabel === report.subLabel &&
          t.income === report.income &&
          t.records === report.records
        ))
      );

      setReports(uniqueReports);
    } catch (error) {
      console.error('Failed to fetch royalty reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Royalty Reports</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No royalty reports</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <div className="overflow-x-auto p-6">
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
                <th className="text-center py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report, idx) => (
                <tr key={report.id || idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
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
                  <td className="text-center py-3 px-4 text-gray-400 text-sm">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}
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
  );
}
