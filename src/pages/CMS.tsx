import { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Edit2, DollarSign, AlertCircle, Sparkles, FileText } from 'lucide-react';

interface SectionContent {
  title: string;
  subtitle: string;
  imageUrl: string;
}

interface CMSContent {
  hero: SectionContent;
  about: SectionContent;
  features: SectionContent;
}

interface PricingPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PricingPlanForm {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
}

export default function CMS() {
  const [activeTab, setActiveTab] = useState<'content' | 'pricing'>('content');
  
  // Website Content states
  const [content, setContent] = useState<CMSContent>({
    hero: { title: '', subtitle: '', imageUrl: '' },
    about: { title: '', subtitle: '', imageUrl: '' },
    features: { title: '', subtitle: '', imageUrl: '' },
  });
  const [sectionIds, setSectionIds] = useState<{
    hero?: number;
    about?: number;
    features?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<'hero' | 'about' | 'features' | null>(null);

  // Pricing Plans states
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [planFormData, setPlanFormData] = useState<PricingPlanForm>({
    name: '',
    description: '',
    price: '',
    isActive: true,
  });

  useEffect(() => {
    fetchContent();
    fetchPlans();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Try to fetch from new section-based API first
      try {
        const response = await axios.get('/api/admin/content');
        const responseData = response.data;
        if (responseData && responseData.success && Array.isArray(responseData.data)) {
          const heroSec = responseData.data.find((item: any) => item.section === 'hero');
          const aboutSec = responseData.data.find((item: any) => item.section === 'about');
          const featuresSec = responseData.data.find((item: any) => item.section === 'features');
          
          setContent({
            hero: {
              title: heroSec?.content?.title || '',
              subtitle: heroSec?.content?.subtitle || '',
              imageUrl: heroSec?.content?.imageUrl || '',
            },
            about: {
              title: aboutSec?.content?.title || '',
              subtitle: aboutSec?.content?.subtitle || '',
              imageUrl: aboutSec?.content?.imageUrl || '',
            },
            features: {
              title: featuresSec?.content?.title || '',
              subtitle: featuresSec?.content?.subtitle || '',
              imageUrl: featuresSec?.content?.imageUrl || '',
            }
          });
          setSectionIds({
            hero: heroSec?.id,
            about: aboutSec?.id,
            features: featuresSec?.id,
          });
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch from /api/admin/content, trying legacy fallback', err);
      }

      // Legacy fallback
      const response = await axios.get('/api/admin/cms');
      const responseData = response.data;
      if (responseData && responseData.success === true && responseData.data) {
        setContent({
          hero: {
            title: responseData.data.hero_title || '',
            subtitle: responseData.data.hero_subtitle || '',
            imageUrl: responseData.data.hero_image_url || '',
          },
          about: {
            title: 'About Us',
            subtitle: responseData.data.about_text || '',
            imageUrl: '',
          },
          features: {
            title: 'Features',
            subtitle: Array.isArray(responseData.data.features) ? responseData.data.features.join(', ') : '',
            imageUrl: '',
          }
        });
      } else {
        setContent({
          hero: { title: '', subtitle: '', imageUrl: '' },
          about: { title: '', subtitle: '', imageUrl: '' },
          features: { title: '', subtitle: '', imageUrl: '' },
        });
      }
    } catch (error) {
      console.error('Failed to fetch CMS content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await axios.get('/api/admin/pricing-plans');
      const responseData = response.data;
      
      if (responseData) {
        if (responseData.success === true && Array.isArray(responseData.data)) {
          setPlans(responseData.data);
        } else if (Array.isArray(responseData)) {
          setPlans(responseData);
        } else if (Array.isArray(responseData.data)) {
          setPlans(responseData.data);
        } else {
          setPlans([]);
        }
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleDeleteSection = async (section: 'hero' | 'about' | 'features') => {
    const id = sectionIds[section];
    if (!id) {
      // If it doesn't have an ID in the database yet, just clear the local fields
      setContent(prev => ({
        ...prev,
        [section]: { title: '', subtitle: '', imageUrl: '' }
      }));
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the ${section} section content?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/content/${id}`);
      const responseData = response.data;
      if (responseData && responseData.success) {
        alert(`${section.charAt(0).toUpperCase() + section.slice(1)} section content deleted successfully`);
        setContent(prev => ({
          ...prev,
          [section]: { title: '', subtitle: '', imageUrl: '' }
        }));
        setSectionIds(prev => ({
          ...prev,
          [section]: undefined
        }));
      } else {
        alert('Failed to delete content');
      }
    } catch (error) {
      console.error('Failed to delete section content:', error);
      alert('Failed to delete section content');
    }
  };

  const handleSaveContent = async (section: 'hero' | 'about' | 'features') => {
    setSavingSection(section);
    try {
      let savedNewApi = false;
      // Try to save via the new /api/admin/content endpoint
      try {
        await axios.post('/api/admin/content', {
          section: section,
          content: {
            title: content[section].title,
            subtitle: content[section].subtitle,
            imageUrl: content[section].imageUrl,
          }
        });
        savedNewApi = true;
      } catch (err) {
        console.warn('Failed to save to /api/admin/content, trying legacy fallback', err);
      }

      // Legacy fallback sync
      try {
        const legacyPayload = {
          hero_title: content.hero.title,
          hero_subtitle: content.hero.subtitle,
          hero_image_url: content.hero.imageUrl,
          about_text: content.about.subtitle,
          features: content.features.subtitle.split(',').map(f => f.trim()).filter(Boolean),
        };
        await axios.put('/api/admin/cms', legacyPayload);
      } catch (cmsErr) {
        console.error('Legacy /api/admin/cms sync failed:', cmsErr);
        if (!savedNewApi) {
          throw new Error('Failed to save content on both new and legacy endpoints');
        }
      }

      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} content saved successfully`);
      fetchContent();
    } catch (error) {
      alert(`Failed to save ${section} content`);
    } finally {
      setSavingSection(null);
    }
  };

  // Pricing Plan Handlers
  const handleAddOrUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormData.name.trim() || !planFormData.price) return;

    const priceNum = parseFloat(planFormData.price);
    if (isNaN(priceNum)) {
      alert('Please enter a valid price');
      return;
    }

    const payload = {
      name: planFormData.name.trim(),
      description: planFormData.description.trim(),
      price: priceNum,
      isActive: planFormData.isActive,
    };

    try {
      if (editingPlan) {
        await axios.put(`/api/admin/pricing-plans/${editingPlan.id}`, payload);
        alert('Pricing plan updated successfully');
      } else {
        await axios.post('/api/admin/pricing-plans', payload);
        alert('Pricing plan created successfully');
      }
      setPlanFormData({ name: '', description: '', price: '', isActive: true });
      setShowPlanForm(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Failed to save pricing plan:', error);
      alert('Failed to save pricing plan. Please try again.');
    }
  };

  const handleEditClick = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      isActive: plan.isActive,
    });
    setShowPlanForm(true);
  };

  const handleToggleActive = async (plan: PricingPlan) => {
    try {
      const updated = {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        isActive: !plan.isActive,
      };
      await axios.put(`/api/admin/pricing-plans/${plan.id}`, updated);
      fetchPlans();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to toggle plan status');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this pricing plan?')) {
      return;
    }
    try {
      const response = await axios.delete(`/api/admin/pricing-plans/${id}`);
      const responseData = response.data;
      if (responseData && responseData.success) {
        alert(responseData.message || 'Pricing plan deleted successfully');
      } else {
        alert('Pricing plan deleted successfully');
      }
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete pricing plan:', error);
      alert('Failed to delete pricing plan');
    }
  };

  const getPlanDate = (plan: PricingPlan) => {
    const dateStr = plan.createdAt || plan.updatedAt;
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleImageUpload = (section: 'hero' | 'about' | 'features', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({
          ...prev,
          [section]: { ...prev[section], imageUrl: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {/* Header section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Content & Pricing Panel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'content'
              ? 'Manage public landing page sections and core feature items'
              : 'Configure membership pricing rates and features available to creators'}
          </p>
        </div>

        {activeTab === 'content' ? null : (
          <button
            onClick={() => {
              setEditingPlan(null);
              setPlanFormData({ name: '', description: '', price: '', isActive: true });
              setShowPlanForm(!showPlanForm);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Pricing Plan
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-dark-border/40 pb-px mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 pb-3 px-1 font-semibold text-sm transition-all relative ${
            activeTab === 'content'
              ? 'text-rose-600 dark:text-rose-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText size={18} />
          Website Content
          {activeTab === 'content' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 pb-3 px-1 font-semibold text-sm transition-all relative ${
            activeTab === 'pricing'
              ? 'text-rose-600 dark:text-rose-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <DollarSign size={18} />
          Pricing Plans
          {activeTab === 'pricing' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Content Rendering */}
      {activeTab === 'content' ? (
        loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2">
            {/* Hero Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Hero Section</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveContent('hero')}
                    disabled={savingSection === 'hero'}
                    className="btn-primary py-1.5 px-3 text-xs inline-flex items-center"
                  >
                    <Save size={14} className="mr-1.5 inline" />
                    {savingSection === 'hero' ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => handleDeleteSection('hero')}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
                    title="Delete Hero Section Content"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, title: e.target.value }
                    })}
                    className="input-field"
                    placeholder="Main headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                  <textarea
                    rows={3}
                    value={content.hero.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, subtitle: e.target.value }
                    })}
                    className="input-field"
                    placeholder="Subtitle text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('hero', e)}
                    className="input-field"
                  />
                </div>
                {content.hero.imageUrl && (
                  <div className="mt-3">
                    <span className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Banner Image Preview</span>
                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                      <img 
                        src={content.hero.imageUrl} 
                        alt="Hero Banner Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">About Section</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveContent('about')}
                    disabled={savingSection === 'about'}
                    className="btn-primary py-1.5 px-3 text-xs inline-flex items-center"
                  >
                    <Save size={14} className="mr-1.5 inline" />
                    {savingSection === 'about' ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => handleDeleteSection('about')}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
                    title="Delete About Section Content"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">About Title</label>
                  <input
                    type="text"
                    value={content.about.title}
                    onChange={(e) => setContent({
                      ...content,
                      about: { ...content.about, title: e.target.value }
                    })}
                    className="input-field"
                    placeholder="About headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">About Subtitle / Description</label>
                  <textarea
                    rows={4}
                    value={content.about.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      about: { ...content.about, subtitle: e.target.value }
                    })}
                    className="input-field"
                    placeholder="About description text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">About Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('about', e)}
                    className="input-field"
                  />
                </div>
                {content.about.imageUrl && (
                  <div className="mt-3">
                    <span className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">About Image Preview</span>
                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                      <img 
                        src={content.about.imageUrl} 
                        alt="About Image Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Features Section</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveContent('features')}
                    disabled={savingSection === 'features'}
                    className="btn-primary py-1.5 px-3 text-xs inline-flex items-center"
                  >
                    <Save size={14} className="mr-1.5 inline" />
                    {savingSection === 'features' ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => handleDeleteSection('features')}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
                    title="Delete Features Section Content"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Features Title</label>
                  <input
                    type="text"
                    value={content.features.title}
                    onChange={(e) => setContent({
                      ...content,
                      features: { ...content.features, title: e.target.value }
                    })}
                    className="input-field"
                    placeholder="Features headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Features Subtitle / List (comma-separated)</label>
                  <textarea
                    rows={3}
                    value={content.features.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      features: { ...content.features, subtitle: e.target.value }
                    })}
                    className="input-field"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Features Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('features', e)}
                    className="input-field"
                  />
                </div>
                {content.features.imageUrl && (
                  <div className="mt-3">
                    <span className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Features Image Preview</span>
                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                      <img 
                        src={content.features.imageUrl} 
                        alt="Features Image Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        /* Pricing tab rendering */
        <div className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2">
          {/* Add / Edit Form */}
          {showPlanForm && (
            <div className="card border border-rose-500/20 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-rose-500 animate-pulse-soft" size={18} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
                </h2>
              </div>
              <form onSubmit={handleAddOrUpdatePlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Plan Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={planFormData.name}
                      onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Pro Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Monthly Price ($USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                        $
                      </span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={planFormData.price}
                        onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                        className="input-field pl-8"
                        placeholder="e.g. 19.99"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Description / Feature summary
                  </label>
                  <textarea
                    rows={3}
                    value={planFormData.description}
                    onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                    className="input-field"
                    placeholder="Describe what features, limits, and options this plan grants to the subscriber."
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => setPlanFormData({ ...planFormData, isActive: !planFormData.isActive })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      planFormData.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        planFormData.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mark plan active immediately (visible to creators)
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary">
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlanForm(false);
                      setEditingPlan(null);
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {plansLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fetching plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="card text-center py-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">No Pricing Plans</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-sm">
                  There are no plans registered on the server. Click "Add Pricing Plan" above to create your first subscription tier.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="card relative flex flex-col justify-between hover:shadow-lg hover:border-rose-500/20 group transition-all duration-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            ${typeof plan.price === 'number' ? plan.price.toFixed(2) : plan.price}
                          </span>
                          <span className="text-sm text-slate-400 font-medium">/month</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleToggleActive(plan)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          plan.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            plan.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                      {plan.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-dark-border/20 pt-4 flex justify-between items-center text-xs">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold w-max ${
                        plan.isActive
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/20'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {getPlanDate(plan) && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          Added: {getPlanDate(plan)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-200"
                        title="Edit Plan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

