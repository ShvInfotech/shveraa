import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ArrowRight,
  Award,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import Loader from '../components/Loader';
import PromoPopup from '../components/PromoPopup';
import TieredOfferSection from '../components/TieredOfferSection';
import { fetchProducts } from '../services/api';
import { useDynamicStore } from '../services/storeService';

const InstagramIcon = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const UGC_POSTS = [
  {
    id: 1,
    image: '/muse-rings.jpg',
    tag: '@ananya.atelier',
    location: 'Paris • St-Germain',
    piece: 'Lumina Stacking Bands & Dune Cuff',
    likes: '2.4k',
    link: '/shop?category=rings',
  },
  {
    id: 2,
    image: '/muse-necklace.jpg',
    tag: '@radhika.desai',
    location: 'Jaipur • Summer Light',
    piece: 'Liquid Silver Herringbone & Medallion',
    likes: '3.1k',
    link: '/shop?category=necklaces',
  },
  {
    id: 3,
    image: '/muse-earrings.jpg',
    tag: '@priya.muses',
    location: 'Mumbai • Marine Drive',
    piece: 'Aria Teardrop Hollow Silver Hoops',
    likes: '1.9k',
    link: '/shop?category=earrings',
  },
  {
    id: 4,
    image: '/muse-bracelet.jpg',
    tag: '@meera.v',
    location: 'Bengaluru • Minimal Days',
    piece: 'Mirage Tennis Silver Bracelet & Cuff',
    likes: '2.7k',
    link: '/shop?category=bracelets',
  },
];

const REVIEWS = [
  {
    id: 1,
    author: 'Meera K.',
    city: 'Mumbai',
    badge: 'Verified Atelier Buyer',
    avatar: 'MK',
    rating: 5,
    title: 'Catches light like molten mercury',
    quote:
      'The Liquid Silver Herringbone chain is pure poetry. It sits perfectly flat on the collarbone, catches every hint of afternoon sun, and hasn’t lost an ounce of brilliance after months of daily wear.',
    productName: 'Liquid Silver Herringbone Chain',
  },
  {
    id: 2,
    author: 'Rhea S.',
    city: 'Bengaluru',
    badge: 'Verified Atelier Buyer',
    avatar: 'RS',
    rating: 5,
    title: 'Unboxing felt like high fine jewellery',
    quote:
      'The weight of the 925 sterling silver is unmistakable. You instantly know it is solid precious metal. The hallmark stamp inside is crisp, and the warm satin velvet presentation was sublime.',
    productName: 'Aura Solitaire Band 925',
  },
  {
    id: 3,
    author: 'Tanvi P.',
    city: 'New Delhi',
    badge: 'Verified Atelier Buyer',
    avatar: 'TP',
    rating: 5,
    title: 'Featherweight on the lobes all day',
    quote:
      'Most silver earrings pull painfully by evening, but these hollow-cast teardrops feel completely weightless. I can wear them from morning meetings into dinner without even remembering they are on.',
    productName: 'Aria Teardrop Sculpted Hoops',
  },
];

