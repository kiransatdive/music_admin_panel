import { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Edit2, DollarSign, AlertCircle, Sparkles, FileText } from 'lucide-react';

interface SectionContent {
  title: string;
  subtitle: string;
  imageUrl: string;
  trustText?: string;
  button1Link?: string;
  button1Text?: string;
  button2Link?: string;
  button2Text?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  logos?: { name: string; image: string; }[];
  badgeText?: string;
  buttonLink?: string;
  buttonText?: string;
  featuresList?: string[];
  mediaCard?: { title: string; subtitle: string; videoUrl: string; thumbnailImage: string; thumbnailVideo?: string; };
  faqs?: { question: string; answer: string; }[];
  updatedAt?: string;
  floatingLogos?: string[];
  youtubeFeatures?: { title: string; description: string; }[];
  artistImages?: { name: string; image: string; }[];
}

interface CMSContent {
  hero: SectionContent;
  trusted_logos: SectionContent;
  about: SectionContent;
  features: SectionContent;
  distribution_features: SectionContent;
  youtube_services: SectionContent;
  our_artists: SectionContent;
  faq: SectionContent;
}

interface PricingPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  priceText?: string;
  duration?: string;
  revenueShare?: string;
  buttonText?: string;
  buttonLink?: string;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface PricingPlanForm {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
  priceText: string;
  duration: string;
  revenueShare: string;
  buttonText: string;
  buttonLink: string;
  features: string[];
}

