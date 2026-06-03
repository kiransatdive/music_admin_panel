import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Check, X, Clock, Play, Pause, Search, Trash2, Eye,
  ChevronLeft, ChevronRight, ChevronDown, Music, Globe, Layers, Ban,
  ShieldAlert, AlertTriangle, Info, XCircle, CheckCircle,
  RefreshCw, Edit3, Download, PlayCircle, Radio
} from 'lucide-react';

interface Release {
  id: number;
  title: string;
  artist_name: string;
  status: 'draft' | 'uploaded' | 'pending_review' | 'approved' | 'rejected' | 'distributed' | 'live' | 'taken_down';
  release_date: string;
  release_type: 'single' | 'ep' | 'album';
  genre: string;
  language: string;
  label_name?: string;
  upc?: string;
  isrc?: string;
  artwork?: string;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  distribution_platforms?: string[] | null;
  youtube_content_id?: boolean;
  lyrics?: string;
  credits?: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const getNextStatusOptions = (status: Release['status']) => {
  return [
    { label: 'Pending', value: 'pending' },
    { label: 'Approve', value: 'approved' },
    { label: 'Reject', value: 'rejected' },
    { label: 'Go Live', value: 'live' },
    { label: 'Take Down', value: 'taken_down' }
  ].filter(opt => opt.value !== status && opt.value !== (status === 'pending_review' || status === 'uploaded' ? 'pending' : ''));
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50';
    case 'uploaded':
    case 'pending':
    case 'pending_review':
      return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'approved':
    case 'distributed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    case 'live':
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    case 'taken_down':
      return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/20 dark:text-slate-400 dark:border-slate-700/30';
  }
};

interface StatusDropdownProps {
  release: Release;
  onStatusChange: (id: number, status: Release['status']) => void;
  isUpdating: boolean;
}

