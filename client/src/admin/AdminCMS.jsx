import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  BellRing,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Truck,
  ShieldCheck,
  Star,
  Quote,
  Upload,
} from 'lucide-react';
import { getSettings, saveSettings } from '../services/storeService';
import { compressImageFile } from '../utils/imageUpload';

const AdminCMS = ({ onRefresh, settings: currentSettings }) => {
  const heroFileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'hero' | 'contact' | 'policies'
  const [settings, setLocalSettings] = useState(currentSettings);
  const [savedAlert, setSavedAlert] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroBanners = settings.heroBanners?.length ? settings.heroBanners : [settings.heroBanner || {}];
  const activeHeroBanner = heroBanners[activeHeroIndex] || heroBanners[0] || {};

  useEffect(() => {
    setLocalSettings(currentSettings || getSettings());
  }, [currentSettings]);

  // Handle device hero image upload
  const handleHeroFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setHeroUploading(true);
      const dataUrl = await compressImageFile(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 });
      updateHeroBannerField('image', dataUrl);
    } catch (err) {
      console.error('Hero image upload error:', err);
      alert('Failed to process image. Please choose another photo.');
    } finally {
      setHeroUploading(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  const updateHeroBannerField = (field, value) => {
    setLocalSettings((prev) => {
      const banners = prev.heroBanners?.length ? [...prev.heroBanners] : [{ ...(prev.heroBanner || {}) }];
      const idx = Math.min(activeHeroIndex, banners.length - 1);
      banners[idx] = { ...banners[idx], [field]: value };
      return { ...prev, heroBanners: banners, heroBanner: banners[0] };
    });
  };

  const addHeroBanner = () => {
    const banners = [...heroBanners, { badge: '', title: '', subtitle: '', ctaText: 'Explore Collection', ctaLink: '/shop', image: '' }];
    setLocalSettings({ ...settings, heroBanners: banners, heroBanner: banners[0] });
    setActiveHeroIndex(banners.length - 1);
  };

  const deleteHeroBanner = (index) => {
    if (heroBanners.length <= 1) {
      alert('At least one homepage hero banner is required.');
      return;
    }
    const banners = heroBanners.filter((_, idx) => idx !== index);
    setLocalSettings({ ...settings, heroBanners: banners, heroBanner: banners[0] });
    setActiveHeroIndex(Math.min(index, banners.length - 1));
  };

  // Add announcement to rotating list
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    const currentList = settings.announcements || [settings.announcementText];
    const updatedList = [...currentList, newAnnouncement.trim()];
    const updated = {
      ...settings,
      announcements: updatedList,
      announcementText: updatedList[0],
    };
    setLocalSettings(updated);
    try { await saveSettings(updated); } catch (err) { alert(err.message || 'Could not save announcement to database.'); return; }
    setNewAnnouncement('');
    triggerSuccess();
    onRefresh && onRefresh();
  };

  // Remove announcement from list
  const handleRemoveAnnouncement = async (index) => {
    const currentList = settings.announcements || [settings.announcementText];
    if (currentList.length <= 1) {
      alert('Must maintain at least one announcement.');
      return;
    }
    const updatedList = currentList.filter((_, idx) => idx !== index);
    const updated = {
      ...settings,
      announcements: updatedList,
      announcementText: updatedList[0],
    };
    setLocalSettings(updated);
    try { await saveSettings(updated); } catch (err) { alert(err.message || 'Could not save announcement to database.'); return; }
    triggerSuccess();
    onRefresh && onRefresh();
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement?.text.trim()) return;
    const currentList = settings.announcements || [settings.announcementText];
    const updatedList = currentList.map((item, idx) => idx === editingAnnouncement.index ? editingAnnouncement.text.trim() : item);
    const updated = { ...settings, announcements: updatedList, announcementText: updatedList[0] };
    setLocalSettings(updated);
    try { await saveSettings(updated); } catch (err) { alert(err.message || 'Could not save announcement to database.'); return; }
    setEditingAnnouncement(null);
    triggerSuccess();
    onRefresh && onRefresh();
  };

  const handleSaveAll = async (e) => {
    e?.preventDefault();
    try { await saveSettings(settings); } catch (err) { alert(err.message || 'Could not save CMS changes to database.'); return; }
    triggerSuccess();
    onRefresh && onRefresh();
  };

  const triggerSuccess = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3500);
  };

  return (
    <div className="shv-admin-cms-page">
      {/* Top Title Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Storefront CMS &amp; Dynamic Content Manager
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Control hero banners, rotating announcements, contact hotline, and store policies in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {savedAlert && (
            <div className="shv-alert-pill-success">
              <CheckCircle2 size={16} />
              <span>Storefront Updated Live!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            className="shv-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="shv-cms-nav-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`shv-cms-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
        >
          <BellRing size={16} />
          <span>Announcement Bar ({settings.announcements?.length || 3})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`shv-cms-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
        >
          <Sparkles size={16} />
          <span>Homepage Hero Banner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`shv-cms-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
        >
          <Phone size={16} />
          <span>Atelier Contact &amp; Concierge</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`shv-cms-tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
        >
          <Truck size={16} />
          <span>Shipping &amp; Checkout Rules</span>
        </button>
      </div>

      {/* TAB 1: ANNOUNCEMENT BAR TICKER */}
      {activeTab === 'announcements' && (
        <div className="shv-cms-content-card">
          <div className="shv-cms-card-header">
            <div>
              <h3>Rotating Announcement Bar Offers</h3>
              <p>These messages cycle smoothly across the top banner of every page on the public website.</p>
            </div>
            <label className="shv-editor-checkbox">
              <input
                type="checkbox"
                checked={settings.announcementEnabled !== false}
                onChange={async (e) => {
                  const updated = { ...settings, announcementEnabled: e.target.checked };
                  setLocalSettings(updated);
                  try { await saveSettings(updated); } catch (err) { alert(err.message || 'Could not save announcement setting to database.'); return; }
                  triggerSuccess();
                }}
              />
              <span>Enable Announcement Bar</span>
            </label>
          </div>

          {/* Add New Announcement */}
          <form onSubmit={handleAddAnnouncement} className="shv-cms-add-form">
            <input
              type="text"
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="e.g. ✦ Festive 2026: Complimentary Pure Silver Coin with orders > ₹4,999"
              required
            />
            <button type="submit" className="shv-btn-primary">
              <Plus size={16} />
              <span>Add Offer</span>
            </button>
          </form>

          {/* Announcement List */}
          <div className="shv-cms-announcement-list">
            {(settings.announcements || [settings.announcementText]).map((item, index) => (
              <div key={index} className="shv-cms-announcement-row">
                <div className="shv-cms-announcement-num">#{index + 1}</div>
                {editingAnnouncement?.index === index ? (
                  <form onSubmit={handleUpdateAnnouncement} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                    <input aria-label={`Edit announcement ${index + 1}`} autoFocus value={editingAnnouncement.text} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, text: e.target.value })} />
                    <button type="submit" className="shv-btn-primary">Save</button>
                    <button type="button" className="shv-table-filter-btn" onClick={() => setEditingAnnouncement(null)}>Cancel</button>
                  </form>
                ) : <div className="shv-cms-announcement-text">{item}</div>}
                {editingAnnouncement?.index !== index && <button type="button" className="shv-table-filter-btn" onClick={() => setEditingAnnouncement({ index, text: item })} aria-label={`Edit announcement ${index + 1}`}>Edit</button>}
                <button
                  type="button"
                  onClick={() => handleRemoveAnnouncement(index)}
                  className="shv-cms-delete-icon"
                  title="Remove this offer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HOMEPAGE HERO BANNER */}
      {activeTab === 'hero' && (
        <div className="shv-cms-content-card">
          <div className="shv-cms-card-header">
            <div>
              <h3>Homepage Hero Campaign</h3>
              <p>Add multiple homepage banners. They rotate automatically on the storefront.</p>
            </div>
            <button type="button" className="shv-btn-primary" onClick={addHeroBanner}><Plus size={16} /> Add Banner</button>
          </div>

          <div className="shv-cms-announcement-list" style={{ marginBottom: '1.25rem' }}>
            {heroBanners.map((banner, index) => (
              <div key={index} className="shv-cms-announcement-row" style={{ cursor: 'pointer' }} onClick={() => setActiveHeroIndex(index)}>
                <div className="shv-cms-announcement-num">#{index + 1}</div>
                <div className="shv-cms-announcement-text">{banner.title || 'Untitled banner'}</div>
                <button type="button" className="shv-table-filter-btn" onClick={(e) => { e.stopPropagation(); setActiveHeroIndex(index); }} aria-label={`Edit banner ${index + 1}`}>Edit</button>
                <button type="button" className="shv-cms-delete-icon" onClick={(e) => { e.stopPropagation(); deleteHeroBanner(index); }} title="Delete banner"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="shv-editor-fields-grid">
            <div className="shv-field full-width">
              <label>Top Collection Badge</label>
              <input
                type="text"
                value={activeHeroBanner.badge || ''}
                onChange={(e) => updateHeroBannerField('badge', e.target.value)}
                placeholder="NEW ATELIER COLLECTION 2026"
              />
            </div>

            <div className="shv-field full-width">
              <label>Headline / Main Title</label>
              <input
                type="text"
                value={activeHeroBanner.title || ''}
                onChange={(e) => updateHeroBannerField('title', e.target.value)}
                placeholder="Pure 925 Silver. Pure Emotion."
              />
            </div>

            <div className="shv-field full-width">
              <label>Subheadline / Atelier Poetry</label>
              <textarea
                rows={3}
                value={activeHeroBanner.subtitle || ''}
                onChange={(e) => updateHeroBannerField('subtitle', e.target.value)}
              />
            </div>

            <div className="shv-field half-width">
              <label>Button Call-to-Action (CTA) Label</label>
              <input
                type="text"
                value={activeHeroBanner.ctaText || ''}
                onChange={(e) => updateHeroBannerField('ctaText', e.target.value)}
                placeholder="Explore Atelier Creations"
              />
            </div>

            <div className="shv-field half-width">
              <label>Button Target URL</label>
              <input
                type="text"
                value={activeHeroBanner.ctaLink || ''}
                onChange={(e) => updateHeroBannerField('ctaLink', e.target.value)}
                placeholder="/shop"
              />
            </div>

            <div className="shv-field full-width">
              <label>Hero Campaign Background Photo (Upload from Device)</label>
              <div
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => heroFileInputRef.current?.click()}
              >
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFileUpload}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={26} color="#1E2229" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E2229' }}>
                    {heroUploading ? 'Optimizing & uploading photo...' : 'Click to select hero photo from device'}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                    Supports high-resolution JPG, PNG, WEBP from your computer or phone
                  </span>
                </div>
              </div>

              {activeHeroBanner.image && (
                <div style={{ marginTop: '0.85rem', position: 'relative', height: '150px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                  <img
                    src={activeHeroBanner.image}
                    alt="Hero banner preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    className="shv-table-filter-btn"
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    Replace Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin managed contact settings */}
      {activeTab === 'contact' && (
        <div className="shv-cms-content-card">
          <div className="shv-cms-card-header">
            <div>
              <h3>Atelier Contact &amp; Concierge Details</h3>
              <p>Manage atelier contact and concierge details from the admin panel.</p>
            </div>
          </div>

          <div className="shv-editor-fields-grid">
            <div className="shv-field half-width">
              <label>Priority Silversmith Phone Hotline</label>
              <input
                type="text"
                value={settings.conciergePhone || '+91 98765 43210'}
                onChange={(e) => setLocalSettings({ ...settings, conciergePhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="shv-field half-width">
              <label>Direct WhatsApp Channel</label>
              <input
                type="text"
                value={settings.conciergeWhatsApp || '+91 98765 43210'}
                onChange={(e) => setLocalSettings({ ...settings, conciergeWhatsApp: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="shv-field half-width">
              <label>Official Concierge Email</label>
              <input
                type="email"
                value={settings.conciergeEmail || 'concierge@shveraa.luxury'}
                onChange={(e) => setLocalSettings({ ...settings, conciergeEmail: e.target.value })}
                placeholder="concierge@shveraa.luxury"
              />
            </div>

            <div className="shv-field half-width">
              <label>BIS Hallmark Assurance Guarantee Statement</label>
              <input
                type="text"
                value={settings.hallmarkStampText || 'Laser Tested 100% Pure 925 Sterling Silver & BIS Certified'}
                onChange={(e) => setLocalSettings({ ...settings, hallmarkStampText: e.target.value })}
              />
            </div>

            <div className="shv-field full-width">
              <label>Physical Flagship Atelier Address</label>
              <input
                type="text"
                value={settings.atelierAddress || 'Shveraa Heritage Atelier, Luxury Arcade, Mumbai 400001'}
                onChange={(e) => setLocalSettings({ ...settings, atelierAddress: e.target.value })}
                placeholder="Shveraa Heritage Atelier, Luxury Arcade, Mumbai 400001"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SHIPPING & CHECKOUT RULES */}
      {activeTab === 'policies' && (
        <div className="shv-cms-content-card">
          <div className="shv-cms-card-header">
            <div>
              <h3>Shipping, Freight &amp; Payment Rules</h3>
              <p>Configure free shipping qualification and checkout delivery logic.</p>
            </div>
          </div>

          <div className="shv-editor-fields-grid">
            <div className="shv-field half-width">
              <label>Free Insured Shipping Threshold (₹)</label>
              <input
                type="number"
                value={settings.freeShippingMin || 999}
                onChange={(e) => setLocalSettings({ ...settings, freeShippingMin: Number(e.target.value) })}
                placeholder="999"
              />
              <span className="shv-field-helper">Orders equal to or above this value get complimentary shipping.</span>
            </div>

            <div className="shv-field half-width">
              <label>Standard Shipping Charge (₹)</label>
              <input
                type="number"
                value={settings.shippingStandardFee || 100}
                onChange={(e) => setLocalSettings({ ...settings, shippingStandardFee: Number(e.target.value) })}
                placeholder="100"
              />
              <span className="shv-field-helper">Applied to cart totals below the free shipping threshold.</span>
            </div>

            <div className="shv-field full-width">
              <label className="shv-editor-checkbox-toggle">
                <input
                  type="checkbox"
                  checked={settings.codEnabled !== false}
                  onChange={(e) => setLocalSettings({ ...settings, codEnabled: e.target.checked })}
                />
                <div>
                  <span className="toggle-title">Enable Cash on Delivery (COD) Option</span>
                  <span className="toggle-desc">Allow customers in India to settle orders upon doorstep courier arrival.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCMS;
