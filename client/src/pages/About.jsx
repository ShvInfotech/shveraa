import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight, CheckCircle2, Compass, Layers, Gem } from 'lucide-react';

const About = () => {
  return (
    <div className="shv-about-page">
      {/* 1. Atelier Hero */}
      <section className="shv-about-hero">
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <span className="shv-about-eyebrow">The Shveraa Atelier</span>
          <h1 className="shv-about-title">
            Where Silversmithing Meets <span className="shv-accent-italic">Modern Scuptural Art</span>
          </h1>
          <p className="shv-about-desc">
            Born between the heritage jewellery quarters of Jaipur and the contemporary architectural aesthetic of Mumbai — refusing disposable fast-fashion brass, celebrating solid certified 925 sterling silver, and handcrafting water-resistant heirlooms designed to be lived in.
          </p>
          <div className="shv-about-hallmark-strip">
            <span>✦ Certified 925 BIS Purity</span>
            <span>✦ Triple Rhodium Platinum Finish</span>
            <span>✦ 100% Ethical Recycled Silver</span>
          </div>
        </div>
      </section>

      {/* 2. Visual Story Grid */}
      <section className="section">
        <div className="container">
          <div className="shv-about-story-grid">
            <div className="shv-about-story-text">
              <span className="section-subtitle">Our Provenance</span>
              <h2 className="shv-about-section-h2">
                Silver Crafted Never to Leave Your Skin
              </h2>
              <p>
                Mass-market jewellery often cuts corners behind flash-plated brass or mystery base alloys destined to peel, tarnish, and discolor skin within days of exposure to water and perfume.
              </p>
              <p>
                At Shveraa, our standard is uncompromising: <strong>solid 925 sterling silver</strong> (92.5% pure precious silver alloyed strictly with structural copper), triple-dipped in high-grade <strong>mirror rhodium</strong> — a rare noble metal from the platinum family that shields your jewellery against ocean surf, workout perspiration, and daily rituals.
              </p>

              <div className="shv-about-metrics-grid">
                <div className="shv-about-metric-item">
                  <div className="shv-metric-num">92.5%</div>
                  <div className="shv-metric-label">Certified Precious Elemental Silver</div>
                </div>
                <div className="shv-about-metric-item">
                  <div className="shv-metric-num">18 Steps</div>
                  <div className="shv-metric-label">Of Hand-Finishing &amp; Polish</div>
                </div>
                <div className="shv-about-metric-item">
                  <div className="shv-metric-num">100%</div>
                  <div className="shv-metric-label">Hypoallergenic &amp; Nickel-Free</div>
                </div>
                <div className="shv-about-metric-item">
                  <div className="shv-metric-num">0%</div>
                  <div className="shv-metric-label">Disposable Brass Base Metals</div>
                </div>
              </div>
            </div>

            <div className="shv-about-story-media">
              <div className="shv-about-img-frame">
                <img
                  src="/atelier-craftsman.jpg"
                  alt="Master Silversmith at Work in Shveraa Atelier"
                  className="shv-about-main-img"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85';
                  }}
                />
                <div className="shv-about-img-floating-card">
                  <ShieldCheck size={20} color="#B08D57" />
                  <div>
                    <strong>Jaipur Atelier Lab</strong>
                    <span>Hand-tested &amp; BIS Stamped</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Pillars of Shveraa */}
      <section className="shv-about-pillars-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
            <span className="section-subtitle">Our Commitments</span>
            <h2 className="section-title">The Four Pillars of Shveraa</h2>
            <p className="section-desc">
              Every ring curve, necklace clasp, and laser hallmark conforms to four non-negotiable atelier promises.
            </p>
          </div>

          <div className="shv-pillars-cards-grid">
            <div className="shv-pillar-card">
              <div className="shv-pillar-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h3>925 BIS Hallmarked</h3>
              <p>
                Every silhouette is laser-tested and hallmarked under Bureau of Indian Standards (BIS) IS 2112 protocols for absolute purity verification.
              </p>
            </div>

            <div className="shv-pillar-card">
              <div className="shv-pillar-icon-box">
                <Sparkles size={24} />
              </div>
              <h3>Triple Rhodium Shield</h3>
              <p>
                Platinum-family rhodium molecular bonding prevents surface oxidation, safeguarding against tarnishing in rain, gym sessions, and ocean water.
              </p>
            </div>

            <div className="shv-pillar-card">
              <div className="shv-pillar-icon-box">
                <Layers size={24} />
              </div>
              <h3>Zero Hollow Fillers</h3>
              <p>
                Crafted with substantial, solid metal weight. We never use electroformed hollow shells that dent under everyday lifestyle pressures.
              </p>
            </div>

            <div className="shv-pillar-card">
              <div className="shv-pillar-icon-box">
                <Compass size={24} />
              </div>
              <h3>Ethical Recycled Silver</h3>
              <p>
                Over 85% of our raw precious silver is refined from certified post-consumer recycled metal, minimizing ecological mining footprints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Atelier Craftsmanship Gallery Spread */}
      <section className="section">
        <div className="container">
          <div className="shv-about-craft-spread">
            <div className="shv-craft-card">
              <img
                src="/atelier-hallmark.jpg"
                alt="BIS 925 Hallmark Laser Stamp"
                onError={(e) => {
                  e.currentTarget.src = '/hero-ring-banner.jpg';
                }}
              />
              <div className="shv-craft-overlay">
                <h4>Laser Inscribed Hallmark</h4>
                <p>Micro-engraved with BIS purity seal and our atelier mark.</p>
              </div>
            </div>

            <div className="shv-craft-card">
              <img
                src="/muse-rings.jpg"
                alt="Sculpted Rings in Natural Light"
                onError={(e) => {
                  e.currentTarget.src = '/hero-ring-banner.jpg';
                }}
              />
              <div className="shv-craft-overlay">
                <h4>Fluid Contemporary Silhouettes</h4>
                <p>Designed for daily stacking and milestone celebrations.</p>
              </div>
            </div>

            <div className="shv-craft-card">
              <img
                src="/muse-bracelet.jpg"
                alt="Solid Silver Cuff and Tennis Bracelet"
                onError={(e) => {
                  e.currentTarget.src = '/hero-ring-banner.jpg';
                }}
              />
              <div className="shv-craft-overlay">
                <h4>Hand Polished Mirrors</h4>
                <p>Reflecting daylight with mirror-like clarity and rhodium luster.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Invitation Banner */}
      <section className="shv-about-cta-section">
        <div className="container">
          <div className="shv-about-cta-card">
            <span className="shv-cta-eyebrow">Experience the Difference</span>
            <h2>Discover Certified 925 Silver Heirlooms</h2>
            <p>
              Explore our current curation of rings, earrings, pendants, and bracelets, all backed by complimentary insured shipping and 30-day returns.
            </p>
            <div className="shv-cta-buttons">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Explore The Collection <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                Speak to Master Silversmith
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
