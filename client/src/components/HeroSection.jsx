import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Sparkles,
  ShieldCheck,
  Heart,
  Gift,
  Diamond,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    num: '01',
    tagline: 'PURE 925 SILVER',
    titleLine1: 'A Brighter You,',
    titleLine2: 'Every',
    titleAccent: 'Day.',
    subtitle: 'Minimal designs, crafted for everyday radiance.',
    image: '/hero-ring-banner.jpg',
    link: '/shop?category=rings',
  },
  {
    id: 2,
    num: '02',
    tagline: 'TIMELESS ELEGANCE',
    titleLine1: 'Elegance In',
    titleLine2: 'Every Fine',
    titleAccent: 'Detail.',
    subtitle: 'Layered radiance with a lifetime platinum luster.',
    image: '/hero-necklace-banner.jpg',
    link: '/shop?category=necklaces',
  },
  {
    id: 3,
    num: '03',
    tagline: 'MODERN ATELIER',
    titleLine1: 'Pure Form,',
    titleLine2: 'Featherweight',
    titleAccent: 'Grace.',
    subtitle: 'Hypoallergenic solid 925 silver for effortless wear.',
    image: '/hero-earrings-banner.jpg',
    link: '/shop?category=earrings',
  },
  {
    id: 4,
    num: '04',
    tagline: 'BESPOKE CREATIONS',
    titleLine1: 'Confidence,',
    titleLine2: 'Sculpted in',
    titleAccent: 'Silver.',
    subtitle: 'Master artisan silversmithing with certified purity.',
    image: '/hero-bracelet-banner.jpg',
    link: '/shop?category=bracelets',
  },
];

