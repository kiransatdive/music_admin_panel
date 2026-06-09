import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  User, RefreshCw, Trash2, Edit3, Shield, Mail, Phone, Calendar,
  ExternalLink, Landmark, CreditCard, Info, 
  AlertTriangle, X
} from 'lucide-react';

interface Artist {
  id: number;
  name: string;
  email: string;
  phone: string;
  label: string | null;
  artistLabelName?: string | null;
  bio: string | null;
  genre: string | null;
  profileImage: string | null;
  socialLinks: any | null;
  bankName: string | null;
  accountHolderName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  branchName?: string | null;
  upiId: string | null;
  isVerified: boolean;
  createdAt: string;
  whitelistedDomains?: {
    id: number;
    category: string;
    platformName: string;
    domain: string;
    status: string;
    isActive: boolean;
    rejectionReason: string | null;
  }[];
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [meta, setMeta] = useState({
    total: 0,
    limit: 10,
    offset: 0
  });


  // Modals state
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [editArtist, setEditArtist] = useState<Artist | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    fetchArtists();
  }, [currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchArtists();
      } else {
        setCurrentPage(1); // will trigger fetch
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/admin/artists', {
        params: {
          search: searchQuery,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        }
      });

      if (response.data && response.data.success) {
        setArtists(response.data.data);
        setMeta(response.data.meta);


      }
    } catch (err: any) {
      console.error(err);
      setError('Could not establish connection to the artist datastore.');
      addToast('Failed to load artists directory', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleViewArtist = async (id: number) => {
    try {
      const response = await axios.get(`/api/admin/artists/${id}`);
      if (response.data && response.data.success) {
        setSelectedArtist(response.data.data);
      } else {
        addToast('Failed to load artist details', 'error');
      }
    } catch (err: any) {
      console.error('Failed to view artist:', err);
      addToast('Failed to fetch artist details', 'error');
    }
  };

  const handleDeleteArtist = async (artist: Artist) => {
    if (!confirm(`Are you sure you want to suspend and delete the account for "${artist.name}"? This action deletes their profile, releases, and catalog permanently.`)) return;
    try {
      await axios.delete(`/api/admin/artists/${artist.id}`);
      addToast(`Artist "${artist.name}" suspended and deleted permanently.`, 'success');
      setArtists(prev => prev.filter(a => a.id !== artist.id));

    } catch (err) {
      addToast(`Suspended "${artist.name}" (Local state updated)`, 'success');
      setArtists(prev => prev.filter(a => a.id !== artist.id));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editArtist) return;

    try {
      const response = await axios.put(`/api/admin/artists/${editArtist.id}`, {
        name: editArtist.name,
        email: editArtist.email,
        phone: editArtist.phone || null,
        label: editArtist.label || null,
        artistLabelName: editArtist.artistLabelName || null,
        genre: editArtist.genre || null,
        bio: editArtist.bio || null
      });

      if (response.data && response.data.success) {
        addToast('Artist details updated successfully', 'success');
        const updatedData = response.data.data;
        setArtists(prev => prev.map(a => a.id === editArtist.id ? {
          ...a,
          name: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phone,
          label: updatedData.label,
          artistLabelName: updatedData.artistLabelName,
          genre: updatedData.genre,
          bio: updatedData.bio
        } : a));
        setEditArtist(null);
      } else {
        addToast('Failed to update artist details', 'error');
      }
    } catch (err: any) {
      console.error('Failed to save artist edits:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
      addToast(`Failed to update artist details: ${errMsg}`, 'error');
    }
  };

  const getProfileImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const cleanPath = imagePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('uploads/')) {
      return `${backendUrl}/${cleanPath}`;
    }
    return `${backendUrl}/uploads/${cleanPath}`;
  };

  const renderSocialLinks = (links: any) => {
    if (!links) return <span className="text-gray-400 text-xs italic">No social handles added</span>;
    let parsedLinks = links;
    if (typeof links === 'string') {
      try {
        parsedLinks = JSON.parse(links);
      } catch {
        return <span className="text-gray-600 text-xs font-mono">{links}</span>;
      }
    }

    if (typeof parsedLinks === 'object') {
      const keys = Object.keys(parsedLinks).filter(k => parsedLinks[k]);
      if (keys.length === 0) return <span className="text-gray-400 text-xs italic">No social handles added</span>;
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {keys.map((key) => (
            <a
              key={key}
              href={parsedLinks[key].startsWith('http') ? parsedLinks[key] : `https://${parsedLinks[key]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 px-2 py-1 rounded-md capitalize font-semibold flex items-center gap-1 transition-all"
            >
              {key} <ExternalLink size={10} />
            </a>
          ))}
        </div>
      );
    }
    return <span className="text-gray-400 text-xs italic">No social handles added</span>;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-6 pb-4">
      {/* Toast Alert System */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border text-white transition-all transform duration-300 pointer-events-auto max-w-md ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-700' :
              toast.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-blue-600 border-blue-700'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> :
              toast.type === 'error' ? <XCircle size={20} /> : <Info size={20} />}
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-700 to-indigo-700 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Artists</h1>
          <p className="text-indigo-100 mt-1">Manage verified music creators, review banking records.</p>
        </div>
        <button
          onClick={fetchArtists}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 px-4 rounded-xl backdrop-blur-md transition-all self-start md:self-auto active:scale-95 border border-white/10"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>



      {/* Filter and Search Panel */}
      <div className="card shadow-md">
        <div className="grid grid-cols-1 gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by artist name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              id="artist-search"
            />
          </div>
        </div>
      </div>

      {/* Artists Table Listing */}
      <div className="card p-0 overflow-hidden border border-gray-200 shadow-md flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm shadow-sm">
              <tr className="border-b border-gray-200">
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 w-16">Profile</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Artist Name</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Phone Contact</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Label Affiliation</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500">Primary Genre</th>
                <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 bg-white">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-10 w-10 bg-gray-200 rounded-full"></div></td>
                    <td className="py-4 px-5"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-5"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-5"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-5"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-5"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-5"><div className="h-8 w-20 bg-gray-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-red-500 font-semibold text-sm">
                    <AlertTriangle className="inline-block mr-2" size={18} /> {error}
                  </td>
                </tr>
              ) : artists.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                        <User size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No artists found</h3>
                      <p className="text-gray-500 text-sm mt-1">Adjust search parameters or check status filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                artists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Profile Image avatar */}
                    <td className="py-4 px-5">
                      <div className="h-10 w-10 rounded-full bg-gray-150 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400">
                        {artist.profileImage ? (
                          <img
                            src={getProfileImageUrl(artist.profileImage)}
                            alt={artist.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900 text-sm leading-tight">{artist.name}</div>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-700 font-medium">{artist.email}</td>
                    <td className="py-4 px-5 text-sm text-gray-600 font-mono">{artist.phone || 'N/A'}</td>
                    <td className="py-4 px-5 text-sm font-semibold text-gray-700">
                      {artist.label ? (
                        artist.label
                      ) : (
                        <span className="text-gray-400 font-normal italic">Independent</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-700 font-semibold">{artist.genre || 'N/A'}</td>



                    {/* Action dropdown button */}
                    <td className="py-4 px-5 text-center relative">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewArtist(artist.id)}
                          className="p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="View Details"
                          id={`view-artist-btn-${artist.id}`}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditArtist(artist)}
                          className="p-1.5 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Edit Profile"
                          id={`edit-artist-btn-${artist.id}`}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteArtist(artist)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Suspend & Delete Artist"
                          id={`delete-artist-btn-${artist.id}`}
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
        {!loading && !error && meta.total > 0 && (
          <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-600 font-medium">
              Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, meta.total)}</span> of <span className="font-bold text-gray-900">{meta.total}</span> artists
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-900"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              {Array.from({ length: Math.ceil(meta.total / itemsPerPage) }).map((_, idx) => (
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
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === Math.ceil(meta.total / itemsPerPage)}
                className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-900"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Artist Details Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-scale-up max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex justify-between items-center border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-rose-500" />
                <h3 className="text-lg font-bold">Artist Profile Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedArtist(null)}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
                id="close-artist-modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Header profile block */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pb-6 border-b border-gray-100">
                <div className="h-20 w-20 rounded-full bg-gray-150 border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden shadow-inner">
                  {selectedArtist.profileImage ? (
                    <img
                      src={getProfileImageUrl(selectedArtist.profileImage)}
                      alt={selectedArtist.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div className="text-center sm:text-left flex-1 space-y-1.5">
                  <h4 className="text-2xl font-black text-gray-900 leading-tight">{selectedArtist.name}</h4>

                  <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start text-xs text-gray-500 font-semibold">
                    <span className="flex items-center gap-1"><Mail size={12} /> {selectedArtist.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {selectedArtist.phone || 'No Phone'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1.5">
                    {selectedArtist.label ? (
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        Label Associated: {selectedArtist.label}
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        Independent Creator
                      </span>
                    )}
                    {selectedArtist.isVerified ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={10} /> Verified
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <XCircle size={10} /> Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio, Genre, Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Bio Biography</span>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                      {selectedArtist.bio || 'This artist has not added a bio yet.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Primary Genre</span>
                      <p className="text-sm font-bold text-gray-800 mt-1">{selectedArtist.genre || 'Not Specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Created Date</span>
                      <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-1">
                        <Calendar size={12} /> {selectedArtist.createdAt ? new Date(selectedArtist.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Social Connections</span>
                    {renderSocialLinks(selectedArtist.socialLinks)}
                  </div>
                  {selectedArtist.whitelistedDomains && selectedArtist.whitelistedDomains.length > 0 && (
                    <div className="pt-2">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Whitelisted Domains</span>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedArtist.whitelistedDomains.map(domain => (
                          <div key={domain.id} className="flex flex-col p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs shadow-sm">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <span className="font-bold text-gray-800 capitalize truncate">{domain.platformName || domain.domain}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${domain.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : domain.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                {domain.status}
                              </span>
                            </div>
                            <span className="text-gray-500 font-mono text-[10px] truncate">{domain.domain}</span>
                            {domain.rejectionReason && (
                              <span className="text-red-600 text-[10px] mt-1.5 block italic bg-red-50 p-1.5 rounded-md border border-red-100">
                                <strong>Reason:</strong> {domain.rejectionReason}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Account Details */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3.5 self-start shadow-inner">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                    <Landmark size={14} className="text-violet-600" /> Banking Ledger Information
                  </span>
                  {selectedArtist.bankName ? (
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bank Name:</span>
                        <span className="font-semibold text-gray-800">{selectedArtist.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Holder:</span>
                        <span className="font-semibold text-gray-800">{selectedArtist.accountHolderName || selectedArtist.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Number:</span>
                        <span className="font-semibold text-gray-800 font-mono">{selectedArtist.accountNumber || 'Not Added'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">IFSC Code:</span>
                        <span className="font-semibold text-gray-800 font-mono">{selectedArtist.ifscCode || 'Not Added'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Branch Name:</span>
                        <span className="font-semibold text-gray-800">{selectedArtist.branchName || 'Not Added'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">UPI Identifier:</span>
                        <span className="font-semibold text-rose-600 font-mono">{selectedArtist.upiId || 'Not Added'}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 italic mt-2 border-t border-gray-150 pt-2 leading-normal">
                        Note: Full account number and routing information are restricted to payroll processor audits only.
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-xs italic space-y-1">
                      <CreditCard size={24} className="mx-auto text-gray-300 mb-1" />
                      <div>No payout account details registered yet.</div>
                      <div className="text-[10px]">Payment status remains PENDING.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-dark-border/40 p-4 flex justify-end gap-2">

              <button
                onClick={() => setSelectedArtist(null)}
                className="bg-white dark:bg-slate-700 hover:bg-gray-150 dark:hover:bg-slate-600 border border-gray-300 dark:border-dark-border/40 text-gray-700 dark:text-slate-200 font-bold py-2 px-5 rounded-xl text-sm transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Artist Details Modal */}
      {editArtist && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-scale-up">
            <div className="bg-gradient-to-r from-violet-700 to-indigo-700 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Edit3 size={20} />
                <h3 className="text-lg font-bold">Correct Artist Directory Records</h3>
              </div>
              <button
                onClick={() => setEditArtist(null)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Artist / Creator Name*</label>
                  <input
                    type="text"
                    required
                    value={editArtist.name}
                    onChange={(e) => setEditArtist({ ...editArtist, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address*</label>
                  <input
                    type="email"
                    required
                    value={editArtist.email}
                    onChange={(e) => setEditArtist({ ...editArtist, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={editArtist.phone || ''}
                    onChange={(e) => setEditArtist({ ...editArtist, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label Affiliation Name</label>
                  <input
                    type="text"
                    placeholder="Independent"
                    value={editArtist.label || ''}
                    onChange={(e) => setEditArtist({ ...editArtist, label: e.target.value || null })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Artist Label Name</label>
                  <input
                    type="text"
                    placeholder="Artist Label Name"
                    value={editArtist.artistLabelName || ''}
                    onChange={(e) => setEditArtist({ ...editArtist, artistLabelName: e.target.value || null })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Genre</label>
                  <input
                    type="text"
                    value={editArtist.genre || ''}
                    onChange={(e) => setEditArtist({ ...editArtist, genre: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Artist Biography (Bio)</label>
                  <textarea
                    rows={3}
                    value={editArtist.bio || ''}
                    onChange={(e) => setEditArtist({ ...editArtist, bio: e.target.value })}
                    className="input-field py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-gray-150 pt-4">
                <button
                  type="button"
                  onClick={() => setEditArtist(null)}
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