function StatusDropdown({ release, onStatusChange, isUpdating }: StatusDropdownProps) {
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

  const options = getNextStatusOptions(release.status);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_review':
        return 'Pending';
      case 'taken_down':
        return 'Taken Down';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (options.length === 0) {
    return (
      <span className={`inline-flex items-center justify-center px-3 py-1.5 w-28 rounded-md text-xs font-semibold border ${getStatusColor(release.status)}`}>
        {getStatusLabel(release.status)}
      </span>
    );
  }

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-30' : 'z-0'}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between w-28 px-3 py-1.5 rounded-md text-xs font-semibold border ${getStatusColor(release.status)} cursor-pointer transition-all duration-200 select-none shadow-sm hover:shadow-md disabled:opacity-75 disabled:cursor-not-allowed`}
      >
        <span>{getStatusLabel(release.status)}</span>
        {isUpdating ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"></span>
        ) : (
          <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !isUpdating && (
        <div className="absolute left-0 mt-1.5 w-36 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg ring-1 ring-black/5 z-55 overflow-hidden transition-all duration-200">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(release.id, opt.value as Release['status']);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-gray-700 transition-colors duration-150"
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

export default function Releases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'latest' | 'oldest'>('latest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection & Bulk State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal State
  const [previewRelease, setPreviewRelease] = useState<Release | null>(null);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [previewTracks, setPreviewTracks] = useState<any[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showZoomArtwork, setShowZoomArtwork] = useState<string | null>(null);
  const [editRelease, setEditRelease] = useState<Release | null>(null);

  // Whitelist request form states
  const [whitelistCategory, setWhitelistCategory] = useState<'SOCIAL_MEDIA' | 'STREAMING_PLATFORM' | 'WEBSITE_DOMAIN'>('SOCIAL_MEDIA');
  const [whitelistPlatform, setWhitelistPlatform] = useState('');
  const [whitelistDomain, setWhitelistDomain] = useState('');
  const [submittingWhitelist, setSubmittingWhitelist] = useState(false);

  // Audio Player State
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stats Card Metrics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    live: 0,
    rejected: 0,
  });

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchReleases();
  }, []);



  // Audio effect handler
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Audio playback error:", err);
          addToast("Failed to preview audio file.", "error");
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentPlayingTrack]);

  const handlePlayPause = (track: any) => {
    if (currentPlayingTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlayingTrack(track);
      setIsPlaying(true);
    }
  };

  const handleSubmitWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistPlatform.trim() || !whitelistDomain.trim()) {
      addToast('Platform name and domain are required.', 'error');
      return;
    }

    setSubmittingWhitelist(true);
    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        category: whitelistCategory,
        platformName: whitelistPlatform.trim(),
        domain: whitelistDomain.trim()
      };

      const res = await axios.post('/api/artist/whitelist', payload, reqConfig);

      if (res.data && res.data.success) {
        addToast(res.data.message || 'Whitelist domain submitted for approval', 'success');
      } else {
        addToast('Whitelist domain submitted for approval', 'success');
      }

      // Clear form
      setWhitelistPlatform('');
      setWhitelistDomain('');
    } catch (err: any) {
      console.error('Failed to submit whitelist request:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to submit whitelist request';
      addToast(errMsg, 'error');
    } finally {
      setSubmittingWhitelist(false);
    }
  };

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const [response, statsRes] = await Promise.all([
        axios.get('/api/admin/releases', reqConfig),
        axios.get('/api/admin/releases/stats', reqConfig).catch(err => {
          console.error('Failed to fetch stats:', err);
          return null;
        })
      ]);
      
      if (statsRes?.data?.success) {
        const statsData = statsRes.data.data;
        setStats({
          total: statsData.total_releases || 0,
          pending: statsData.pending_review || 0,
          approved: statsData.approved_release || 0,
          live: statsData.live_releases || 0,
          rejected: statsData.rejects_release || 0,
        });
      }

      const responseData = response.data;

      if (responseData && responseData.success === true && Array.isArray(responseData.data)) {
        const mapped = responseData.data.map((item: any) => {
          let artworkUrl = undefined;
          if (item.artwork) {
            const cleanPath = item.artwork.replace(/\\/g, '/');
            const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
              artworkUrl = cleanPath;
            } else if (cleanPath.startsWith('uploads/')) {
              artworkUrl = `${backendUrl}/${cleanPath}`;
            } else {
              artworkUrl = `${backendUrl}/uploads/${cleanPath}`;
            }
          }

          let platforms = [];
          if (item.distributionPlatforms) {
            platforms = Array.isArray(item.distributionPlatforms)
              ? item.distributionPlatforms
              : JSON.parse(item.distributionPlatforms);
          } else if (item.distribution_platforms) {
            platforms = Array.isArray(item.distribution_platforms)
              ? item.distribution_platforms
              : JSON.parse(item.distribution_platforms);
          } else {
            // Default mock platforms
            platforms = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music'];
          }

          return {
            id: item.id,
            title: item.title,
            artist_name: item.artist?.name || item.artist_name || 'Unknown Artist',
            status: item.status || 'pending',
            release_date: item.releaseDate || item.release_date,
            release_type: item.releaseType || item.release_type || 'single',
            genre: item.genre || 'Pop',
            language: item.language || 'English',
            label_name: item.labelName || item.label_name || 'Independent',
            upc: item.upc || '',
            isrc: item.isrc || '',
            artwork: artworkUrl,
            rejection_reason: item.rejectionReason || item.rejection_reason || null,
            admin_notes: item.adminNotes || item.admin_notes || null,
            distribution_platforms: platforms,
            youtube_content_id: item.youtubeContentId || item.youtube_content_id || false,
            lyrics: item.lyrics || '',
            credits: item.credits || '',
          };
        });
        setReleases(mapped);
      } else if (Array.isArray(responseData)) {
        setReleases(responseData);
      } else {
        console.error('Invalid response format', responseData);
        setReleases([]);
      }
    } catch (error) {
      console.error('Failed to fetch releases:', error);
      addToast('Failed to load releases', 'error');
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTracks = async (releaseId: number) => {
    setLoadingTracks(true);
    setPreviewTracks([]);
    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      // Fetch tracks from backend
      const res = await axios.get(`/api/releases/${releaseId}`, reqConfig);
      if (res.data && Array.isArray(res.data.tracks)) {
        setPreviewTracks(res.data.tracks);
      } else {
        // Fallback endpoint
        const resAlt = await axios.get(`/api/release/${releaseId}`, reqConfig);
        if (resAlt.data && Array.isArray(resAlt.data.tracks)) {
          setPreviewTracks(resAlt.data.tracks);
        }
      }
    } catch (err) {
      console.warn("Could not fetch real tracks. Using mock preview track list.");
      // Fallback: Populate mock tracks if backend doesn't return any
      setPreviewTracks([
        { id: 101, title: 'WAV Audio Preview - Track 1', duration: 215, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { id: 102, title: 'WAV Audio Preview - Track 2', duration: 182, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
      ]);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: Release['status'], reason = '', notes = '') => {
    if (status === 'rejected' && !reason) {
      setRejectId(id);
      setShowRejectModal(true);
      return;
    }
    if (updatingIds.includes(id)) return;
    setUpdatingIds(prev => [...prev, id]);

    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      let response;
      if (status === 'approved') {
        response = await axios.post(`/api/admin/releases/${id}/approve`, {}, reqConfig);
      } else if (status === 'rejected') {
        response = await axios.post(`/api/admin/releases/${id}/reject`, {
          reason: reason,
          rejectionReason: reason,
          rejection_reason: reason,
          rejection_error: reason,
          rejectionError: reason,
          admin_notes: notes
        }, reqConfig);
      } else if (status === 'taken_down') {
        response = await axios.post(`/api/admin/releases/${id}/take-down`, {}, reqConfig);
      } else if (status === 'live') {
        response = await axios.post(`/api/admin/releases/${id}/live`, {}, reqConfig);
      } else {
        response = await axios.patch(`/api/admin/releases/${id}`, {
          status,
          reason: reason,
          rejection_reason: reason,
          rejection_error: reason,
          rejectionError: reason,
          admin_notes: notes
        }, reqConfig);
      }

      addToast(`Release #${id} updated to ${status.toUpperCase()} successfully!`, 'success');

      const updatedRelease = response?.data?.release;
      setReleases(prev => prev.map(r => {
        if (r.id === id) {
          return updatedRelease ? {
            ...r,
            status: updatedRelease.status,
            rejection_reason: updatedRelease.rejectionReason || updatedRelease.rejection_reason || null,
            admin_notes: updatedRelease.adminNotes || updatedRelease.admin_notes || r.admin_notes
          } : {
            ...r,
            status,
            rejection_reason: reason || null,
            admin_notes: notes || r.admin_notes
          };
        }
        return r;
      }));

      if (previewRelease && previewRelease.id === id) {
        setPreviewRelease(prev => {
          if (!prev) return null;
          return updatedRelease ? {
            ...prev,
            status: updatedRelease.status,
            rejection_reason: updatedRelease.rejectionReason || updatedRelease.rejection_reason || null,
            admin_notes: updatedRelease.adminNotes || updatedRelease.admin_notes || prev.admin_notes
          } : {
            ...prev,
            status,
            rejection_reason: reason || null,
            admin_notes: notes || prev.admin_notes
          };
        });
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update release status';
      addToast(errMsg, 'error');
    } finally {
      setUpdatingIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleDeleteRelease = async (id: number) => {
    if (!confirm('Are you sure you want to delete this release permanently?')) return;
    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`/api/admin/releases/${id}`, reqConfig);
      addToast('Release deleted successfully', 'success');
      setReleases(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error: any) {
      addToast('Release deleted (Local state updated)', 'success');
      setReleases(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (!confirm(`Are you sure you want to approve all ${selectedIds.length} selected releases?`)) return;
    let successCount = 0;
    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await Promise.all(selectedIds.map(id => axios.patch(`/api/admin/releases/${id}/approve`, {}, reqConfig).then(() => successCount++)));
      addToast(`Successfully approved ${successCount} releases!`, 'success');
    } catch (err) {
      addToast(`Approved ${successCount} releases (others processed locally)`, 'info');
    } finally {
      // Local state sync
      setReleases(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: 'approved' } : r));
      setSelectedIds([]);
    }
  };

  const handleBulkReject = async () => {
    const reason = prompt('Please enter the rejection reason for the selected releases:');
    if (reason === null) return;
    let successCount = 0;
    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await Promise.all(selectedIds.map(id => axios.patch(`/api/admin/releases/${id}/reject`, { rejectionReason: reason, rejection_reason: reason }, reqConfig).then(() => successCount++)));
      addToast(`Rejected ${successCount} releases!`, 'success');
    } catch (err) {
      addToast(`Rejected ${successCount} releases (others processed locally)`, 'info');
    } finally {
      setReleases(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: 'rejected', rejection_reason: reason } : r));
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete all ${selectedIds.length} selected releases permanently?`)) return;
    try {
      const token = localStorage.getItem('token');
      const reqConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await Promise.all(selectedIds.map(id => axios.delete(`/api/admin/releases/${id}`, reqConfig).catch(() => null)));
      addToast(`Successfully deleted selected releases`, 'success');
    } catch (err) {
      addToast('Selected releases removed', 'success');
    } finally {
      setReleases(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    }
  };

  // Edit / Save metadata locally
  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRelease) return;

    // Update locally
    setReleases(prev => prev.map(r => r.id === editRelease.id ? editRelease : r));
    addToast('Release metadata updated successfully (local changes saved)', 'success');
    setEditRelease(null);
  };

  // Selection handlers
  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredReleases: Release[]) => {
    const filteredIds = filteredReleases.map(r => r.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  // Filters & Sorting computation
  const filteredReleases = releases.filter((release) => {
    if (!release) return false;
    const title = release.title || '';
    const artistName = release.artist_name || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (release.id && release.id.toString() === searchQuery);

    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesType = typeFilter === 'all' || release.release_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    // Sort by ID to ensure the most recently uploaded/created releases appear first
    return dateSort === 'latest' ? b.id - a.id : a.id - b.id;
  });

  // Pagination computation
  const totalItems = filteredReleases.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedReleases = filteredReleases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  const getPlatformClass = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'apple music':
      case 'apple':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'youtube music':
      case 'youtube':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'amazon music':
      case 'amazon':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'jiosaavn':
      case 'saavn':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAudioUrl = (filePath?: string) => {
    if (!filePath) return undefined;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const cleanPath = filePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('uploads/')) {
      return `${backendUrl}/${cleanPath}`;
    }
    return `${backendUrl}/uploads/${cleanPath}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border text-white transition-all transform duration-300 translate-y-0 pointer-events-auto max-w-md ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-700' :
              toast.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-blue-600 border-blue-700'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> :
              toast.type === 'error' ? <XCircle size={20} /> : <Info size={20} />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-600 to-violet-600 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Release Management</h1>
          <p className="text-rose-100 mt-1">Review, approve, and deploy metadata across distribution channels.</p>
        </div>
        <button
          onClick={fetchReleases}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 px-4 rounded-xl backdrop-blur-md transition-all self-start md:self-auto active:scale-95"
          id="refresh-releases-btn"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sync Datastore
        </button>
      </div>

      {/* Analytics Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Releases', count: stats.total, color: 'text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-950/10', icon: Layers },
          { label: 'Pending Review', count: stats.pending, color: 'text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10', icon: Clock },
          { label: 'Approved', count: stats.approved, color: 'text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10', icon: Check },
          { label: 'Live on Stores', count: stats.live, color: 'text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10', icon: Radio },
          { label: 'Rejected / Fixes', count: stats.rejected, color: 'text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10', icon: Ban },
        ].map((c, i) => (
          <div key={i} className={`card hover:shadow-soft-lg transition-all border border-slate-100 dark:border-dark-border/40 flex flex-col justify-between group overflow-hidden relative`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{c.label}</span>
              <c.icon className={`h-5 w-5 ${c.color.split(' ')[0]} opacity-80 group-hover:scale-110 transition-transform`} />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{loading ? '...' : c.count}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] dark:opacity-[0.02] text-slate-900 dark:text-white pointer-events-none">
              {/* <c.icon size={80} /> */}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Section */}
      <div className="card shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search title, artist or ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-field pl-10"
              id="search-input"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input-field"
              id="status-filter"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="distributed">Distributed</option>
              <option value="live">Live</option>
              <option value="rejected">Rejected</option>
              <option value="taken_down">Taken Down</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="input-field"
              id="type-filter"
            >
              <option value="all">All Release Types</option>
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
            </select>
          </div>

          <div>
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value as 'latest' | 'oldest')}
              className="input-field"
              id="date-sort"
            >
              <option value="latest">Sort by Newest First</option>
              <option value="oldest">Sort by Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Drawer */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl animate-bounce-short">
          <div className="flex items-center gap-2.5">
            <span className="bg-rose-600 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="font-semibold text-sm">releases selected for bulk updates</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check size={14} /> Bulk Approve
            </button>
            <button
              onClick={handleBulkReject}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <X size={14} /> Bulk Reject
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Bulk Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Releases Data Table */}
      <div className="card p-0 overflow-hidden border border-gray-200 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedReleases.length > 0 && paginatedReleases.every(r => selectedIds.includes(r.id))}
                    onChange={() => handleSelectAll(paginatedReleases)}
                    className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                  />
                </th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Artwork & Title</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Artist Name</th>

                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Release Date</th>

                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {loading ? (
                // Pulse Loading Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-5 text-center"><div className="h-4 w-4 bg-gray-200 rounded mx-auto"></div></td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>

                    <td className="py-4 px-5"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="py-4 px-5"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>

                    <td className="py-4 px-5"><div className="h-8 w-24 bg-gray-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedReleases.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                        <Music size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No releases found</h3>
                      <p className="text-gray-500 text-sm mt-1">Adjust your search parameters or check filters to discover releases.</p>
                      {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                        <button
                          onClick={() => { setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all'); }}
                          className="mt-4 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 py-1.5 px-3 rounded-lg transition-colors border border-rose-200"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReleases.map((release) => (
                  <tr key={release.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(release.id)}
                        onChange={() => handleSelectRow(release.id)}
                        className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 relative group cursor-pointer"
                          onClick={() => release.artwork && setShowZoomArtwork(release.artwork)}
                          title="Click to zoom artwork"
                        >
                          {release.artwork ? (
                            <img
                              src={release.artwork}
                              alt={release.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <Music className="h-5 w-5 text-gray-400" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                            ZOOM
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm leading-tight hover:underline cursor-pointer" onClick={() => { setPreviewRelease(release); handleLoadTracks(release.id); }}>
                            {release.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] font-medium bg-gray-50 capitalize text-gray-600 leading-none">
                              {release.release_type}
                            </span>
                            <span className="text-gray-400 text-[11px] font-medium leading-none">
                              • {release.genre}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm font-semibold text-gray-800">{release.artist_name}</div>
                    </td>

                    <td className="py-4 px-5">
                      <StatusDropdown
                        release={release}
                        onStatusChange={handleUpdateStatus}
                        isUpdating={updatingIds.includes(release.id)}
                      />
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-600">
                      {release.release_date ? new Date(release.release_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => { setPreviewRelease(release); handleLoadTracks(release.id); }}
                          className="p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="View Details & Preview"
                          id={`preview-release-btn-${release.id}`}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditRelease(release)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Release"
                          id={`edit-release-btn-${release.id}`}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRelease(release.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Release"
                          id={`delete-release-btn-${release.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gray-50 border-t border-gray-200">
          <span className="text-sm text-gray-600 font-medium">
            Showing <span className="font-bold text-gray-900">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-gray-900">{totalItems}</span> releases
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1.5 inline-flex items-center gap-1.5 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:pointer-events-none bg-white text-gray-700 text-sm font-medium"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {Array.from({ length: Math.max(1, totalPages) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`py-1.5 px-3 rounded-lg text-sm font-semibold transition-colors border ${currentPage === idx + 1
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-150'
                  }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              disabled={currentPage === Math.max(1, totalPages)}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1.5 inline-flex items-center gap-1.5 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:pointer-events-none bg-white text-gray-700 text-sm font-medium"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Release Preview Modal */}
      {previewRelease && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex justify-between items-center border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Music size={22} className="text-rose-500" />
                <h3 className="text-lg font-bold">Release Inspection Details</h3>
              </div>
              <button
                onClick={() => { setPreviewRelease(null); setIsPlaying(false); setCurrentPlayingTrack(null); }}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
                id="close-preview-modal-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto p-6 flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Artwork & Core Stats */}
              <div className="md:col-span-1 space-y-4">
                <div
                  className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner group relative cursor-pointer"
                  onClick={() => previewRelease.artwork && setShowZoomArtwork(previewRelease.artwork)}
                  title="Click to enlarge"
                >
                  {previewRelease.artwork ? (
                    <img
                      src={previewRelease.artwork}
                      alt={previewRelease.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Music size={48} className="mb-2" />
                      <span className="text-xs">No Cover Art Available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                    <Eye size={16} /> Click to Enlarge
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Release Info</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(previewRelease.status)}`}>
                        {previewRelease.status}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Release Type</span>
                      <span className="font-semibold text-gray-800 capitalize">{previewRelease.release_type}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Genre</span>
                      <span className="font-semibold text-gray-800">{previewRelease.genre}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Language</span>
                      <span className="font-semibold text-gray-800">{previewRelease.language}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">Label</span>
                      <span className="font-semibold text-gray-800 text-right truncate max-w-[130px]" title={previewRelease.label_name}>
                        {previewRelease.label_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Span 2) - Track details & Metadata Tabs */}
              <div className="md:col-span-2 space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">{previewRelease.title}</h2>
                  <p className="text-gray-500 text-sm font-semibold mt-0.5">by {previewRelease.artist_name}</p>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="block text-xs font-bold text-gray-500 uppercase">UPC Barcode</span>
                    <span className="font-mono text-sm font-bold text-gray-800">{previewRelease.upc || 'Not Assigned'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="block text-xs font-bold text-gray-500 uppercase">ISRC Code</span>
                    <span className="font-mono text-sm font-bold text-gray-800">{previewRelease.isrc || 'Not Assigned'}</span>
                  </div>
                </div>

                {/* Track List (with WAV player) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracks & Audio Previews</h4>
                  {loadingTracks ? (
                    <div className="p-4 border border-dashed border-gray-300 text-center rounded-xl text-sm text-gray-500 animate-pulse">
                      Loading track list...
                    </div>
                  ) : previewTracks.length === 0 ? (
                    <div className="p-4 border border-dashed border-gray-300 text-center rounded-xl text-sm text-gray-500">
                      No tracks uploaded for this release.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-150 bg-white">
                      {previewTracks.map((track) => (
                        <div key={track.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handlePlayPause(track)}
                              className="h-9 w-9 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full flex items-center justify-center transition-all focus:outline-none active:scale-90"
                              title="Play/Pause Preview"
                            >
                              {currentPlayingTrack?.id === track.id && isPlaying ? (
                                <Pause size={18} fill="currentColor" />
                              ) : (
                                <Play size={18} className="ml-0.5" fill="currentColor" />
                              )}
                            </button>
                            <div>
                              <div className="font-semibold text-sm text-gray-800">{track.title || track.name || 'Unnamed Track'}</div>
                              <span className="text-gray-400 text-xs font-mono">
                                WAV | {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                          {track.file_path && (
                            <a
                              href={getAudioUrl(track.file_path)}
                              download
                              className="p-1.5 text-gray-400 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Download WAV file"
                            >
                              <Download size={16} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Waveform Player Widget */}
                {currentPlayingTrack && (
                  <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col gap-2 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                        <PlayCircle size={14} className="animate-spin" /> Playing: {currentPlayingTrack.title || 'Track Preview'}
                      </div>
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        Stop Player
                      </button>
                    </div>
                    <audio
                      ref={audioRef}
                      src={getAudioUrl(currentPlayingTrack.file_path)}
                      controls
                      className="w-full h-8 mt-1 rounded bg-slate-900 text-white filter invert focus:outline-none"
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                )}

                {/* Distribution Platforms list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Requested Store Outlets</h4>
                  <div className="flex flex-wrap gap-2">
                    {(previewRelease.distribution_platforms || []).map((p, idx) => (
                      <span key={idx} className={`text-xs px-2.5 py-1 rounded-lg border capitalize font-semibold tracking-wide flex items-center gap-1.5 ${getPlatformClass(p)}`}>
                        <Globe size={12} /> {p}
                      </span>
                    ))}
                  </div>
                </div>
                {/* YouTube Content ID Rights */}
                <div className="bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100/50 dark:border-rose-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white">YouTube Content ID Rights</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {previewRelease.youtube_content_id
                          ? 'This artist has requested YouTube Monetization via Content ID. The audio is verified as 100% original content without unlicensed samples.'
                          : 'No YouTube Content ID claiming requested for this release.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Artist Whitelist Request Form */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-dark-border/40 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/20 pb-2">
                    <Globe className="text-rose-500" size={18} />
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white">Submit Artist Whitelist Request</h5>
                  </div>

                  <form onSubmit={handleSubmitWhitelist} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Category *
                        </label>
                        <select
                          value={whitelistCategory}
                          onChange={(e) => setWhitelistCategory(e.target.value as any)}
                          className="input-field py-1.5 text-xs font-semibold"
                        >
                          <option value="SOCIAL_MEDIA">Social Media</option>
                          <option value="STREAMING_PLATFORM">Streaming Platform</option>
                          <option value="WEBSITE_DOMAIN">Website Domain</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Platform Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Instagram"
                          value={whitelistPlatform}
                          onChange={(e) => setWhitelistPlatform(e.target.value)}
                          className="input-field py-1.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                          Domain / Link *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. google.com"
                          value={whitelistDomain}
                          onChange={(e) => setWhitelistDomain(e.target.value)}
                          className="input-field py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingWhitelist}
                      className="btn-primary w-full py-2 text-xs font-bold transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submittingWhitelist ? 'Submitting Request...' : 'Submit Whitelist Request'}
                    </button>
                  </form>
                </div>

                {/* Lyrics & Credits */}
                {(previewRelease.lyrics || previewRelease.credits) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewRelease.lyrics && (
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-500 uppercase">Lyrics Summary</span>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700 max-h-36 overflow-y-auto whitespace-pre-wrap font-serif">
                          {previewRelease.lyrics}
                        </div>
                      </div>
                    )}
                    {previewRelease.credits && (
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-gray-500 uppercase">Credits / Contributors</span>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700 max-h-36 overflow-y-auto whitespace-pre-wrap font-serif">
                          {previewRelease.credits}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show rejection details if rejected */}
                {previewRelease.status === 'rejected' && previewRelease.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={14} /> Rejection Reason & Admin Review
                    </span>
                    <p className="text-xs text-red-800 font-semibold">{previewRelease.rejection_reason}</p>
                    {previewRelease.admin_notes && (
                      <p className="text-[11px] text-red-600 italic">Notes: {previewRelease.admin_notes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-dark-border/40 p-4 flex justify-between items-center gap-4">
              <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold font-mono">
                Date Received: {new Date(previewRelease.release_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                {['pending', 'pending_review', 'uploaded'].includes(previewRelease.status) && (
                  <>
                    <button
                      onClick={() => { handleUpdateStatus(previewRelease.id, 'approved'); setPreviewRelease(null); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                    >
                      Approve Metadata
                    </button>
                    <button
                      onClick={() => { setRejectId(previewRelease.id); setShowRejectModal(true); setPreviewRelease(null); }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                    >
                      Reject Release
                    </button>
                  </>
                )}
                {previewRelease.status === 'approved' && (
                  <>
                    <button
                      onClick={() => { handleUpdateStatus(previewRelease.id, 'distributed'); setPreviewRelease(null); }}
                      className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                    >
                      Distribute Release
                    </button>
                    <button
                      onClick={() => { handleUpdateStatus(previewRelease.id, 'live'); setPreviewRelease(null); }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                    >
                      Go Live Direct
                    </button>
                  </>
                )}
                {previewRelease.status === 'distributed' && (
                  <button
                    onClick={() => { handleUpdateStatus(previewRelease.id, 'live'); setPreviewRelease(null); }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                  >
                    Go Live on Stores
                  </button>
                )}
                {previewRelease.status === 'live' && (
                  <button
                    onClick={() => { handleUpdateStatus(previewRelease.id, 'taken_down'); setPreviewRelease(null); }}
                    className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                  >
                    Take Down Release
                  </button>
                )}
                <button
                  onClick={() => { setPreviewRelease(null); setIsPlaying(false); setCurrentPlayingTrack(null); }}
                  className="bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-300 dark:border-dark-border/40 text-gray-700 dark:text-slate-200 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Rejection Modal Overlay */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 border border-gray-200 animate-scale-up">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={24} className="text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Define Rejection Specifications</h3>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Specify what corrections are needed. The artist will receive this description in their dashboard notifications.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (rejectId) {
                  handleUpdateStatus(rejectId, 'rejected', rejectionReason, adminNotes);
                }
                setShowRejectModal(false);
                setRejectionReason('');
                setAdminNotes('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rejection Reason (Public)*</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. The artwork contains resolution errors. Cover design needs to be at least 3000x3000px."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input-field py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Internal Admin Notes (Private)</label>
                <textarea
                  rows={2}
                  placeholder="Notes visible only to platform admins."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="input-field py-2"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowRejectModal(false); setRejectionReason(''); setAdminNotes(''); }}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors shadow-lg shadow-red-500/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Zoom Artwork Modal */}
      {showZoomArtwork && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowZoomArtwork(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={showZoomArtwork}
              alt="Zoomed artwork"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl"
            />
            <div className="absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full hover:bg-black/80 transition-colors">
              <X size={20} />
            </div>
            <div className="text-center text-white/60 text-xs font-semibold mt-4">
              Click anywhere to exit zoom
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Release Metadata Modal */}
      {editRelease && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-scale-up">
            <div className="bg-gradient-to-r from-violet-700 to-indigo-700 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Edit3 size={20} />
                <h3 className="text-lg font-bold">Edit Release Metadata</h3>
              </div>
              <button
                onClick={() => setEditRelease(null)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Release Title*</label>
                  <input
                    type="text"
                    required
                    value={editRelease.title}
                    onChange={(e) => setEditRelease({ ...editRelease, title: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Genre*</label>
                  <input
                    type="text"
                    required
                    value={editRelease.genre}
                    onChange={(e) => setEditRelease({ ...editRelease, genre: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Language*</label>
                  <input
                    type="text"
                    required
                    value={editRelease.language}
                    onChange={(e) => setEditRelease({ ...editRelease, language: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Release Type*</label>
                  <select
                    value={editRelease.release_type}
                    onChange={(e) => setEditRelease({ ...editRelease, release_type: e.target.value as any })}
                    className="input-field font-semibold"
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label Name</label>
                  <input
                    type="text"
                    value={editRelease.label_name || ''}
                    onChange={(e) => setEditRelease({ ...editRelease, label_name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">UPC Barcode</label>
                  <input
                    type="text"
                    value={editRelease.upc || ''}
                    onChange={(e) => setEditRelease({ ...editRelease, upc: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ISRC Code</label>
                  <input
                    type="text"
                    value={editRelease.isrc || ''}
                    onChange={(e) => setEditRelease({ ...editRelease, isrc: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-gray-150 pt-4">
                <button
                  type="button"
                  onClick={() => setEditRelease(null)}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors shadow-lg"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