const HeroSection = ({ heroImage, slides: propSlides }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Dynamic slides supporting heroImage or custom slides passed via JS state / API
  const slides = React.useMemo(() => {
    const base = propSlides && propSlides.length > 0 ? propSlides : HERO_SLIDES;
    if (heroImage) {
      return base.map((s, idx) => (idx === 0 ? { ...s, image: heroImage } : s));
    }
    return base;
  }, [propSlides, heroImage]);

  useEffect(() => {
    setActiveIdx((index) => Math.min(index, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    if (index === activeIdx) return;
    setIsFading(true);
    setTimeout(() => {
      setActiveIdx(index);
      setIsFading(false);
    }, 280);
  }, [activeIdx]);

  const handleNext = useCallback(() => {
    const next = (activeIdx + 1) % slides.length;
    goToSlide(next);
  }, [activeIdx, goToSlide, slides.length]);

  const handlePrev = useCallback(() => {
    const prev = (activeIdx - 1 + slides.length) % slides.length;
    goToSlide(prev);
  }, [activeIdx, goToSlide, slides.length]);

  // Auto rotate slide every 7 seconds
  useEffect(() => {
    const interval = setInterval(handleNext, 7000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const slide = slides[activeIdx] || slides[0];

  return (
    <section className="shveraa-exact-hero">
      {/* 1. Background image layers for smooth cross-fading - driven by JS state / API */}
      <div className="shv-hero-bg-wrapper">
        {slides.map((s, i) => (
          <div
            key={s.id || i}
            className={`shv-hero-bg-slide ${i === activeIdx ? 'active' : ''}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}
        <div className="shv-hero-soft-vignette" />
      </div>

      {/* 2. Left vertical rule & rotated title */}
      <div className="shv-hero-side-rail">
        <div className="shv-side-rail-line" />
        <span className="shv-side-rail-text">SILVER FOR A BRIGHTER YOU</span>
        <div className="shv-side-rail-line" />
      </div>

      {/* 3. Bottom left vertical social links */}
      <div className="shv-hero-social-strip">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="shv-social-link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>
        <a
          href="https://pinterest.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pinterest"
          className="shv-social-link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.15 9.42 7.6 11.18-.11-.94-.2-2.39.04-3.42.22-.93 1.41-5.97 1.41-5.97s-.36-.72-.36-1.79c0-1.68.97-2.93 2.19-2.93 1.03 0 1.53.78 1.53 1.71 0 1.04-.66 2.6-1.01 4.04-.29 1.21.61 2.2 1.8 2.2 2.16 0 3.82-2.28 3.82-5.57 0-2.91-2.09-4.95-5.08-4.95-3.46 0-5.49 2.59-5.49 5.28 0 1.04.4 2.16.9 2.77.1.12.12.22.09.34-.09.38-.3 1.21-.34 1.38-.06.22-.18.27-.41.16-1.55-.72-2.52-2.99-2.52-4.81 0-3.92 2.85-7.52 8.22-7.52 4.31 0 7.67 3.07 7.67 7.18 0 4.28-2.7 7.73-6.45 7.73-1.26 0-2.45-.66-2.85-1.43l-.78 2.96c-.28 1.08-1.04 2.44-1.55 3.27C9.58 23.82 10.77 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
          </svg>
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="shv-social-link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          className="shv-social-link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
      </div>

      {/* 4. Main Hero Core Container */}
      <div className="shv-hero-main-layout">
        {/* Left Side: Minimal Typography & Primary Action */}
        <div className={`shv-hero-editorial-left ${isFading ? 'shv-fade-out' : 'shv-fade-in'}`}>
          {slide.tagline && <span className="shv-hero-pretitle">{slide.tagline}</span>}

          <h1 className="shv-hero-headline">
            {slide.isCms ? (
              slide.title
            ) : (
              <>
                {slide.titleLine1} <br />
                {slide.titleLine2}{' '}
                {slide.titleAccent && (
                  <span className="shv-hero-headline-italic">{slide.titleAccent}</span>
                )}
              </>
            )}
          </h1>

          {slide.subtitle && (
            <p className="shv-hero-lead-text">
              {slide.subtitle}
            </p>
          )}

          <div className="shv-hero-button-group">
            <Link to={slide.link} className="shv-btn-shop-collection">
              <span>{slide.ctaText || 'EXPLORE COLLECTION'}</span>
              <ArrowRight size={17} className="shv-btn-arrow" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Bottom Navigation Bar: Numeric Slider & Twin Venn Arrows */}
      <div className="shv-hero-bottom-navigator">
        <div className="shv-slider-numeric-track">
          <span className="shv-slider-current-num">{slide.num}</span>

          <div className="shv-slider-bar-track">
            <div
              className="shv-slider-bar-fill"
              style={{ width: `${((activeIdx + 1) / slides.length) * 100}%` }}
            />
          </div>

          <div className="shv-slider-indexes">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`shv-slider-index-btn ${i === activeIdx ? 'active' : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${s.num}`}
              >
                {s.num}
              </button>
            ))}
          </div>
        </div>

        {/* Venn-Linked Twin Circle Arrow Controls */}
        <div className="shv-venn-nav-controls">
          <button
            type="button"
            className="shv-venn-btn shv-venn-btn-left"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={17} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="shv-venn-btn shv-venn-btn-right"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={17} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* 6. Video Story Modal */}
      {videoOpen && (
        <div className="shv-story-modal-overlay" onClick={() => setVideoOpen(false)}>
          <div className="shv-story-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="shv-modal-close-btn"
              onClick={() => setVideoOpen(false)}
              aria-label="Close story video"
            >
              <X size={20} />
            </button>
            <div className="shv-video-container">
              <video
                autoPlay
                controls
                playsInline
                poster="/hero-ring-banner.jpg"
                className="shv-modal-video"
              >
                <source
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Elsa_Lee_Paris_-_Parisienne_2017_-_Vimeo.webm"
                  type="video/webm"
                />
                Your browser does not support HTML5 video.
              </video>
            </div>
            <div className="shv-modal-footer">
              <h4>The Shveraa Atelier Process</h4>
              <p>Hand-poured 925 sterling silver, diamond-lapidary setting, and anti-tarnish rhodium shielding.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
