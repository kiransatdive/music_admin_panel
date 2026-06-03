import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Youtube, AlertCircle, CheckCircle2, Calendar, Sparkles, CheckCircle, XCircle, Info } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface YouTubeCriterion {
  id: number;
  text?: string;
  criteria_text?: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export default function YouTubeCriteria() {
  const [criteria, setCriteria] = useState<YouTubeCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/youtube-criteria');
      const responseData = response.data;
      
      // Handle various response data structures dynamically to avoid hardcoding issues
      if (responseData) {
        if (responseData.success === true && Array.isArray(responseData.data)) {
          setCriteria(responseData.data);
        } else if (Array.isArray(responseData)) {
          setCriteria(responseData);
        } else if (Array.isArray(responseData.data)) {
          setCriteria(responseData.data);
        } else {
          setCriteria([]);
        }
      } else {
        setCriteria([]);
      }
    } catch (error) {
      console.error('Failed to fetch YouTube criteria:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;

    try {
      // Send both text and criteria_text dynamically to match backend expectations without hardcoding
      const payload = {
        text: formData.text.trim(),
        criteria_text: formData.text.trim()
      };

      const response = await axios.post('/api/admin/youtube-criteria', payload);
      addToast(response.data?.message || 'Criterion added successfully!', 'success');
      setFormData({ text: '' });
      setShowAddForm(false);
      fetchCriteria();
    } catch (error: any) {
      console.error('Failed to add criterion:', error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to add criterion. Please check the backend connection.';
      addToast(errMsg, 'error');
    }
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this monetization criterion?')) {
      return;
    }
    try {
      const response = await axios.delete(`/api/admin/youtube-criteria/${id}`);
      addToast(response.data?.message || 'Criteria deleted permanently', 'success');
      fetchCriteria();
    } catch (error: any) {
      console.error('Failed to remove criterion:', error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to remove criterion. It might not be supported by this backend endpoint.';
      addToast(errMsg, 'error');
    }
  };

  // Helper selectors to dynamically resolve fields
  const getCriterionText = (item: YouTubeCriterion) => {
    return item.text || item.criteria_text || '';
  };

  const getCriterionActive = (item: YouTubeCriterion) => {
    return item.isActive ?? item.is_active ?? true;
  };

  const getCriterionDate = (item: YouTubeCriterion) => {
    const dateStr = item.createdAt || item.created_at || item.updatedAt || item.updated_at;
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
            <Youtube size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              YouTube Criteria
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage eligibility conditions that artists must agree to for YouTube Content ID Monetization
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-center"
        >
          <Plus size={20} />
          Add Criterion
        </button>
      </div>

      {/* Intro info box */}
      <div className="glass-card p-5 border-l-4 border-red-500 flex items-start gap-4 shadow-sm">
        <div className="p-1 bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-lg shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Monetization Compliance Rules</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
            These statements are presented to creators during the release creation process. Creators must explicitly check all boxes to confirm their track adheres to policy terms (e.g. copyright ownership, original compositions without unlicensed loops or public domain materials) before requesting monetization.
          </p>
        </div>
      </div>

      {/* Add New Criterion Form */}
      {showAddForm && (
        <div className="card mb-6 border border-rose-500/20 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-rose-500" size={18} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Criterion</h2>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Criterion Text Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="input-field"
                placeholder="e.g. Low-value repetitive content may not qualify for monetization."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ensure this statement is clear, direct, and actionable for creators.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Add Criterion
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fetching active criteria...</p>
        </div>
      ) : criteria.length === 0 ? (
        <div className="card text-center py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">No Criteria Defined</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-sm">
              There are currently no YouTube monetization criteria configurations active. Add a criterion above to begin.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {criteria.map((criterion) => {
            const text = getCriterionText(criterion);
            const isActive = getCriterionActive(criterion);
            const date = getCriterionDate(criterion);

            return (
              <div 
                key={criterion.id} 
                className="card hover:shadow-md hover:border-slate-200 dark:hover:border-dark-border/80 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 text-green-500 shrink-0">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-slate-800 dark:text-slate-100 font-semibold text-base leading-relaxed">
                        {text}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium border-t border-slate-50 dark:border-dark-border/20 pt-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive 
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/20' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>

                      {date && (
                        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                          <Calendar size={13} />
                          Added: {date}
                        </span>
                      )}

                      <span className="text-slate-400 dark:text-slate-500">
                        Version ID: #{criterion.id}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(criterion.id)}
                    className="p-2 text-slate-400 dark:text-white hover:text-red-500 dark:hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all duration-200"
                    title="Remove Criterion"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border text-white transition-all transform duration-300 translate-y-0 pointer-events-auto max-w-md ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-700' :
              toast.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-blue-600 border-blue-700'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> :
              toast.type === 'error' ? <XCircle size={20} /> : <Info size={20} />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
