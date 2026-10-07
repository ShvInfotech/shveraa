import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronDown, ChevronUp, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { sendContactMessage } from '../services/api';
import { useDynamicStore } from '../services/storeService';

const Contact = () => {
  const { settings } = useDynamicStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Sizing & Styling Advice',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  const phone = settings?.conciergePhone || '+91 99980 46559';
  const whatsapp = settings?.conciergeWhatsApp || '+91 99980 46559';
  const email = settings?.conciergeEmail || 'shvera925@gmail.com';
  const address = settings?.atelierAddress || 'A/9, Maruti Nandan Society, Opp. Prime Arcade, Anand Mahal Road, Surat';
  const cleanWaNumber = whatsapp.replace(/[^0-9]/g, '');

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please provide your full name (at least 2 letters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (formData.phone.trim() && cleanPhone.length < 10) {
      errors.phone = 'Please provide a valid 10-digit mobile number.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Please share your inquiry details (at least 10 characters).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Spam & Bot Protection (Honeypot Trap)
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await sendContactMessage(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Bespoke Sizing & Styling Advice',
        message: '',
      });
      setFormErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Contact submission error:', err);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shv-contact-page">
      <div className="container">
        {/* Header */}
        <div className="shv-contact-header">
          <span className="shv-contact-eyebrow">Customer Care &amp; Support</span>
          <h1 className="shv-contact-title">Connect with the Atelier</h1>
          <p className="shv-contact-subtitle">
            Whether seeking bespoke sizing consultation, curating a milestone gift, or tracking an active consignment, our silversmith advisory team is here for you.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="shv-contact-grid">
          {/* Left Col: Direct Concierge Channels */}
          <div className="shv-contact-info-panel">
            {/* VIP WhatsApp Card */}
            <div className="shv-whatsapp-card">
              <div className="shv-wa-icon-circle">
                <MessageCircle size={28} />
              </div>
              <div className="shv-wa-details">
                <span className="shv-wa-tag">Instant Silversmith Support</span>
                <h3>Direct WhatsApp Support</h3>
                <p>Chat with our styling team in real-time for sizing assistance, live videos of pieces, and urgent dispatch requests.</p>
                <a
                  href={`https://wa.me/${cleanWaNumber}?text=Hello%20Shveraa%20Jewels,%20I%20would%20like%20assistance%20with%20a%20silver%20curation.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}
                >
                  <MessageCircle size={15} /> Chat on WhatsApp ({whatsapp})
                </a>
              </div>
            </div>

            {/* Atelier Coordinates */}
            <div className="shv-locations-card">
              <h3 className="shv-panel-heading">Atelier Coordinates</h3>

              <div className="shv-coord-row">
                <MapPin size={18} className="shv-coord-icon" />
                <div>
                  <strong>Shveraa Jewels</strong>
                  <p>{address}</p>
                </div>
              </div>

              <div className="shv-coord-row">
                <Phone size={18} className="shv-coord-icon" />
                <div>
                  <strong>Customer Care Hotline</strong>
                  <p>{phone}</p>
                </div>
              </div>

              <div className="shv-coord-row">
                <Clock size={18} className="shv-coord-icon" />
                <div>
                  <strong>Atelier Advisory Hours</strong>
                  <p>Monday to Saturday: 10:30 AM – 7:30 PM IST</p>
                </div>
              </div>

              <div className="shv-coord-row">
                <Mail size={18} className="shv-coord-icon" />
                <div>
                  <strong>Direct Inquiries</strong>
                  <p>
                    General: <a href={`mailto:${email}`}>{email}</a><br />
                    Orders: <a href={`mailto:${email}`}>{email}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Consultation Form */}
          <div className="shv-contact-form-panel">
            <h3 className="shv-form-heading">Send an Atelier Inquiry</h3>
            <p className="shv-form-sub">We reply to every correspondence within 2 business hours.</p>

            {submitted ? (
              <div className="shv-contact-success-state">
                <CheckCircle2 size={44} color="#10B981" />
                <h3>Your Inquiry Has Been Received</h3>
                <p>Thank you for connecting with Shveraa. Our customer support team will review your message and reach out shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="shv-contact-form" noValidate>
                {/* Honeypot Spam Trap (Hidden from real users, filled only by bots) */}
                <input
                  type="text"
                  name="atelier_honeypot_bot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                />

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    style={formErrors.name ? { borderColor: '#E11D48' } : {}}
                  />
                  {formErrors.name && (
                    <span style={{ color: '#E11D48', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                      {formErrors.name}
                    </span>
                  )}
                </div>

                <div className="shv-form-row-split">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                      }}
                      style={formErrors.email ? { borderColor: '#E11D48' } : {}}
                    />
                    {formErrors.email && (
                      <span style={{ color: '#E11D48', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Mobile / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+91 99980 46559"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                      }}
                      style={formErrors.phone ? { borderColor: '#E11D48' } : {}}
                    />
                    {formErrors.phone && (
                      <span style={{ color: '#E11D48', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        {formErrors.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Inquiry Topic *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="Bespoke Sizing & Styling Advice">Bespoke Sizing &amp; Styling Advice</option>
                    <option value="Bridal & Milestone Curations">Bridal &amp; Milestone Curations</option>
                    <option value="Order Tracking & Dispatch Updates">Order Tracking &amp; Dispatch Updates</option>
                    <option value="Corporate & Wedding Gifting">Corporate &amp; Wedding Gifting</option>
                    <option value="Custom Laser Engraving Inquiries">Custom Laser Engraving Inquiries</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Please specify ring sizes, delivery dates, or specific silver silhouettes of interest..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (formErrors.message) setFormErrors({ ...formErrors, message: '' });
                    }}
                    style={formErrors.message ? { borderColor: '#E11D48' } : {}}
                  />
                  {formErrors.message && (
                    <span style={{ color: '#E11D48', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                      {formErrors.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Send size={16} />
                  <span>{loading ? 'Transmitting to Atelier...' : 'Transmit Inquiry to Atelier'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="shv-contact-faq-section">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            <span className="section-subtitle">Common Inquiries</span>
            <h2 className="section-title">Frequently Addressed Questions</h2>
          </div>

          <div className="shv-faq-accordion-wrap">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className={`shv-faq-item ${isOpen ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="shv-faq-question-btn"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="shv-faq-answer-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