export default function CMS() {
  const [activeTab, setActiveTab] = useState<'content' | 'pricing'>('content');
  
  // Website Content states
  const [content, setContent] = useState<CMSContent>({
    hero: { title: '', subtitle: '', imageUrl: '', trustText: '', button1Link: '', button1Text: '', button2Link: '', button2Text: '', backgroundImage: '', backgroundVideo: '' },
    trusted_logos: { title: '', subtitle: '', imageUrl: '', logos: [] },
    about: { title: '', subtitle: '', imageUrl: '' },
    features: { title: '', subtitle: '', imageUrl: '' },
    distribution_features: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', featuresList: [], floatingLogos: [] },
    youtube_services: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', mediaCard: { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' }, youtubeFeatures: [] },
    our_artists: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', artistImages: [] },
    faq: { title: '', subtitle: '', imageUrl: '', badgeText: '', faqs: [] },
  });
  const [sectionIds, setSectionIds] = useState<{
    hero?: number;
    trusted_logos?: number;
    about?: number;
    features?: number;
    distribution_features?: number;
    youtube_services?: number;
    our_artists?: number;
    faq?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<'hero' | 'trusted_logos' | 'about' | 'features' | 'distribution_features' | 'youtube_services' | 'our_artists' | 'faq' | null>(null);
  const [editingSection, setEditingSection] = useState<'hero' | 'trusted_logos' | 'about' | 'features' | 'distribution_features' | 'youtube_services' | 'our_artists' | 'faq' | null>(null);

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
    priceText: '',
    duration: '',
    revenueShare: '',
    buttonText: '',
    buttonLink: '',
    features: [],
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
          const trustedLogosSec = responseData.data.find((item: any) => item.section === 'trusted_logos');
          const aboutSec = responseData.data.find((item: any) => item.section === 'about');
          const featuresSec = responseData.data.find((item: any) => item.section === 'features');
          const distributionSec = responseData.data.find((item: any) => item.section === 'distribution_features');
          const youtubeSec = responseData.data.find((item: any) => item.section === 'youtube_services');
          const ourArtistsSec = responseData.data.find((item: any) => item.section === 'our_artists');
          const faqSec = responseData.data.find((item: any) => item.section === 'faq');
          
          setContent({
            hero: {
              title: heroSec?.content?.title || '',
              subtitle: heroSec?.content?.subtitle || '',
              imageUrl: heroSec?.content?.imageUrl || '',
              trustText: heroSec?.content?.trustText || '',
              button1Link: heroSec?.content?.button1Link || '',
              button1Text: heroSec?.content?.button1Text || '',
              button2Link: heroSec?.content?.button2Link || '',
              button2Text: heroSec?.content?.button2Text || '',
              backgroundImage: heroSec?.content?.backgroundImage || '',
              backgroundVideo: heroSec?.content?.backgroundVideo || '',
              updatedAt: heroSec?.updatedAt || '',
            },
            trusted_logos: {
              title: trustedLogosSec?.content?.title || '',
              subtitle: '',
              imageUrl: '',
              logos: trustedLogosSec?.content?.logos || [],
              updatedAt: trustedLogosSec?.updatedAt || '',
            },
            about: {
              title: aboutSec?.content?.title || '',
              subtitle: aboutSec?.content?.subtitle || '',
              imageUrl: aboutSec?.content?.imageUrl || '',
              updatedAt: aboutSec?.updatedAt || '',
            },
            features: {
              title: featuresSec?.content?.title || '',
              subtitle: featuresSec?.content?.subtitle || '',
              imageUrl: featuresSec?.content?.imageUrl || '',
              updatedAt: featuresSec?.updatedAt || '',
            },
            distribution_features: {
              title: distributionSec?.content?.title || '',
              subtitle: distributionSec?.content?.subtitle || '',
              imageUrl: '',
              badgeText: distributionSec?.content?.badgeText || '',
              buttonLink: distributionSec?.content?.buttonLink || '',
              buttonText: distributionSec?.content?.buttonText || '',
              featuresList: distributionSec?.content?.featuresList || [],
              floatingLogos: distributionSec?.content?.floatingLogos || [],
              updatedAt: distributionSec?.updatedAt || '',
            },
            youtube_services: {
              title: youtubeSec?.content?.title || '',
              subtitle: youtubeSec?.content?.subtitle || '',
              imageUrl: '',
              badgeText: youtubeSec?.content?.badgeText || '',
              buttonLink: youtubeSec?.content?.buttonLink || '',
              buttonText: youtubeSec?.content?.buttonText || '',
              mediaCard: youtubeSec?.content?.mediaCard || { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' },
              youtubeFeatures: youtubeSec?.content?.featuresList || [],
              updatedAt: youtubeSec?.updatedAt || '',
            },
            our_artists: {
              title: ourArtistsSec?.content?.title || '',
              subtitle: ourArtistsSec?.content?.subtitle || '',
              imageUrl: '',
              badgeText: ourArtistsSec?.content?.badgeText || '',
              buttonLink: ourArtistsSec?.content?.buttonLink || '',
              buttonText: ourArtistsSec?.content?.buttonText || '',
              artistImages: ourArtistsSec?.content?.artistImages || [],
              updatedAt: ourArtistsSec?.updatedAt || '',
            },
            faq: {
              title: faqSec?.content?.title || '',
              subtitle: faqSec?.content?.subtitle || '',
              imageUrl: '',
              badgeText: faqSec?.content?.badgeText || '',
              faqs: faqSec?.content?.faqs || [],
              updatedAt: faqSec?.updatedAt || '',
            }
          });
          setSectionIds({
            hero: heroSec?.id,
            trusted_logos: trustedLogosSec?.id,
            about: aboutSec?.id,
            features: featuresSec?.id,
            distribution_features: distributionSec?.id,
            youtube_services: youtubeSec?.id,
            our_artists: ourArtistsSec?.id,
            faq: faqSec?.id,
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
            trustText: '',
            button1Link: '',
            button1Text: '',
            button2Link: '',
            button2Text: '',
            backgroundImage: '',
            backgroundVideo: '',
          },
          trusted_logos: { title: '', subtitle: '', imageUrl: '', logos: [] },
          about: {
            title: 'About Us',
            subtitle: responseData.data.about_text || '',
            imageUrl: '',
          },
          features: {
            title: 'Features',
            subtitle: Array.isArray(responseData.data.features) ? responseData.data.features.join(', ') : '',
            imageUrl: '',
          },
          distribution_features: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', featuresList: [], floatingLogos: [] },
          youtube_services: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', mediaCard: { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' }, youtubeFeatures: [] },
          our_artists: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', artistImages: [] },
          faq: { title: '', subtitle: '', imageUrl: '', badgeText: '', faqs: [] },
        });
      } else {
        setContent({
          hero: { title: '', subtitle: '', imageUrl: '', trustText: '', button1Link: '', button1Text: '', button2Link: '', button2Text: '', backgroundImage: '', backgroundVideo: '' },
          trusted_logos: { title: '', subtitle: '', imageUrl: '', logos: [] },
          about: { title: '', subtitle: '', imageUrl: '' },
          features: { title: '', subtitle: '', imageUrl: '' },
          distribution_features: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', featuresList: [], floatingLogos: [] },
          youtube_services: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', mediaCard: { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' }, youtubeFeatures: [] },
          our_artists: { title: '', subtitle: '', imageUrl: '', badgeText: '', buttonLink: '', buttonText: '', artistImages: [] },
          faq: { title: '', subtitle: '', imageUrl: '', badgeText: '', faqs: [] },
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

  const handleDeleteSection = async (section: 'hero' | 'trusted_logos' | 'about' | 'features' | 'distribution_features' | 'youtube_services' | 'our_artists' | 'faq') => {
    const id = sectionIds[section];
    if (!id) {
      // If it doesn't have an ID in the database yet, just clear the local fields
      setContent(prev => ({
        ...prev,
        [section]: { title: '', subtitle: '', imageUrl: '', trustText: '', button1Link: '', button1Text: '', button2Link: '', button2Text: '', backgroundImage: '', backgroundVideo: '', logos: [] }
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
          [section]: { title: '', subtitle: '', imageUrl: '', trustText: '', button1Link: '', button1Text: '', button2Link: '', button2Text: '', backgroundImage: '', backgroundVideo: '', logos: [] }
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

  const handleSaveContent = async (section: 'hero' | 'trusted_logos' | 'about' | 'features' | 'distribution_features' | 'youtube_services' | 'our_artists' | 'faq') => {
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
            ...(section === 'trusted_logos' ? { logos: content[section].logos } : {}),
            ...(section === 'hero' ? {
              trustText: content[section].trustText,
              button1Link: content[section].button1Link,
              button1Text: content[section].button1Text,
              button2Link: content[section].button2Link,
              button2Text: content[section].button2Text,
              backgroundImage: content[section].backgroundImage,
              backgroundVideo: content[section].backgroundVideo,
            } : {}),
            ...(section === 'distribution_features' ? {
              badgeText: content[section].badgeText,
              buttonLink: content[section].buttonLink,
              buttonText: content[section].buttonText,
              featuresList: content[section].featuresList,
              floatingLogos: content[section].floatingLogos,
            } : {}),
            ...(section === 'youtube_services' ? {
              badgeText: content[section].badgeText,
              buttonLink: content[section].buttonLink,
              buttonText: content[section].buttonText,
              mediaCard: content[section].mediaCard,
              featuresList: content[section].youtubeFeatures,
            } : {}),
            ...(section === 'our_artists' ? {
              badgeText: content[section].badgeText,
              buttonLink: content[section].buttonLink,
              buttonText: content[section].buttonText,
              artistImages: content[section].artistImages,
            } : {}),
            ...(section === 'faq' ? {
              badgeText: content[section].badgeText,
              faqs: content[section].faqs,
            } : {})
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
      setEditingSection(null);
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
      priceText: planFormData.priceText.trim(),
      duration: planFormData.duration.trim(),
      revenueShare: planFormData.revenueShare.trim(),
      buttonText: planFormData.buttonText.trim(),
      buttonLink: planFormData.buttonLink.trim(),
      features: planFormData.features,
    };

    try {
      if (editingPlan) {
        await axios.put(`/api/admin/pricing-plans/${editingPlan.id}`, payload);
        alert('Pricing plan updated successfully');
      } else {
        await axios.post('/api/admin/pricing-plans', payload);
        alert('Pricing plan created successfully');
      }
      setPlanFormData({ name: '', description: '', price: '', isActive: true, priceText: '', duration: '', revenueShare: '', buttonText: '', buttonLink: '', features: [] });
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
      priceText: plan.priceText || '',
      duration: plan.duration || '',
      revenueShare: plan.revenueShare || '',
      buttonText: plan.buttonText || '',
      buttonLink: plan.buttonLink || '',
      features: plan.features || [],
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

  const handleHeroMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({
          ...prev,
          hero: { 
            ...prev.hero, 
            ...(isVideo 
              ? { backgroundVideo: reader.result as string, imageUrl: '' } 
              : { imageUrl: reader.result as string, backgroundVideo: '' }) 
          }
        }));
      };
      reader.readAsDataURL(file);
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

  const handleLogoImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => {
          const newLogos = [...(prev.trusted_logos.logos || [])];
          newLogos[index] = { ...newLogos[index], image: reader.result as string };
          return {
            ...prev,
            trusted_logos: { ...prev.trusted_logos, logos: newLogos }
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLogo = () => {
    setContent(prev => ({
      ...prev,
      trusted_logos: {
        ...prev.trusted_logos,
        logos: [...(prev.trusted_logos.logos || []), { name: '', image: '' }]
      }
    }));
  };

  const handleRemoveLogo = (index: number) => {
    setContent(prev => {
      const newLogos = [...(prev.trusted_logos.logos || [])];
      newLogos.splice(index, 1);
      return {
        ...prev,
        trusted_logos: { ...prev.trusted_logos, logos: newLogos }
      };
    });
  };

  const handleLogoNameChange = (index: number, name: string) => {
    setContent(prev => {
      const newLogos = [...(prev.trusted_logos.logos || [])];
      newLogos[index] = { ...newLogos[index], name };
      return {
        ...prev,
        trusted_logos: { ...prev.trusted_logos, logos: newLogos }
      };
    });
  };

  const handleAddFeature = () => {
    setContent(prev => ({
      ...prev,
      distribution_features: {
        ...prev.distribution_features,
        featuresList: [...(prev.distribution_features.featuresList || []), '']
      }
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setContent(prev => {
      const newList = [...(prev.distribution_features.featuresList || [])];
      newList.splice(index, 1);
      return { ...prev, distribution_features: { ...prev.distribution_features, featuresList: newList } };
    });
  };

  const handleFeatureChange = (index: number, val: string) => {
    setContent(prev => {
      const newList = [...(prev.distribution_features.featuresList || [])];
      newList[index] = val;
      return { ...prev, distribution_features: { ...prev.distribution_features, featuresList: newList } };
    });
  };

  const handleFloatingLogoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => {
          const newLogos = [...(prev.distribution_features.floatingLogos || [])];
          newLogos[index] = reader.result as string;
          return { ...prev, distribution_features: { ...prev.distribution_features, floatingLogos: newLogos } };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFloatingLogo = () => {
    setContent(prev => ({
      ...prev,
      distribution_features: {
        ...prev.distribution_features,
        floatingLogos: [...(prev.distribution_features.floatingLogos || []), '']
      }
    }));
  };

  const handleRemoveFloatingLogo = (index: number) => {
    setContent(prev => {
      const newLogos = [...(prev.distribution_features.floatingLogos || [])];
      newLogos.splice(index, 1);
      return { ...prev, distribution_features: { ...prev.distribution_features, floatingLogos: newLogos } };
    });
  };

  const handleAddYoutubeFeature = () => {
    setContent(prev => ({
      ...prev,
      youtube_services: {
        ...prev.youtube_services,
        youtubeFeatures: [...(prev.youtube_services.youtubeFeatures || []), { title: '', description: '' }]
      }
    }));
  };

  const handleRemoveYoutubeFeature = (index: number) => {
    setContent(prev => {
      const newList = [...(prev.youtube_services.youtubeFeatures || [])];
      newList.splice(index, 1);
      return { ...prev, youtube_services: { ...prev.youtube_services, youtubeFeatures: newList } };
    });
  };

  const handleYoutubeFeatureChange = (index: number, field: 'title' | 'description', val: string) => {
    setContent(prev => {
      const newList = [...(prev.youtube_services.youtubeFeatures || [])];
      newList[index] = { ...newList[index], [field]: val };
      return { ...prev, youtube_services: { ...prev.youtube_services, youtubeFeatures: newList } };
    });
  };

  const handleYoutubeThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({
          ...prev,
          youtube_services: {
            ...prev.youtube_services,
            mediaCard: {
              ...(prev.youtube_services.mediaCard || { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' }),
              ...(isVideo
                ? { thumbnailVideo: reader.result as string, thumbnailImage: '' }
                : { thumbnailImage: reader.result as string, thumbnailVideo: '' })
            }
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddArtistImage = () => {
    setContent(prev => ({
      ...prev,
      our_artists: {
        ...prev.our_artists,
        artistImages: [...(prev.our_artists.artistImages || []), { name: '', image: '' }]
      }
    }));
  };

  const handleRemoveArtistImage = (index: number) => {
    setContent(prev => {
      const newList = [...(prev.our_artists.artistImages || [])];
      newList.splice(index, 1);
      return { ...prev, our_artists: { ...prev.our_artists, artistImages: newList } };
    });
  };

  const handleArtistImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => {
          const newList = [...(prev.our_artists.artistImages || [])];
          newList[index] = { ...newList[index], image: reader.result as string };
          return { ...prev, our_artists: { ...prev.our_artists, artistImages: newList } };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArtistNameChange = (index: number, name: string) => {
    setContent(prev => {
      const newList = [...(prev.our_artists.artistImages || [])];
      newList[index] = { ...newList[index], name };
      return { ...prev, our_artists: { ...prev.our_artists, artistImages: newList } };
    });
  };

  const handleAddFaq = () => {
    setContent(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        faqs: [...(prev.faq.faqs || []), { question: '', answer: '' }]
      }
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setContent(prev => {
      const newList = [...(prev.faq.faqs || [])];
      newList.splice(index, 1);
      return { ...prev, faq: { ...prev.faq, faqs: newList } };
    });
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', val: string) => {
    setContent(prev => {
      const newList = [...(prev.faq.faqs || [])];
      newList[index] = { ...newList[index], [field]: val };
      return { ...prev, faq: { ...prev.faq, faqs: newList } };
    });
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
              setPlanFormData({ name: '', description: '', price: '', isActive: true, priceText: '', duration: '', revenueShare: '', buttonText: '', buttonLink: '', features: [] });
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(['hero', 'distribution_features', 'youtube_services', 'our_artists', 'faq'] as const).map((section) => (
                <div key={section} className="card relative flex flex-col justify-between hover:shadow-lg hover:border-rose-500/20 group transition-all duration-300">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors capitalize">
                        {section} Section
                      </h3>
                      {content[section].updatedAt && (
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                          {new Date(content[section].updatedAt!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        <strong className="text-slate-700 dark:text-slate-300">Title:</strong> {content[section].title || 'Not set'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                        <strong className="text-slate-700 dark:text-slate-300">Subtitle:</strong> {content[section].subtitle || 'Not set'}
                      </p>

                      {section === 'distribution_features' && (
                        <>
                          {content.distribution_features.badgeText && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">Badge:</strong> {content.distribution_features.badgeText}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.distribution_features.buttonText}>
                              <strong className="text-slate-700 dark:text-slate-300">Btn:</strong> {content.distribution_features.buttonText || '-'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.distribution_features.buttonLink}>
                              <strong className="text-slate-700 dark:text-slate-300">Link:</strong> {content.distribution_features.buttonLink || '-'}
                            </p>
                          </div>
                          {content.distribution_features.featuresList && content.distribution_features.featuresList.length > 0 && (
                            <div className="mt-3">
                              <strong className="text-slate-700 dark:text-slate-300 text-sm block mb-1">Features:</strong>
                              <ul className="list-disc pl-5 text-sm text-slate-500">
                                {content.distribution_features.featuresList.map((f, i) => <li key={i}>{f}</li>)}
                              </ul>
                            </div>
                          )}
                          {content.distribution_features.floatingLogos && content.distribution_features.floatingLogos.length > 0 && (
                            <div className="mt-3">
                              <strong className="text-slate-700 dark:text-slate-300 text-sm block mb-2">Floating Logos:</strong>
                              <div className="flex flex-wrap gap-2">
                                {content.distribution_features.floatingLogos.map((logo, idx) => (
                                  <div key={idx} className="h-8 w-8 rounded bg-white border border-slate-200 flex items-center justify-center p-1 shadow-sm">
                                    {logo ? (
                                      <img src={logo} alt="floating logo" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                      <span className="text-xs text-slate-400 font-medium">?</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {section === 'youtube_services' && (
                        <>
                          {content.youtube_services.badgeText && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">Badge:</strong> {content.youtube_services.badgeText}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.youtube_services.buttonText}>
                              <strong className="text-slate-700 dark:text-slate-300">Btn:</strong> {content.youtube_services.buttonText || '-'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.youtube_services.buttonLink}>
                              <strong className="text-slate-700 dark:text-slate-300">Link:</strong> {content.youtube_services.buttonLink || '-'}
                            </p>
                          </div>
                          {content.youtube_services.youtubeFeatures && content.youtube_services.youtubeFeatures.length > 0 && (
                            <div className="mt-3">
                              <strong className="text-slate-700 dark:text-slate-300 text-sm block mb-1">Features ({content.youtube_services.youtubeFeatures.length}):</strong>
                              <ul className="list-disc pl-5 text-sm text-slate-500">
                                {content.youtube_services.youtubeFeatures.slice(0, 2).map((f, i) => <li key={i} className="truncate">{f.title}</li>)}
                                {content.youtube_services.youtubeFeatures.length > 2 && <li className="text-xs text-slate-400 italic">+{content.youtube_services.youtubeFeatures.length - 2} more</li>}
                              </ul>
                            </div>
                          )}
                          {(content.youtube_services.mediaCard?.title || content.youtube_services.mediaCard?.thumbnailImage || content.youtube_services.mediaCard?.thumbnailVideo) && (
                            <div className="mt-3">
                              <strong className="text-slate-700 dark:text-slate-300 text-sm block mb-2">Media Card Preview:</strong>
                              <div className="flex gap-3 items-center p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
                                {content.youtube_services.mediaCard.thumbnailImage ? (
                                  <img src={content.youtube_services.mediaCard.thumbnailImage} alt="thumbnail" className="w-16 h-10 object-cover rounded" />
                                ) : content.youtube_services.mediaCard.thumbnailVideo ? (
                                  <video src={content.youtube_services.mediaCard.thumbnailVideo} className="w-16 h-10 object-cover rounded" muted />
                                ) : (
                                  <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500">No Media</div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{content.youtube_services.mediaCard.title || 'No Title'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {section === 'our_artists' && (
                        <>
                          {content.our_artists.badgeText && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">Badge:</strong> {content.our_artists.badgeText}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.our_artists.buttonText}>
                              <strong className="text-slate-700 dark:text-slate-300">Btn:</strong> {content.our_artists.buttonText || '-'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.our_artists.buttonLink}>
                              <strong className="text-slate-700 dark:text-slate-300">Link:</strong> {content.our_artists.buttonLink || '-'}
                            </p>
                          </div>
                          {content.our_artists.artistImages && content.our_artists.artistImages.length > 0 && (
                            <div className="mt-3">
                              <strong className="text-slate-700 dark:text-slate-300 text-sm block mb-2">Artist Images ({content.our_artists.artistImages.length}):</strong>
                              <div className="flex flex-wrap gap-2">
                                {content.our_artists.artistImages.map((artist, idx) => (
                                  <div key={idx} className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm" title={artist.name}>
                                    {artist.image ? (
                                      <img src={artist.image} alt={artist.name || "artist"} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] text-slate-500">{artist.name ? artist.name.charAt(0).toUpperCase() : '?'}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {section === 'faq' && (
                        <>
                          {content.faq.badgeText && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">Badge:</strong> {content.faq.badgeText}
                            </p>
                          )}
                          {content.faq.faqs && content.faq.faqs.length > 0 && (
                            <div className="mt-3">
                              <strong className="text-slate-700 dark:text-slate-300 text-sm block mb-1">FAQs ({content.faq.faqs.length}):</strong>
                              <ul className="list-disc pl-5 text-sm text-slate-500">
                                {content.faq.faqs.slice(0, 2).map((faqItem, i) => <li key={i} className="truncate" title={faqItem.answer}>{faqItem.question}</li>)}
                                {content.faq.faqs.length > 2 && <li className="text-xs text-slate-400 italic">+{content.faq.faqs.length - 2} more</li>}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                      {section === 'hero' && (
                        <>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            <strong className="text-slate-700 dark:text-slate-300">Trust Text:</strong> {content.hero.trustText || 'Not set'}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.hero.button1Text}>
                              <strong className="text-slate-700 dark:text-slate-300">Btn 1:</strong> {content.hero.button1Text || '-'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.hero.button1Link}>
                              <strong className="text-slate-700 dark:text-slate-300">Link 1:</strong> {content.hero.button1Link || '-'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.hero.button2Text}>
                              <strong className="text-slate-700 dark:text-slate-300">Btn 2:</strong> {content.hero.button2Text || '-'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={content.hero.button2Link}>
                              <strong className="text-slate-700 dark:text-slate-300">Link 2:</strong> {content.hero.button2Link || '-'}
                            </p>
                          </div>
                        </>
                      )}
                      {section === 'hero' && content.hero.backgroundVideo && (
                        <div className="mt-3 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center">
                          <video src={content.hero.backgroundVideo} className="w-full h-full object-cover" controls muted />
                        </div>
                      )}
                      {content[section].imageUrl && (
                        <div className="mt-3 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center">
                          <img src={content[section].imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-dark-border/20 pt-4 flex justify-end items-center gap-3">
                    <button
                      onClick={() => handleDeleteSection(section)}
                      className="py-2 px-4 text-sm inline-flex items-center text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 shadow-sm border-transparent"
                      title={`Delete ${section} Section`}
                    >
                      <Trash2 size={16} className="mr-2 inline" />
                      Delete
                    </button>
                    <button
                      onClick={() => setEditingSection(section)}
                      className="btn-primary py-2 px-4 text-sm inline-flex items-center"
                      title={`Update ${section} Section`}
                    >
                      <Edit2 size={16} className="mr-2 inline" />
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Edit Form Modal */}
            {editingSection && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="text-rose-500" size={18} />
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                        Update {editingSection} Section
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {editingSection === 'hero' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Hero Title</label>
                            <input
                              type="text"
                              value={content.hero.title}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                              className="input-field"
                              placeholder="Main headline"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                            <textarea
                              rows={3}
                              value={content.hero.subtitle}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                              className="input-field"
                              placeholder="Subtitle text"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Trust Text</label>
                            <input
                              type="text"
                              value={content.hero.trustText || ''}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, trustText: e.target.value } })}
                              className="input-field"
                              placeholder="100,000+ Independent artists trust us globally"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 1 Text</label>
                              <input
                                type="text"
                                value={content.hero.button1Text || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button1Text: e.target.value } })}
                                className="input-field"
                                placeholder="Sign Up Now"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 1 Link</label>
                              <input
                                type="text"
                                value={content.hero.button1Link || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button1Link: e.target.value } })}
                                className="input-field"
                                placeholder="/signup"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 2 Text</label>
                              <input
                                type="text"
                                value={content.hero.button2Text || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button2Text: e.target.value } })}
                                className="input-field"
                                placeholder="Explore Features"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Button 2 Link</label>
                              <input
                                type="text"
                                value={content.hero.button2Link || ''}
                                onChange={(e) => setContent({ ...content, hero: { ...content.hero, button2Link: e.target.value } })}
                                className="input-field"
                                placeholder="/features"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Hero Media (Video or Image)</label>
                            <input
                              type="file"
                              accept="video/*,image/*"
                              onChange={handleHeroMediaUpload}
                              className="input-field"
                            />
                          </div>
                          {content.hero.backgroundVideo && (
                            <div className="mt-3 mb-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Video Preview</span>
                                <button type="button" onClick={() => setContent({ ...content, hero: { ...content.hero, backgroundVideo: '' } })} className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"><Trash2 size={14} /> Delete Video</button>
                              </div>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <video src={content.hero.backgroundVideo} className="w-full h-full object-cover" controls muted />
                              </div>
                            </div>
                          )}
                          {content.hero.imageUrl && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Banner Image Preview</span>
                                <button type="button" onClick={() => setContent({ ...content, hero: { ...content.hero, imageUrl: '' } })} className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"><Trash2 size={14} /> Delete Image</button>
                              </div>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <img src={content.hero.imageUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {editingSection === 'trusted_logos' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Section Title</label>
                            <input
                              type="text"
                              value={content.trusted_logos.title}
                              onChange={(e) => setContent({ ...content, trusted_logos: { ...content.trusted_logos, title: e.target.value } })}
                              className="input-field"
                              placeholder="e.g. TRUSTED BY TOP LABELS & GLOBAL MUSIC DISTRIBUTORS"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-sm font-medium">Logos</label>
                              <button
                                type="button"
                                onClick={handleAddLogo}
                                className="btn-outline py-1.5 px-3 text-xs inline-flex items-center"
                              >
                                <Plus size={14} className="mr-1 inline" /> Add Logo
                              </button>
                            </div>
                            <div className="space-y-4">
                              {(content.trusted_logos.logos || []).map((logo, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                                  <div className="flex-1 space-y-4">
                                    <div>
                                      <label className="block text-xs font-medium mb-1.5 text-slate-500">Logo Name</label>
                                      <input
                                        type="text"
                                        value={logo.name}
                                        onChange={(e) => handleLogoNameChange(index, e.target.value)}
                                        className="input-field py-1.5 text-sm"
                                        placeholder="e.g. Spotify"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1.5 text-slate-500">Logo Image</label>
                                      <div className="flex items-center gap-3">
                                        {logo.image && (
                                          <div className="h-10 w-10 shrink-0 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <img src={logo.image} alt={logo.name || 'Logo'} className="max-w-full max-h-full object-contain p-1" />
                                          </div>
                                        )}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleLogoImageUpload(index, e)}
                                          className="input-field py-1.5 text-sm flex-1"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLogo(index)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Remove logo"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                              {(!content.trusted_logos.logos || content.trusted_logos.logos.length === 0) && (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                  <p className="text-sm text-slate-500">No logos added yet.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {editingSection === 'about' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">About Title</label>
                            <input
                              type="text"
                              value={content.about.title}
                              onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                              className="input-field"
                              placeholder="About headline"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">About Subtitle / Description</label>
                            <textarea
                              rows={4}
                              value={content.about.subtitle}
                              onChange={(e) => setContent({ ...content, about: { ...content.about, subtitle: e.target.value } })}
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
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-slate-400 uppercase">About Image Preview</span>
                                <button type="button" onClick={() => setContent({ ...content, about: { ...content.about, imageUrl: '' } })} className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"><Trash2 size={14} /> Delete Image</button>
                              </div>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <img src={content.about.imageUrl} alt="About Image Preview" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {editingSection === 'features' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Features Title</label>
                            <input
                              type="text"
                              value={content.features.title}
                              onChange={(e) => setContent({ ...content, features: { ...content.features, title: e.target.value } })}
                              className="input-field"
                              placeholder="Features headline"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Features Subtitle / List (comma-separated)</label>
                            <textarea
                              rows={3}
                              value={content.features.subtitle}
                              onChange={(e) => setContent({ ...content, features: { ...content.features, subtitle: e.target.value } })}
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
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Features Image Preview</span>
                                <button type="button" onClick={() => setContent({ ...content, features: { ...content.features, imageUrl: '' } })} className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"><Trash2 size={14} /> Delete Image</button>
                              </div>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center relative group">
                                <img src={content.features.imageUrl} alt="Features Image Preview" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {editingSection === 'distribution_features' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <textarea
                              rows={2}
                              value={content.distribution_features.title}
                              onChange={(e) => setContent({ ...content, distribution_features: { ...content.distribution_features, title: e.target.value } })}
                              className="input-field"
                              placeholder="Engineered for Labels..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Subtitle</label>
                            <textarea
                              rows={3}
                              value={content.distribution_features.subtitle}
                              onChange={(e) => setContent({ ...content, distribution_features: { ...content.distribution_features, subtitle: e.target.value } })}
                              className="input-field"
                              placeholder="Your music deserves to be heard..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Badge Text</label>
                              <input
                                type="text"
                                value={content.distribution_features.badgeText}
                                onChange={(e) => setContent({ ...content, distribution_features: { ...content.distribution_features, badgeText: e.target.value } })}
                                className="input-field"
                                placeholder="REQUIREMENTS"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Button Text</label>
                              <input
                                type="text"
                                value={content.distribution_features.buttonText}
                                onChange={(e) => setContent({ ...content, distribution_features: { ...content.distribution_features, buttonText: e.target.value } })}
                                className="input-field"
                                placeholder="Get Started Now"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-2">Button Link</label>
                              <input
                                type="text"
                                value={content.distribution_features.buttonLink}
                                onChange={(e) => setContent({ ...content, distribution_features: { ...content.distribution_features, buttonLink: e.target.value } })}
                                className="input-field"
                                placeholder="/signup"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-sm font-medium">Features List</label>
                              <button type="button" onClick={handleAddFeature} className="btn-outline py-1.5 px-3 text-xs inline-flex items-center">
                                <Plus size={14} className="mr-1 inline" /> Add Feature
                              </button>
                            </div>
                            <div className="space-y-3">
                              {(content.distribution_features.featuresList || []).map((feature, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    className="input-field py-2 flex-1"
                                    placeholder="Lightning-Fast Global Distribution"
                                  />
                                  <button type="button" onClick={() => handleRemoveFeature(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-sm font-medium">Floating Logos (Images)</label>
                              <button type="button" onClick={handleAddFloatingLogo} className="btn-outline py-1.5 px-3 text-xs inline-flex items-center">
                                <Plus size={14} className="mr-1 inline" /> Add Image
                              </button>
                            </div>
                            <div className="space-y-3">
                              {(content.distribution_features.floatingLogos || []).map((logo, index) => (
                                <div key={index} className="flex gap-3 items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                                  {logo && (
                                    <div className="h-10 w-10 shrink-0 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                      <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFloatingLogoUpload(index, e)}
                                    className="input-field py-1.5 text-sm flex-1"
                                  />
                                  <button type="button" onClick={() => handleRemoveFloatingLogo(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {editingSection === 'youtube_services' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <textarea
                              rows={2}
                              value={content.youtube_services.title}
                              onChange={(e) => setContent({ ...content, youtube_services: { ...content.youtube_services, title: e.target.value } })}
                              className="input-field"
                              placeholder="Maximize Your YouTube Revenue."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Subtitle</label>
                            <textarea
                              rows={3}
                              value={content.youtube_services.subtitle}
                              onChange={(e) => setContent({ ...content, youtube_services: { ...content.youtube_services, subtitle: e.target.value } })}
                              className="input-field"
                              placeholder="Maximize your YouTube revenue with professional channel management..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Badge Text</label>
                              <input
                                type="text"
                                value={content.youtube_services.badgeText}
                                onChange={(e) => setContent({ ...content, youtube_services: { ...content.youtube_services, badgeText: e.target.value } })}
                                className="input-field"
                                placeholder="YOUTUBE MCM SERVICES"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Button Text</label>
                              <input
                                type="text"
                                value={content.youtube_services.buttonText}
                                onChange={(e) => setContent({ ...content, youtube_services: { ...content.youtube_services, buttonText: e.target.value } })}
                                className="input-field"
                                placeholder="Learn More"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-2">Button Link</label>
                              <input
                                type="text"
                                value={content.youtube_services.buttonLink}
                                onChange={(e) => setContent({ ...content, youtube_services: { ...content.youtube_services, buttonLink: e.target.value } })}
                                className="input-field"
                                placeholder="/learn-more"
                              />
                            </div>
                          </div>
                          
                          {/* Media Card Details */}
                          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                            <h4 className="font-semibold text-sm mb-4">Media Card (Video Preview)</h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-medium mb-1.5">Card Title</label>
                                <input
                                  type="text"
                                  value={content.youtube_services.mediaCard?.title || ''}
                                  onChange={(e) => setContent({ ...content, youtube_services: { ...content.youtube_services, mediaCard: { ...(content.youtube_services.mediaCard || { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' }), title: e.target.value } } })}
                                  className="input-field py-1.5 text-sm"
                                  placeholder="Bars and Melody - Thousand Years"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1.5">Card Subtitle</label>
                                <input
                                  type="text"
                                  value={content.youtube_services.mediaCard?.subtitle || ''}
                                  onChange={(e) => setContent({ ...content, youtube_services: { ...content.youtube_services, mediaCard: { ...(content.youtube_services.mediaCard || { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' }), subtitle: e.target.value } } })}
                                  className="input-field py-1.5 text-sm"
                                  placeholder="Bars and Melody OFFICIAL"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium mb-1.5">Thumbnail Media (Video or Image)</label>
                                <div className="flex gap-3 items-center">
                                  {content.youtube_services.mediaCard?.thumbnailImage && (
                                    <img src={content.youtube_services.mediaCard.thumbnailImage} alt="Preview" className="w-16 h-10 object-cover rounded shadow-sm border border-slate-200" />
                                  )}
                                  {content.youtube_services.mediaCard?.thumbnailVideo && (
                                    <video src={content.youtube_services.mediaCard.thumbnailVideo} className="w-16 h-10 object-cover rounded shadow-sm border border-slate-200" muted />
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleYoutubeThumbnailUpload}
                                    className="input-field py-1.5 text-sm flex-1"
                                  />
                                  {(content.youtube_services.mediaCard?.thumbnailImage || content.youtube_services.mediaCard?.thumbnailVideo) && (
                                    <button type="button" onClick={() => setContent({ ...content, youtube_services: { ...content.youtube_services, mediaCard: { ...(content.youtube_services.mediaCard || { title: '', subtitle: '', videoUrl: '', thumbnailImage: '', thumbnailVideo: '' }), thumbnailImage: '', thumbnailVideo: '' } } })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-sm font-medium">Features Details List</label>
                              <button type="button" onClick={handleAddYoutubeFeature} className="btn-outline py-1.5 px-3 text-xs inline-flex items-center">
                                <Plus size={14} className="mr-1 inline" /> Add Feature
                              </button>
                            </div>
                            <div className="space-y-4">
                              {(content.youtube_services.youtubeFeatures || []).map((feature, index) => (
                                <div key={index} className="flex gap-3 items-start p-3 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-slate-500 mb-1">Feature Title</label>
                                      <input
                                        type="text"
                                        value={feature.title}
                                        onChange={(e) => handleYoutubeFeatureChange(index, 'title', e.target.value)}
                                        className="input-field py-1.5 text-sm"
                                        placeholder="Channel Management"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-500 mb-1">Feature Description</label>
                                      <textarea
                                        rows={2}
                                        value={feature.description}
                                        onChange={(e) => handleYoutubeFeatureChange(index, 'description', e.target.value)}
                                        className="input-field py-1.5 text-sm"
                                        placeholder="Professional support with analytics..."
                                      />
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => handleRemoveYoutubeFeature(index)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg mt-5">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {editingSection === 'our_artists' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <textarea
                              rows={2}
                              value={content.our_artists.title}
                              onChange={(e) => setContent({ ...content, our_artists: { ...content.our_artists, title: e.target.value } })}
                              className="input-field"
                              placeholder="Showcasing Excellence.\nMeet Our Global Roster."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Subtitle</label>
                            <textarea
                              rows={3}
                              value={content.our_artists.subtitle}
                              onChange={(e) => setContent({ ...content, our_artists: { ...content.our_artists, subtitle: e.target.value } })}
                              className="input-field"
                              placeholder="Explore the diverse community of independent artists..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Badge Text</label>
                              <input
                                type="text"
                                value={content.our_artists.badgeText}
                                onChange={(e) => setContent({ ...content, our_artists: { ...content.our_artists, badgeText: e.target.value } })}
                                className="input-field"
                                placeholder="OUR ARTISTS"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Button Text</label>
                              <input
                                type="text"
                                value={content.our_artists.buttonText}
                                onChange={(e) => setContent({ ...content, our_artists: { ...content.our_artists, buttonText: e.target.value } })}
                                className="input-field"
                                placeholder="Join Our Roster"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-2">Button Link</label>
                              <input
                                type="text"
                                value={content.our_artists.buttonLink}
                                onChange={(e) => setContent({ ...content, our_artists: { ...content.our_artists, buttonLink: e.target.value } })}
                                className="input-field"
                                placeholder="/join-roster"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-sm font-medium">Artist Images List</label>
                              <button type="button" onClick={handleAddArtistImage} className="btn-outline py-1.5 px-3 text-xs inline-flex items-center">
                                <Plus size={14} className="mr-1 inline" /> Add Image
                              </button>
                            </div>
                            <div className="space-y-3">
                              {(content.our_artists.artistImages || []).map((artist, index) => (
                                <div key={index} className="flex gap-3 items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                                  {artist.image && (
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                      <img src={artist.image} alt="artist" className="max-w-full max-h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1 space-y-2">
                                    <input
                                      type="text"
                                      value={artist.name || ''}
                                      onChange={(e) => handleArtistNameChange(index, e.target.value)}
                                      className="input-field py-1.5 text-sm"
                                      placeholder="Artist Name"
                                    />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleArtistImageUpload(index, e)}
                                      className="input-field py-1.5 text-sm w-full"
                                    />
                                  </div>
                                  <button type="button" onClick={() => handleRemoveArtistImage(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {editingSection === 'faq' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <textarea
                              rows={2}
                              value={content.faq.title}
                              onChange={(e) => setContent({ ...content, faq: { ...content.faq, title: e.target.value } })}
                              className="input-field"
                              placeholder="Frequently Asked Questions\nFrom Our Artists"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Badge Text</label>
                            <input
                              type="text"
                              value={content.faq.badgeText}
                              onChange={(e) => setContent({ ...content, faq: { ...content.faq, badgeText: e.target.value } })}
                              className="input-field"
                              placeholder="FAQ'S"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-sm font-medium">FAQs List</label>
                              <button type="button" onClick={handleAddFaq} className="btn-outline py-1.5 px-3 text-xs inline-flex items-center">
                                <Plus size={14} className="mr-1 inline" /> Add FAQ
                              </button>
                            </div>
                            <div className="space-y-4">
                              {(content.faq.faqs || []).map((faqItem, index) => (
                                <div key={index} className="flex gap-3 items-start p-3 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
                                      <input
                                        type="text"
                                        value={faqItem.question}
                                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                        className="input-field py-1.5 text-sm"
                                        placeholder="How do I distribute my music...?"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-500 mb-1">Answer</label>
                                      <textarea
                                        rows={3}
                                        value={faqItem.answer}
                                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                        className="input-field py-1.5 text-sm"
                                        placeholder="Yes, we provide beginner-friendly tools..."
                                      />
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => handleRemoveFaq(index)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg mt-5">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                      
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="btn-outline py-2 px-4"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveContent(editingSection)}
                        disabled={savingSection === editingSection}
                        className="btn-primary py-2 px-4 inline-flex items-center"
                      >
                        <Save size={16} className="mr-2 inline" />
                        {savingSection === editingSection ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* Pricing tab rendering */
        <div className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2">
          {/* Add / Edit Form Modal */}
          {showPlanForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-rose-500 animate-pulse-soft" size={18} />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {editingPlan ? 'Update Pricing Plan' : 'Create New Pricing Plan'}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Display Price Text</label>
                        <input type="text" value={planFormData.priceText} onChange={(e) => setPlanFormData({ ...planFormData, priceText: e.target.value })} className="input-field" placeholder="e.g. FREE* or $20" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Duration Subtitle</label>
                        <input type="text" value={planFormData.duration} onChange={(e) => setPlanFormData({ ...planFormData, duration: e.target.value })} className="input-field" placeholder="e.g. per year" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Revenue Share</label>
                        <input type="text" value={planFormData.revenueShare} onChange={(e) => setPlanFormData({ ...planFormData, revenueShare: e.target.value })} className="input-field" placeholder="e.g. 80% Revenue Share" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Button Text</label>
                        <input type="text" value={planFormData.buttonText} onChange={(e) => setPlanFormData({ ...planFormData, buttonText: e.target.value })} className="input-field" placeholder="e.g. BUY NOW" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Features (Comma separated)</label>
                        <input type="text" value={planFormData.features.join(', ')} onChange={(e) => setPlanFormData({ ...planFormData, features: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })} className="input-field" placeholder="All Major Platforms, Unlimited Releases, ..." />
                      </div>
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

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlanForm(false);
                          setEditingPlan(null);
                        }}
                        className="btn-outline py-2 px-4"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary py-2 px-4">
                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
                            {plan.priceText || `$${typeof plan.price === 'number' ? plan.price.toFixed(2) : plan.price}`}
                          </span>
                          {plan.duration && <span className="text-sm text-slate-400 font-medium">{plan.duration}</span>}
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

                    <div className="mb-6 space-y-3">
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {plan.description || 'No description provided.'}
                      </p>
                      
                      {(plan.revenueShare || plan.buttonText || plan.buttonLink) && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-xs">
                          {plan.revenueShare && (
                            <p className="text-slate-700 dark:text-slate-300">
                              <strong className="font-semibold text-slate-900 dark:text-white">Revenue Share:</strong> {plan.revenueShare}
                            </p>
                          )}
                          {(plan.buttonText || plan.buttonLink) && (
                            <p className="text-slate-700 dark:text-slate-300 truncate" title={plan.buttonLink}>
                              <strong className="font-semibold text-slate-900 dark:text-white">Button:</strong> {plan.buttonText || 'None'} {plan.buttonLink ? `(${plan.buttonLink})` : ''}
                            </p>
                          )}
                        </div>
                      )}

                      {plan.features && plan.features.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <strong className="font-semibold text-xs text-slate-900 dark:text-white mb-1.5 block">Features ({plan.features.length}):</strong>
                          <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                            {plan.features.slice(0, 3).map((feat, idx) => (
                              <li key={idx} className="truncate" title={feat}>{feat}</li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-slate-400 italic">+{plan.features.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
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

                    <div className="flex gap-3 w-full xl:w-auto justify-end">
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="py-2 px-4 text-sm inline-flex items-center text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 shadow-sm border-transparent"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} className="mr-2 inline" />
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="btn-primary py-2 px-4 text-sm inline-flex items-center"
                        title="Update Plan"
                      >
                        <Edit2 size={16} className="mr-2 inline" />
                        Update
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

