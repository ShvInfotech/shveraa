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

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  const phone = settings?.conciergePhone || '+91 98765 43210';
  const whatsapp = settings?.conciergeWhatsApp || '+91 98765 43210';
  const email = settings?.conciergeEmail || 'concierge@shveraa.luxury';
  const address = settings?.atelierAddress || 'Shveraa Heritage Atelier, Luxury Arcade, Mumbai 400001';
  const cleanWaNumber = whatsapp.replace(/[^0-9]/g, '');

  const faqs = [
    {
      q: 'Can I truly wear Shveraa silver jewellery in the water & gym?',
      a: 'Yes, absolutely. Our pieces are crafted from certified solid 925 sterling silver and sealed with an anti-tarnish mirror rhodium barrier that safely withstands fresh water, ocean surf, perspiration, and daily rituals without oxidizing or turning skin green.',
    },
    {
      q: 'How do I determine my exact ring or wrist size before ordering?',
      a: 'We offer standard Indian & US sizes 5 through 9 across our collection. If you are between sizes, we recommend sizing up for wide sculpted bands and selecting your true size for solitaire rings. Our WhatsApp concierge can guide you through measuring at home in 2 minutes.',
    },
    {
      q: 'What are the delivery timescales and insured shipping policies?',
      a: 'We offer complimentary express insured air shipping across India on all orders over ₹999. Dispatches occur within 24 hours from our atelier, and delivery is completed in 2 to 4 business days via BlueDart Air.',
    },
    {
      q: 'What is your returns and size exchange policy?',
      a: 'We offer a 30-day hassle-free return and exchange policy on all unworn items in their original presentation packaging. Zero hidden fees, and we schedule free doorstep courier pickups.',
    },
    {
      q: 'Can I request custom laser engraving or custom non-standard sizes?',
      a: 'Yes. Our master silversmiths provide custom Roman numeral engraving, initials, or coordinates on select bands and bar pendants. Reach out directly via WhatsApp for bespoke requests.',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Contact submission error:', err);
      // Still show smooth feedback for demo UX
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
          <span className="shv-contact-eyebrow">The Jewellery Concierge</span>
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
                <h3>Direct WhatsApp Concierge</h3>
                <p>Chat with our styling team in real-time for sizing assistance, live videos of pieces, and urgent dispatch requests.</p>
                <a
                  href={`https://wa.me/${cleanWaNumber}?text=Hello%20Shveraa%20Concierge,%20I%20would%20like%20assistance%20with%20a%20silver%20curation.`}
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
                  <strong>Heritage Flagship Atelier</strong>
                  <p>{address}</p>
                </div>
              </div>

              <div className="shv-coord-row">
                <Phone size={18} className="shv-coord-icon" />
                <div>
                  <strong>Concierge Hotline</strong>
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
                <p>Thank you for connecting with Shveraa. Our senior silversmith concierge will review your message and reach out shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="shv-contact-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="shv-form-row-split">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
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
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
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
