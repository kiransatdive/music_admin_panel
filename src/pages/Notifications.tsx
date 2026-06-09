import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Check, Trash2, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchNotifications();
    setSelectedIds([]);
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/notifications', {
        params: {
          page: currentPage,
          limit: itemsPerPage
        }
      });
      
      if (response.data && response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
        setTotalItems(response.data.total || 0);
      } else if (Array.isArray(response.data)) {
        setNotifications(response.data);
        setTotalItems(response.data.length);
        setUnreadCount(response.data.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/admin/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.put(`/api/admin/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await axios.delete(`/api/admin/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      alert('Failed to delete notification');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} notifications?`)) return;
    try {
      await axios.delete(`/api/admin/notifications/bulk-delete`, {
        data: { ids: selectedIds }
      });
      setSelectedIds([]);
      fetchNotifications();
    } catch (error) {
      alert('Failed to bulk delete notifications');
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] pb-4">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              You have {unreadCount} unread messages
            </p>
          </div>
        </div>
        
        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="px-4 py-2 rounded-xl border border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        >
          <Check size={16} /> Mark All as Read
        </button>
      </div>

      {/* Bulk Action Drawer */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl flex items-center justify-between mb-6 shadow-xl shrink-0 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-rose-600 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="font-semibold text-sm">notifications selected</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main White Box Container */}
      <div className="card p-0 flex-1 flex flex-col min-h-0 bg-white shadow-md border border-gray-200 overflow-hidden">
        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Bell size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications found.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 ${
                !notification.isRead 
                  ? 'bg-blue-50/40 border-blue-100 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="pt-1">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={selectedIds.includes(notification.id)}
                  onChange={() => {
                    setSelectedIds(prev => 
                      prev.includes(notification.id) 
                        ? prev.filter(id => id !== notification.id) 
                        : [...prev, notification.id]
                    );
                  }}
                  title="Select Notification"
                />
              </div>
              
              <div className="h-8 w-8 rounded-full border border-blue-200 bg-white flex flex-shrink-0 items-center justify-center text-blue-500 mt-0.5">
                <Info size={16} />
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {notification.title}
                  </h3>
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-sm" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {new Date(notification.createdAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-1 mt-0.5">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                    title="Mark as Read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-auto p-4 sm:px-6 flex items-center justify-between border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="text-sm text-gray-500 font-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors border ${
                    currentPage === idx + 1
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
