import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Trash2,
  Search,
  CheckCircle2,
  X,
  AlertTriangle,
  Globe,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Check,
  ChevronDown,
  Edit3
} from 'lucide-react';

interface WhitelistItem {
  id: number;
  category: 'SOCIAL_MEDIA' | 'STREAMING_PLATFORM' | 'WEBSITE_DOMAIN';
  platformName: string;
  domain: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  isActive: boolean;
  artistId?: number;
  adminId?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const CATEGORY_LABELS = {
  SOCIAL_MEDIA: 'Social Media',
  STREAMING_PLATFORM: 'Streaming Platform',
  WEBSITE_DOMAIN: 'Website Domain',
};

interface StatusDropdownProps {
  item: WhitelistItem;
  onApprove: (item: WhitelistItem) => void;
  onReject: (item: WhitelistItem) => void;
  isUpdating?: boolean;
}

function StatusDropdown({ item, onApprove, onReject, isUpdating = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: WhitelistItem['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/50';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50';
    }
  };

  const options = [];
  if (item.status === 'PENDING') {
    options.push({ label: 'Approve', action: 'approve' });
    options.push({ label: 'Reject', action: 'reject' });
  } else if (item.status === 'APPROVED') {
    options.push({ label: 'Reject', action: 'reject' });
  } else if (item.status === 'REJECTED') {
    options.push({ label: 'Approve', action: 'approve' });
  }

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-30' : 'z-0'}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${getStatusColor(item.status)} cursor-pointer transition-all duration-200 select-none shadow-sm hover:shadow-md disabled:opacity-75 disabled:cursor-not-allowed`}
      >
        <span>{item.status || 'PENDING'}</span>
        {isUpdating ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !isUpdating && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-32 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg ring-1 ring-black/5 z-55 overflow-hidden transition-all duration-200">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.action}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (opt.action === 'approve') {
                    onApprove(item);
                  } else if (opt.action === 'reject') {
                    onReject(item);
                  }
                }}
                className="w-full text-center px-3 py-2 text-xs font-medium text-gray-705 dark:text-gray-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ActiveStatusDropdownProps {
  item: WhitelistItem;
  onToggle: (item: WhitelistItem) => void;
  isUpdating?: boolean;
}

