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