const Home = () => {
  const { categories, settings } = useDynamicStore();
  const [bestsellers, setBestsellers] = useState([]);
  const [activeTab, setActiveTab] = useState('bestsellers'); // 'bestsellers' | 'new' | 'all'
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Hero Section Dynamic Background Image (Managed in JS for direct API integration)
  const [heroBgImage, setHeroBgImage] = useState(
    settings?.heroBanner?.image || '/hero-ring-banner.jpg'
  );

  // Dynamic API call hook for Hero Section background image
  useEffect(() => {
    const fetchHeroBannerImage = async () => {
      try {
        // [API INTEGRATION POINT]: Call your custom API endpoint here
        // Example:
        // const res = await fetch('/api/hero-banner');
        // const data = await res.json();
        // if (data?.image) setHeroBgImage(data.image);

        if (settings?.heroBanner?.image) {
          setHeroBgImage(settings.heroBanner.image);
        }
      } catch (err) {
        console.error('Error fetching hero background image from API:', err);
      }
    };

    fetchHeroBannerImage();
  }, [settings?.heroBanner?.image]);

  useEffect(() => {
    const handleStoreUpdate = () => setReloadTrigger((prev) => prev + 1);
    window.addEventListener('shveraa_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('shveraa_store_updated', handleStoreUpdate);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const products = await fetchProducts();
        setBestsellers(products);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [reloadTrigger]);

  // Display 8 pieces (2 rows of 4)
  const filteredProducts = bestsellers.filter((p) => {
    if (activeTab === 'bestsellers') return p.bestseller;
    if (activeTab === 'new') return p.featured || p.badge === 'New';
    return true;
  });

  let displayedProducts = filteredProducts.slice(0, 8);
  if (displayedProducts.length < 8 && bestsellers.length >= 8) {
    const remaining = bestsellers.filter(
      (p) => !displayedProducts.some((d) => (d._id || d.slug) === (p._id || p.slug))
    );
    displayedProducts = [...displayedProducts, ...remaining.slice(0, 8 - displayedProducts.length)];
  }

  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // Trigger luxury promotional welcome popup on landing if not dismissed
  useEffect(() => {
    const seen = sessionStorage.getItem('shveraa_welcome_popup_seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setShowPromoPopup(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromoPopup = () => {
    setShowPromoPopup(false);
    sessionStorage.setItem('shveraa_welcome_popup_seen', 'true');
  };

  return (
    <div className="home-page shv-home-editorial">
      {/* Promotional Welcome Popup (Before You Go / First Order Privilege) */}
      <PromoPopup isOpen={showPromoPopup} onClose={handleClosePromoPopup} />

      {/* 1. Hero Section with Cinematic Ring Arch & Dynamic JS Background Image */}
      <HeroSection
        heroImage={settings?.heroBanners?.length || settings?.heroBanner?.title ? undefined : heroBgImage}
        slides={(settings?.heroBanners?.length ? settings.heroBanners : (settings?.heroBanner?.title ? [settings.heroBanner] : []))
          .map((banner, index) => ({
            ...banner,
            id: banner.id || `cms-hero-${index}`,
            num: String(index + 1).padStart(2, '0'),
            tagline: banner.badge || 'SHVERAA ATELIER',
            title: banner.title || 'Pure 925 Silver. Pure Emotion.',
            subtitle: banner.subtitle || '',
            image: banner.image || '/hero-ring-banner.jpg',
            link: banner.ctaLink || '/shop',
            ctaText: banner.ctaText || 'SHOP COLLECTION',
            isCms: true,
          }))}
      />

      {/* 2. Brand Trust Strip — Warm Editorial Ribbon */}
      <section className="shv-editorial-trust-strip">
        <div className="container">
          <div className="shv-trust-ribbon-grid">
            <div className="shv-trust-ribbon-item">
              <div className="shv-trust-ribbon-icon">
                <ShieldCheck size={20} strokeWidth={1.4} />
              </div>
              <div className="shv-trust-ribbon-info">
                <h4>BIS 925 HALLMARKED</h4>
                <p>100% Certified Solid Sterling Silver</p>
              </div>
            </div>

            <div className="shv-trust-ribbon-divider" />

            <div className="shv-trust-ribbon-item">
              <div className="shv-trust-ribbon-icon">
                <Sparkles size={20} strokeWidth={1.4} />
              </div>
              <div className="shv-trust-ribbon-info">
                <h4>TRIPLE RHODIUM SHIELD</h4>
                <p>Tarnish-Proof Platinum Mirror Fire</p>
              </div>
            </div>

            <div className="shv-trust-ribbon-divider" />

            <div className="shv-trust-ribbon-item">
              <div className="shv-trust-ribbon-icon">
                <Award size={20} strokeWidth={1.4} />
              </div>
              <div className="shv-trust-ribbon-info">
                <h4>ZERO BASE ALLOY</h4>
                <p>Hypoallergenic • 24/7 Skin Kindness</p>
              </div>
            </div>

            <div className="shv-trust-ribbon-divider" />

            <div className="shv-trust-ribbon-item">
              <div className="shv-trust-ribbon-icon">
                <Truck size={20} strokeWidth={1.4} />
              </div>
              <div className="shv-trust-ribbon-info">
                <h4>INSURED ATELIER SHIPPING</h4>
                <p>Complimentary On Orders Above ₹999</p>
              </div>
            </div>

            <div className="shv-trust-ribbon-divider" />

            <div className="shv-trust-ribbon-item">
              <div className="shv-trust-ribbon-icon">
                <RotateCcw size={20} strokeWidth={1.4} />
              </div>
              <div className="shv-trust-ribbon-info">
                <h4>30-DAY GRACE PERIOD</h4>
                <p>Effortless Doorstep Returns &amp; Fit Swap</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category — Curated Silhouettes */}
      <section className="section-categories shv-categories-section">
        <div className="container">
          <div className="shv-section-editorial-header">
            <span className="shv-script-eyebrow">Curated Silhouettes</span>
            <h2 className="shv-section-heading">Formed in Pure 925 Silver</h2>
            <p className="shv-section-lead">
              Sculpted to be stacked, layered, and collected as personal talismans.
            </p>
            <div className="shv-header-flourish">
              <span className="shv-flourish-line" />
              <span className="shv-flourish-star">✦</span>
              <span className="shv-flourish-line" />
            </div>
          </div>

          <div className="categories-tile-grid shv-editorial-category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tiered Spend & Save Privilege Offer Cards (Sparkle More, Spend Less) */}
      <TieredOfferSection />

      {/* 5. Featured / Bestseller Products with Warm Tab Filtering */}
      <section className="section-products shv-products-section">
        <div className="container">
          <div className="shv-products-header-wrap">
            <div className="shv-products-heading-col">
              <span className="shv-script-eyebrow">Most Coveted Pieces</span>
              <h2 className="shv-section-heading">The Silver Bestsellers</h2>
              <p className="shv-products-subtext">
                Iconic creations celebrated for their luminous purity and everyday grace.
              </p>
            </div>

            {/* Warm Refined Tab Filter */}
            <div className="shv-warm-tab-group">
              <button
                type="button"
                className={`shv-warm-tab-btn ${activeTab === 'bestsellers' ? 'active' : ''}`}
                onClick={() => setActiveTab('bestsellers')}
              >
                <span>Bestsellers</span>
              </button>
              <button
                type="button"
                className={`shv-warm-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                onClick={() => setActiveTab('new')}
              >
                <span>New Releases</span>
              </button>
              <button
                type="button"
                className={`shv-warm-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <span>All 925 Silver</span>
              </button>
            </div>
          </div>

          {loading ? (
            <Loader text="Loading 925 silver collection..." />
          ) : (
            <div className="shv-shop-products-grid col-4">
              {displayedProducts.map((product) => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </div>
          )}

          <div className="shv-products-footer-cta">
            <Link to="/shop" className="shv-btn-editorial-outline">
              <span>EXPLORE ALL PIECES</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. The Atelier Philosophy — Authentic Master Silversmithing Story (NO AI Tabs) */}
      <section className="shv-atelier-story-section">
        <div className="container">
          <div className="shv-atelier-grid">
            {/* Left: Atmospheric Silversmith Craft Photography Stack */}
            <div className="shv-atelier-media-column">
              <div className="shv-atelier-main-card">
                <img
                  src="/atelier-craftsman.jpg"
                  alt="Master Silversmith at Work in the Shveraa Atelier"
                  className="shv-atelier-hero-img"
                  loading="lazy"
                />
                <div className="shv-atelier-img-overlay" />

                {/* Floating Archival Seal */}
                <div className="shv-atelier-floating-seal" aria-hidden="true">
                  <svg viewBox="0 0 140 140" className="shv-atelier-seal-svg">
                    <defs>
                      <path
                        id="atelierSealPath"
                        d="M 70,70 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0"
                      />
                    </defs>
                    <text className="shv-atelier-seal-text">
                      <textPath href="#atelierSealPath" startOffset="0%">
                        • SHVERAA ATELIER • HAND FINISHED 925 •
                      </textPath>
                    </text>
                  </svg>
                  <div className="shv-atelier-seal-center">
                    <Sparkles size={16} />
                  </div>
                </div>
              </div>

              {/* Overlapping Secondary Macro Hallmark Inscription Card */}
              <div className="shv-atelier-inset-card">
                <img
                  src="/atelier-hallmark.jpg"
                  alt="Solid 925 Hallmark Engraving on Travertine"
                  className="shv-atelier-inset-img"
                  loading="lazy"
                />
                <div className="shv-atelier-inset-meta">
                  <span className="shv-inset-badge">BIS 925 ASSAY</span>
                  <span className="shv-inset-caption">Every piece hallmarked for lifetime purity</span>
                </div>
              </div>
            </div>

            {/* Right: Poetic Luxury Narrative & 3 Noble Pillars */}
            <div className="shv-atelier-narrative-column">
              <span className="shv-script-eyebrow">The Atelier Philosophy</span>
              <h2 className="shv-atelier-title">
                Born From Fire, <br />
                <span className="shv-title-italic">Shaped for a Lifetime.</span>
              </h2>

              <p className="shv-atelier-lead">
                We believe silver is more than metal — it is light given permanence. In a world of fleeting fashion, our atelier insists upon the unhurried craft of honest silversmithing.
              </p>

              {/* 3 Authentic Craft Pillars */}
              <div className="shv-atelier-pillars">
                <div className="shv-pillar-item">
                  <div className="shv-pillar-index">I</div>
                  <div className="shv-pillar-body">
                    <h4>Solid Noble Metal Covenant</h4>
                    <p>
                      Every piece begins as certified 92.5% sterling silver. We never use cheap brass bases or hollow alloys. What touches your skin holds permanent intrinsic worth.
                    </p>
                  </div>
                </div>

                <div className="shv-pillar-item">
                  <div className="shv-pillar-index">II</div>
                  <div className="shv-pillar-body">
                    <h4>Eighteen Steps of Artisan Finishing</h4>
                    <p>
                      Casting, filing, hand-burnishing, and micro-buffing. Veteran hands shape each contour for a featherweight, silk-smooth glide engineered for everyday wear.
                    </p>
                  </div>
                </div>

                <div className="shv-pillar-item">
                  <div className="shv-pillar-index">III</div>
                  <div className="shv-pillar-body">
                    <h4>Triple-Dipped Platinum Shield</h4>
                    <p>
                      An ultra-pure electroplate of noble Rhodium locks out oxygen, water, and humidity — giving your silver an impervious mirror brilliance that laughs at tarnish.
                    </p>
                  </div>
                </div>
              </div>

              <div className="shv-atelier-actions">
                <Link to="/about" className="shv-btn-editorial-primary">
                  <span>DISCOVER OUR CRAFT</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="shv-atelier-sig-wrap">
                  <span className="shv-atelier-sig-script">Shveraa Atelier</span>
                  <span className="shv-atelier-sig-sub">Jaipur &bull; Mumbai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews — Loved by Modern Muses */}
      <section className="reviews-section shv-reviews-editorial">
        <div className="container">
          <div className="shv-section-editorial-header">
            <span className="shv-script-eyebrow">Echoes of Delight</span>
            <h2 className="shv-section-heading">Loved by Modern Muses</h2>
            <div className="shv-reviews-stars-summary">
              <div className="shv-stars-flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#B08D57" color="#B08D57" />
                ))}
              </div>
              <span className="shv-reviews-rating-label">4.9 / 5.0 • Over 10,000+ Cherished Orders</span>
            </div>
          </div>

          <div className="reviews-grid shv-reviews-grid">
            {REVIEWS.map((review) => (
              <div key={review.id} className="shv-editorial-review-card">
                <div className="shv-review-quote-mark" aria-hidden="true">&ldquo;</div>

                <div className="shv-review-stars-row">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={13} fill="#B08D57" color="#B08D57" />
                  ))}
                </div>

                <h3 className="shv-review-headline">{review.title}</h3>
                <p className="shv-review-body">{review.quote}</p>

                <div className="shv-review-card-divider" />

                <div className="shv-review-author-row">
                  <div className="shv-review-avatar-circle">{review.avatar}</div>
                  <div className="shv-review-meta">
                    <span className="shv-review-author-name">{review.author}</span>
                    <span className="shv-review-location">{review.city} • {review.badge}</span>
                  </div>
                </div>

                <div className="shv-review-product-badge">
                  <span>Piece: {review.productName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Community Gallery — Editorial Lookbook #ShveraaMuses */}
      <section className="ugc-section shv-community-lookbook-section">
        <div className="container">
          <div className="shv-lookbook-header">
            <div>
              <span className="shv-script-eyebrow">Living Portfolio</span>
              <h2 className="shv-section-heading">Styled by You #ShveraaMuses</h2>
              <p className="shv-lookbook-desc">
                Quiet luxury captured in natural light. Tag @shveraa.silver on Instagram to be featured in our permanent salon.
              </p>
            </div>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shv-btn-instagram-pill"
            >
              <InstagramIcon size={16} />
              <span>Follow @shveraa.silver</span>
            </a>
          </div>

          {/* Editorial Lookbook Grid */}
          <div className="shv-lookbook-grid">
            {UGC_POSTS.map((post) => (
              <div key={post.id} className="shv-lookbook-card">
                <div className="shv-lookbook-img-box">
                  <img src={post.image} alt={post.piece} loading="lazy" />
                  <div className="shv-lookbook-card-overlay">
                    <div className="shv-lookbook-top-bar">
                      <span className="shv-lookbook-tag">{post.tag}</span>
                      <span className="shv-lookbook-likes">
                        <Heart size={12} fill="#E11D48" color="#E11D48" /> {post.likes}
                      </span>
                    </div>

                    <div className="shv-lookbook-bottom-bar">
                      <span className="shv-lookbook-location">{post.location}</span>
                      <h4 className="shv-lookbook-piece">{post.piece}</h4>
                      <Link to={post.link} className="shv-lookbook-shop-link">
                        <span>Shop Silhouette</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Newsletter Signup — Warm Dark Box Elegance */}
      <Newsletter />
    </div>
  );
};

export default Home;
