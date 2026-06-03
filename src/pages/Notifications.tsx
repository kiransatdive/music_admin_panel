import { useEffect, useState } from 'react';
import axios from 'axios';
import { Send, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  target: 'all' | 'artists' | 'admins';
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all' as 'all' | 'artists' | 'admins',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/admin/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/notifications', formData);
      setFormData({ title: '', message: '', target: 'all' });
      setShowCreateForm(false);
      fetchNotifications();
    } catch (error) {
      alert('Failed to send notification');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      alert('Failed to delete notification');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Send size={20} />
          Send Notification
        </button>
      </div>

      {showCreateForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Notification</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field"
                placeholder="Notification message"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                className="input-field"
              >
                <option value="all">All Users</option>
                <option value="artists">Artists Only</option>
                <option value="admins">Admins Only</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                Send
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No notifications sent</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden border border-gray-200 shadow-md">
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
                  <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Message</th>
                  <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Target</th>
                  <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Sent Date</th>
                  <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5 font-semibold text-gray-900">{notification.title}</td>
                    <td className="py-4 px-5 text-gray-700 max-w-md truncate" title={notification.message}>
                      {notification.message}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        notification.target === 'all'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : notification.target === 'artists'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {notification.target === 'all' ? 'All Users' : notification.target === 'artists' ? 'Artists Only' : 'Admins Only'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-sm">
                      {new Date(notification.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Delete Notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {Math.ceil(notifications.length / itemsPerPage) > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, notifications.length)}</span> of <span className="font-bold text-gray-900">{notifications.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(notifications.length / itemsPerPage) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors border ${
                        currentPage === idx + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(notifications.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(notifications.length / itemsPerPage)}
                  className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
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