function ActiveStatusDropdown({ item, onToggle, isUpdating = false }: ActiveStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getColor = (isActive: boolean) => {
    return isActive
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/50';
  };

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-30' : 'z-0'}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${getColor(item.isActive)} cursor-pointer transition-all duration-200 select-none shadow-sm hover:shadow-md disabled:opacity-75 disabled:cursor-not-allowed`}
      >
        <span>{item.isActive ? 'Active' : 'Inactive'}</span>
        {isUpdating ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !isUpdating && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-32 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg ring-1 ring-black/5 z-55 overflow-hidden transition-all duration-200">
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (!item.isActive) {
                  onToggle(item);
                }
              }}
              className="w-full text-center px-3 py-2 text-xs font-medium text-gray-750 dark:text-gray-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-gray-700 transition-colors duration-150"
              disabled={item.isActive}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (item.isActive) {
                  onToggle(item);
                }
              }}
              className="w-full text-center px-3 py-2 text-xs font-medium text-gray-750 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700 transition-colors duration-150"
              disabled={!item.isActive}
            >
              Inactive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Whitelist() {
  const [items, setItems] = useState<WhitelistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Delete modal confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    platformName: '',
    domain: '',
    category: 'WEBSITE_DOMAIN'
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    platformName: '',
    domain: '',
    category: 'WEBSITE_DOMAIN'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchWhitelist = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/whitelist');
      const responseData = response.data;
      if (responseData && responseData.success === true && Array.isArray(responseData.data)) {
        setItems(responseData.data);
      } else if (Array.isArray(responseData)) {
        setItems(responseData);
      } else if (responseData && Array.isArray(responseData.data)) {
        setItems(responseData.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch whitelist:', error);
      showToast('Failed to load whitelist entries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: WhitelistItem) => {
    const nextActive = !item.isActive;
    if (updatingIds.includes(item.id)) return;
    setUpdatingIds(prev => [...prev, item.id]);
    try {
      // Try patching status endpoint
      const response = await axios.patch(`/api/admin/whitelist/${item.id}/status`, { isActive: nextActive });
      const responseData = response.data;

      if (responseData && responseData.success) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: nextActive } : i));
        showToast(responseData.message || `Domain ${item.domain} status updated.`, 'success');
      } else {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: nextActive } : i));
        showToast(`Domain ${item.domain} has been ${nextActive ? 'enabled' : 'disabled'}.`, 'success');
      }
    } catch (error) {
      try {
        // Fallback to PUT on status endpoint
        const response = await axios.put(`/api/admin/whitelist/${item.id}/status`, { isActive: nextActive });
        const responseData = response.data;

        if (responseData && responseData.success) {
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: nextActive } : i));
          showToast(responseData.message || `Domain ${item.domain} status updated.`, 'success');
        } else {
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: nextActive } : i));
          showToast(`Domain ${item.domain} has been ${nextActive ? 'enabled' : 'disabled'}.`, 'success');
        }
      } catch (err: any) {
        console.error(err);
        showToast(err.response?.data?.message || err.response?.data?.error || 'Failed to update active status.', 'error');
      }
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== item.id));
    }
  };

  const handleApproveRequest = async (item: WhitelistItem) => {
    if (updatingIds.includes(item.id)) return;
    setUpdatingIds(prev => [...prev, item.id]);
    try {
      const response = await axios.post(`/api/admin/whitelist/${item.id}/approve`);
      const responseData = response.data;
      if (responseData && responseData.success) {
        showToast(responseData.message || 'Whitelist domain approved', 'success');
      } else {
        showToast('Whitelist domain approved', 'success');
      }
      fetchWhitelist();
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || error.response?.data?.message || 'Failed to approve request.', 'error');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== item.id));
    }
  };

  const handleRejectRequest = async (item: WhitelistItem) => {
    const reason = prompt('Please enter the rejection reason:');
    if (reason === null) return;
    if (updatingIds.includes(item.id)) return;
    setUpdatingIds(prev => [...prev, item.id]);
    try {
      const response = await axios.post(`/api/admin/whitelist/${item.id}/reject`, {
        rejectionReason: reason
      });
      const responseData = response.data;
      if (responseData && responseData.success) {
        showToast(responseData.message || 'Whitelist domain rejected', 'success');
      } else {
        showToast('Whitelist domain rejected', 'success');
      }
      fetchWhitelist();
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || error.response?.data?.message || 'Failed to reject request.', 'error');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== item.id));
    }
  };

  const handleDeleteTrigger = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    try {
      const response = await axios.delete(`/api/admin/whitelist/${confirmDeleteId}`);
      const responseData = response.data;
      if (responseData && responseData.success) {
        showToast(responseData.message || 'Whitelist domain deleted successfully', 'success');
      } else {
        showToast('Whitelist domain deleted successfully', 'success');
      }
      setItems(prev => prev.filter(i => i.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      // Adjust current page if empty
      const filtered = getFilteredItems();
      const totalPages = Math.ceil((filtered.length - 1) / itemsPerPage);
      if (currentPage > totalPages && currentPage > 1) {
        currentPage > totalPages && currentPage > 1 && setCurrentPage(totalPages);
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || error.response?.data?.message || 'Failed to delete entry.', 'error');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) return;
    setIsAdding(true);
    try {
      const response = await axios.post('/api/admin/whitelist', addForm);
      const responseData = response.data;
      if (responseData && responseData.success) {
        showToast(responseData.message || 'Whitelist entry created successfully', 'success');
        setItems(prev => [responseData.data, ...prev]);
        setShowAddModal(false);
        setAddForm({ platformName: '', domain: '', category: 'WEBSITE_DOMAIN' });
      } else {
        showToast('Whitelist entry created successfully', 'success');
        fetchWhitelist();
        setShowAddModal(false);
        setAddForm({ platformName: '', domain: '', category: 'WEBSITE_DOMAIN' });
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to create entry';
      showToast(errMsg, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const openEditModal = (item: WhitelistItem) => {
    setEditId(item.id);
    setEditForm({
      platformName: item.platformName,
      domain: item.domain,
      category: item.category,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing || !editId) return;
    setIsEditing(true);
    try {
      const response = await axios.put(`/api/admin/whitelist/${editId}`, editForm);
      const responseData = response.data;
      if (responseData && responseData.success) {
        showToast(responseData.message || 'Whitelist entry updated successfully', 'success');
        setItems(prev => prev.map(i => i.id === editId ? { ...i, ...responseData.data } : i));
        setShowEditModal(false);
      } else {
        showToast('Whitelist entry updated successfully', 'success');
        fetchWhitelist();
        setShowEditModal(false);
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update entry';
      showToast(errMsg, 'error');
    } finally {
      setIsEditing(false);
    }
  };


  // Get and filter list
  const getFilteredItems = () => {
    return items.filter(item => {
      if (!item) return false;
      const platformName = item.platformName || '';
      const domain = item.domain || '';
      const matchesSearch =
        platformName.toLowerCase().includes(search.toLowerCase()) ||
        domain.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && item.isActive) ||
        (filterStatus === 'inactive' && !item.isActive) ||
        (filterStatus === 'PENDING' && item.status === 'PENDING') ||
        (filterStatus === 'APPROVED' && item.status === 'APPROVED') ||
        (filterStatus === 'REJECTED' && item.status === 'REJECTED');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const filteredItems = getFilteredItems();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Slice for pagination
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm animate-bounce ${toast.type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-600" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Whitelist Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage whitelisted domains and streaming partners allowed for artist profile linking.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors shrink-0"
        >
          Add New Whitelist
        </button>
      </div>

      {/* List Column */}
      <div className="card flex-1 flex flex-col min-h-0">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by platform or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex gap-3">
            <div className="relative min-w-[130px]">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="STREAMING_PLATFORM">Streaming</option>
                <option value="WEBSITE_DOMAIN">Domains</option>
              </select>
            </div>

            <div className="relative min-w-[120px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading entries...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700">No Whitelist Entries Found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 space-y-4">
            <div className="flex-1 overflow-auto min-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-3 px-4 font-semibold">Platform</th>
                    <th className="text-left py-3 px-4 font-semibold">Domain</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-center py-3 px-4 font-semibold">Req Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Active Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Created Date</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-gray-900">{item.platformName}</td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">{item.domain}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-gray-500 text-xs">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusDropdown
                          item={item}
                          onApprove={handleApproveRequest}
                          onReject={handleRejectRequest}
                          isUpdating={updatingIds.includes(item.id)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <ActiveStatusDropdown
                          item={item}
                          onToggle={handleToggleStatus}
                          isUpdating={updatingIds.includes(item.id)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center dark:text-white text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(item)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve Request"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(item)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Reject Request"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Entry"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTrigger(item.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 inline-flex items-center gap-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => handlePageChange(pg)}
                      className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${currentPage === pg
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 inline-flex items-center gap-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-red-100 rounded-full shrink-0 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Whitelist Entry</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this whitelist entry? This action will permanently remove it and invalidate checks for this domain.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Whitelist Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Platform Name</label>
                <input
                  type="text"
                  required
                  value={addForm.platformName}
                  onChange={(e) => setAddForm(prev => ({ ...prev, platformName: e.target.value }))}
                  placeholder="e.g. Spotify"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Domain</label>
                <input
                  type="text"
                  required
                  value={addForm.domain}
                  onChange={(e) => setAddForm(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="e.g. open.spotify.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select
                  required
                  value={addForm.category}
                  onChange={(e) => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="STREAMING_PLATFORM">Streaming Platform</option>
                  <option value="WEBSITE_DOMAIN">Website Domain</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAdding ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Adding...</>
                  ) : (
                    'Create Entry'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Whitelist Entry</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Platform Name</label>
                <input
                  type="text"
                  required
                  value={editForm.platformName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, platformName: e.target.value }))}
                  placeholder="e.g. Spotify"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Domain</label>
                <input
                  type="text"
                  required
                  value={editForm.domain}
                  onChange={(e) => setEditForm(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="e.g. open.spotify.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select
                  required
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="STREAMING_PLATFORM">Streaming Platform</option>
                  <option value="WEBSITE_DOMAIN">Website Domain</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isEditing ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
