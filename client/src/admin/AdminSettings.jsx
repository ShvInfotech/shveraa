import React, { useState } from 'react';
import { Save, Check, ShieldCheck, Sparkles, Truck, Store } from 'lucide-react';
import { updateAdminPassword } from '../services/storeService';

const AdminSettings = () => {
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');

  const [settings, setSettings] = useState({
    storeName: 'Shveraa Fine Jewellery Atelier',
    tagline: 'Pure 925 Sterling Silver & Contemporary Adornments',
    email: 'admin@shveraa.luxury',
    whatsapp: '+91 98765 43210',
    currency: '₹ (INR)',
    freeShippingMin: '999',
    returnWindowDays: '30',
    hallmarkCertified: true,
    antiTarnishGuarantee: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setPassError('');

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setPassError('Passphrases do not match.');
        return;
      }
      const passResult = updateAdminPassword(newPassword);
      if (!passResult.success) {
        setPassError(passResult.message);
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
    }

    localStorage.setItem('shveraa_admin_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="shv-admin-settings-view" style={{ maxWidth: '800px' }}>
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Atelier Store &amp; E-Commerce Settings
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Configure precious metal credentials, delivery rules &amp; client concierge parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="shv-admin-table-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '0.75rem' }}>
          Storefront Identity
        </h3>

        <div className="shv-form-group">
          <label className="shv-form-label">Brand / Atelier Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="shv-form-input"
          />
        </div>

        <div className="shv-form-group">
          <label className="shv-form-label">Hero Tagline</label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="shv-form-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="shv-form-group">
            <label className="shv-form-label">Administrative Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="shv-form-input"
            />
          </div>

          <div className="shv-form-group">
            <label className="shv-form-label">WhatsApp Concierge Phone</label>
            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="shv-form-input"
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '0.75rem' }}>
          E-Commerce Logistics &amp; Purity Standards
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="shv-form-group">
            <label className="shv-form-label">Store Currency Symbol</label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="shv-form-input"
            />
          </div>

          <div className="shv-form-group">
            <label className="shv-form-label">Complimentary Insured Shipping Min (₹)</label>
            <input
              type="number"
              value={settings.freeShippingMin}
              onChange={(e) => setSettings({ ...settings, freeShippingMin: e.target.value })}
              className="shv-form-input"
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '0.75rem' }}>
          Atelier Master Passphrase &amp; Security
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="shv-form-group">
            <label className="shv-form-label">New Admin Master Passphrase</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep unchanged"
              className="shv-form-input"
            />
          </div>
          <div className="shv-form-group">
            <label className="shv-form-label">Confirm Master Passphrase</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new passphrase"
              className="shv-form-input"
            />
          </div>
        </div>
        {passError && (
          <div style={{ color: 'var(--admin-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {passError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={settings.hallmarkCertified}
              onChange={(e) => setSettings({ ...settings, hallmarkCertified: e.target.checked })}
            />
            <span>Enforce 925 BIS Hallmarking Certification on all customer invoices</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={settings.antiTarnishGuarantee}
              onChange={(e) => setSettings({ ...settings, antiTarnishGuarantee: e.target.checked })}
            />
            <span>Include Lifetime Anti-Tarnish Platinum Rhodium Covenant Seal</span>
          </label>
        </div>

        <div className="shv-form-actions">
          {saved && (
            <span style={{ color: 'var(--admin-green)', fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={16} />
              Settings updated successfully!
            </span>
          )}
          <button type="submit" className="shv-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
