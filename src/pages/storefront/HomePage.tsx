import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Coins, Gift, Play, Star, UserPlus, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FurnitureCategory, MosaicTile, Product } from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';
import { ProductCard } from '../../components/storefront/ProductCard';
import { HotspotTileCard } from '../../components/storefront/HotspotTileCard';
import { resolveAssetUrl } from '../../utils/security';

const TOP_SEASON_PICKS: Array<{
  title: string;
  category: FurnitureCategory;
  image: string;
  objectPosition?: string;
}> = [
  { title: 'Bed', category: 'Bedroom', image: '/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg', objectPosition: '50% 60%' },
  { title: 'Dining Chair', category: 'Chairs', image: '/src/assets/images/product_oak_dining_chair_1794926097049.jpg', objectPosition: '50% 50%' },
  { title: 'Double Sofa', category: 'Sofas', image: '/src/assets/images/product_linen_sofa_1794926095674.jpg', objectPosition: '50% 55%' },
  { title: 'Vases', category: 'Decor', image: '/src/assets/images/product_walnut_credenza_1794926094553.jpg', objectPosition: '28% 36%' },
  { title: 'Center Table', category: 'Tables', image: '/src/assets/images/product_travertine_table_1794926096128.jpg', objectPosition: '50% 58%' },
  { title: 'Cushion', category: 'Textiles', image: '/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg', objectPosition: '60% 48%' },
  { title: 'Side Table', category: 'Smart Series', image: '/src/assets/images/product_brass_floor_lamp_1794926095796.jpg', objectPosition: '86% 62%' },
  { title: 'Single Sofa', category: 'Chairs', image: '/src/assets/images/product_boucle_lounge_1794926095999.jpg', objectPosition: '52% 52%' },
  { title: 'Executive Chair', category: 'Office', image: '/src/assets/images/product_oak_dining_chair_1794926097049.jpg', objectPosition: '45% 45%' },
  { title: 'Work Chair', category: 'Study', image: '/src/assets/images/hero_lookcreative_living_1794926095098.jpg', objectPosition: '84% 66%' },
  { title: 'Glasses', category: 'Decor', image: '/src/assets/images/hero_lookcreative_dining_1794926095951.jpg', objectPosition: '55% 58%' },
  { title: 'Dining Table', category: 'Kitchen', image: '/src/assets/images/hero_lookcreative_dining_1794926095951.jpg', objectPosition: '50% 62%' },
];

const FINANCING_TIERS = [
  { rate: 0, label: '0%', term: '3 Months', months: 3 },
  { rate: 5, label: '5%', term: '6 Months', months: 6 },
  { rate: 8, label: '8%', term: '9 Months', months: 9 },
  { rate: 9, label: '9%', term: '12 Months', months: 12 },
];

const STUDIO_FILMS = [
  {
    id: 'film-1',
    title: 'Craftsmanship Monograph: Solid Oak & Joinery',
    subtitle: 'Inside our partner mill · 03:45',
    image: '/src/assets/images/product_oak_dining_chair_1794926097049.jpg',
    summary:
      'Discover how kiln-dried European white oak is steam-bent, hand-planed, and joined with wedged mortise-and-tenon architecture built to last generations.',
    targetCategory: 'Chairs' as FurnitureCategory,
  },
  {
    id: 'film-2',
    title: 'Spatial Calm: Designing Living Sanctuaries',
    subtitle: 'Vespera Design Studio · 04:20',
    image: '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
    summary:
      'Our lead interior architects walk through material layering—pairing raw travertine, unbleached Belgian flax, and sculpted wool bouclé in sunlit residences.',
    targetCategory: 'Sofas' as FurnitureCategory,
  },
  {
    id: 'film-3',
    title: 'Architect Conversations: Material Longevity',
    subtitle: 'Studio Dialogue Series · 06:10',
    image: '/src/assets/images/product_walnut_credenza_1794926094553.jpg',
    summary:
      'Principal residential architects discuss acoustic warmth, tactile patina, and why timeless oiled American walnut outlives seasonal furniture trends.',
    targetCategory: 'Storage' as FurnitureCategory,
  },
];

interface ProductSliderProps {
  title: string;
  subtitle: string;
  products: Product[];
  topSlot?: React.ReactNode;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  title,
  subtitle,
  products,
  topSlot,
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const syncScrollMetrics = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
    setScrollProgress(maxScroll > 0 ? Math.min(1, Math.max(0, el.scrollLeft / maxScroll)) : 0);
  }, []);

  useEffect(() => {
    syncScrollMetrics();
    window.addEventListener('resize', syncScrollMetrics);
    return () => window.removeEventListener('resize', syncScrollMetrics);
  }, [products.length, syncScrollMetrics]);

  const slideBy = (direction: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const step = Math.max(260, Math.round(el.clientWidth * 0.52));
    if (direction === 'next') {
      if (el.scrollLeft >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 8) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  const pageCount = Math.max(1, Math.ceil(products.length / 5));
  const activeStep = Math.min(
    pageCount - 1,
    Math.round(scrollProgress * (pageCount - 1))
  );

  const scrollToStep = (stepIndex: number) => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const target = pageCount > 1 ? (stepIndex / (pageCount - 1)) * maxScroll : 0;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-18">
      <div className="flex items-center justify-between gap-4 mb-10">
        <button
          type="button"
          onClick={() => slideBy('prev')}
          aria-label={`Previous ${title}`}
          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-medium">
            {title}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => slideBy('next')}
          aria-label={`Next ${title}`}
          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {topSlot}

      {/* Smooth Horizontal 5-Item Slider Track */}
      <div className="relative group/slider">
        {canScrollPrev && (
          <button
            type="button"
            onClick={() => slideBy('prev')}
            aria-label={`Slide ${title} left`}
            className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border text-[#1c1b19] items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 focus:opacity-100 hover:bg-white transition-all cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={trackRef}
          onScroll={syncScrollMetrics}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[calc((100%-12px)/2)] sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-64px)/5)] shrink-0 snap-start flex flex-col"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {canScrollNext && (
          <button
            type="button"
            onClick={() => slideBy('next')}
            aria-label={`Slide ${title} right`}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border text-[#1c1b19] items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 focus:opacity-100 hover:bg-white transition-all cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Interactive Slider Dots */}
      {pageCount > 1 && (
        <div
          className="flex items-center justify-center gap-1.5 mt-5"
          role="tablist"
          aria-label={`${title} slider pagination`}
        >
          {Array.from({ length: pageCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === activeStep}
              aria-label={`View ${title} set ${idx + 1}`}
              onClick={() => scrollToStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeStep
                  ? 'w-7 bg-[#1c1b19]'
                  : 'w-1.5 bg-[#1c1b19]/25 hover:bg-[#1c1b19]/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export const HomePage: React.FC = () => {
  const {
    heroSlides,
    heroIntervalSec,
    categories,
    products,
    reviews,
    navigate,
    cartSubtotal,
    formatPrice,
    convertAmount,
    currencySettings,
    bestSellersTiles,
    shopLookTiles,
  } = useStore();

  const activeSlides = heroSlides.filter((s) => s.active);
  const slidesToRender = activeSlides.length > 0 ? activeSlides : heroSlides;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selectedBestSellerSpotId, setSelectedBestSellerSpotId] = useState<string>(
    () => bestSellersTiles[0]?.hotspots[0]?.id || ''
  );
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(
    () => shopLookTiles[0]?.hotspots[0]?.id || ''
  );
  const [financingModalOpen, setFinancingModalOpen] = useState(false);
  const [selectedFinancingMonths, setSelectedFinancingMonths] = useState(3);
  const [emiAmount, setEmiAmount] = useState(cartSubtotal > 0 ? cartSubtotal : 2450);
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [loyaltyEmail, setLoyaltyEmail] = useState('');
  const [loyaltyJoined, setLoyaltyJoined] = useState(false);
  const [activeFilmId, setActiveFilmId] = useState<string | null>(null);

  // Carousel offset for Testimonials (4/4 Slider)
  const [testimonialSlide, setTestimonialSlide] = useState(0);

  useEffect(() => {
    if (currentSlideIndex >= slidesToRender.length) {
      setCurrentSlideIndex(0);
    }
  }, [slidesToRender.length, currentSlideIndex]);

  useEffect(() => {
    if (paused || slidesToRender.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slidesToRender.length);
    }, Math.max(3, heroIntervalSec) * 1000);
    return () => window.clearInterval(timer);
  }, [paused, slidesToRender.length, heroIntervalSec]);

  const activeSlide = slidesToRender[currentSlideIndex] || slidesToRender[0];

  const bestSellers = products.filter((p) => p.bestSeller);
  const newArrivals = products.filter((p) => p.newArrival);
  const approvedReviews = reviews.filter((r) => r.status === 'Approved');
  const reviewPages = Array.from(
    { length: Math.max(1, Math.ceil(approvedReviews.length / 4)) },
    (_, pageIdx) => approvedReviews.slice(pageIdx * 4, pageIdx * 4 + 4)
  );
  const safeTestimonialSlide = testimonialSlide >= reviewPages.length ? 0 : testimonialSlide;

  const renderMosaicGrid = (
    tiles: MosaicTile[],
    activeSpotId: string,
    onSelectSpot: (id: string) => void
  ) => {
    const renderMosaicTile = (tile: MosaicTile, className: string) => (
      <HotspotTileCard
        key={tile.id}
        tile={tile}
        activeSpotId={activeSpotId}
        onSelectSpot={onSelectSpot}
        className={className}
      />
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:h-[640px]">
        {/* Column 1: Full-Height Architectural Hero Scene */}
        {renderMosaicTile(tiles[0], 'lg:col-span-5 h-[420px] sm:h-[480px] lg:h-full')}

        {/* Column 2: Short Top + Tall Bottom (Staggered Split) */}
        <div className="lg:col-span-3 flex flex-col gap-3.5 sm:gap-4 lg:h-full min-h-0">
          {renderMosaicTile(tiles[1], 'h-[230px] lg:h-[235px] shrink-0')}
          {renderMosaicTile(tiles[2], 'h-[320px] lg:h-auto lg:flex-1 min-h-0')}
        </div>

        {/* Column 3: Balanced Staggered Stacked Pair */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4 lg:h-full min-h-0">
          {renderMosaicTile(tiles[3], 'h-[280px] lg:h-[305px] shrink-0')}
          {renderMosaicTile(tiles[4], 'h-[280px] lg:h-auto lg:flex-1 min-h-0')}
        </div>
      </div>
    );
  };

  return (
    <main>
      {/* 1. DYNAMIC AUTO-SLIDING HERO HEADER (lookcreative graphics) */}
      {activeSlide && (
        <section
          className="relative w-full overflow-hidden border-b"
          style={{ borderColor: 'var(--color-border)' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-label="Featured collections"
        >
          <div className="relative h-[500px] sm:h-[580px] lg:h-[640px] w-full">
            {slidesToRender.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  index === currentSlideIndex
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <SafeImage
                  src={slide.image}
                  alt={slide.assetDesignation || slide.headline}
                  className="w-full h-full object-cover"
                />
                {/* Measured gradient scrim for WCAG AA legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
              </div>
            ))}

            {/* Centered / Editorial Hero Content */}
            <div className="relative z-10 w-full max-w-[1840px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex flex-col justify-center items-center text-center">
              <div className="max-w-4xl space-y-5 text-white">
                <p className="text-sm sm:text-base font-medium tracking-wider opacity-90">
                  {activeSlide.kicker}
                  <span aria-hidden="true"> · </span>
                  <span className="opacity-80">{activeSlide.assetDesignation}</span>
                </p>

                <h1 className="font-display headline-balance text-4xl sm:text-6xl lg:text-[4.5rem] font-medium leading-[1.08] tracking-tight">
                  {activeSlide.headline}
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  {activeSlide.subheadline}
                </p>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => navigate(activeSlide.ctaTarget)}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#1c1b19] text-base font-semibold hover:bg-[#f3efe8] transition-colors cursor-pointer whitespace-nowrap shadow-lg"
                  >
                    <span>{activeSlide.ctaLabel}</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Slider Navigation Controls */}
              {slidesToRender.length > 1 && (
                <div className="absolute inset-x-4 sm:inset-x-8 bottom-6 flex items-center justify-between">
                  <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
                    {slidesToRender.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        role="tab"
                        aria-selected={index === currentSlideIndex}
                        aria-label={`View slide ${index + 1}`}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          index === currentSlideIndex ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlideIndex(
                          (prev) => (prev - 1 + slidesToRender.length) % slidesToRender.length
                        )
                      }
                      aria-label="Previous slide"
                      className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlideIndex((prev) => (prev + 1) % slidesToRender.length)
                      }
                      aria-label="Next slide"
                      className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. BEST SELLERS (Mosaic + Smooth 8-Item Horizontal Slider) */}
      <ProductSlider
        title="Best Sellers"
        subtitle="Signature architectural forms favored by collectors"
        products={bestSellers}
        topSlot={
          <div className="mb-12 sm:mb-14">
            {renderMosaicGrid(
              bestSellersTiles,
              selectedBestSellerSpotId,
              setSelectedBestSellerSpotId
            )}
          </div>
        }
      />

      {/* 3. SHOP BY CATEGORY (Centered Circular Thumbnails) */}
      <section
        className="border-y py-14 sm:py-18"
        style={{
          backgroundColor: 'var(--color-bg-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-medium">
              Shop By Categories
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Explore curated silhouettes across every room
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-8 w-full mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate({ page: 'shop', category: cat.name })}
                className="group w-[112px] sm:w-[128px] flex flex-col items-center text-center gap-2.5 cursor-pointer"
              >
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border transition-transform duration-200 group-hover:-translate-y-1 flex items-center justify-center"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: '#f6e4d8',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <img
                    src={resolveAssetUrl(cat.image)}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    style={{
                      objectPosition: cat.objectPosition || '50% 50%',
                      transform: `scale(${cat.imageScale || 1})`,
                    }}
                    className={`w-full h-full transition-transform duration-300 ${
                      cat.image.includes('whitebg_') || cat.image.endsWith('.png')
                        ? 'object-contain p-2 mix-blend-multiply'
                        : 'object-cover'
                    }`}
                  />
                </div>
                <p className="font-body text-sm font-medium group-hover:underline underline-offset-4 leading-snug">
                  {cat.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS (Smooth 8-Item Horizontal Slider) */}
      <ProductSlider
        title="New Arrivals"
        subtitle="Recent studio releases in solid timber and travertine"
        products={newArrivals}
      />

      {/* 5. SHOP THE LOOK (3-Column Asymmetric Interior Mosaic + Floating Hotspot Tags) */}
      <section
        className="border-t py-14 sm:py-18"
        style={{
          backgroundColor: 'var(--color-bg-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-medium">
              Shop the Look
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Hover or tap any marker across our styled rooms to view piece details and pricing
            </p>
          </div>

          {renderMosaicGrid(shopLookTiles, selectedHotspotId, setSelectedHotspotId)}

          {/* 2-Column Editorial Studio Feature Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div
              onClick={() => navigate({ page: 'about' })}
              className="md:col-span-5 relative rounded-xl overflow-hidden border min-h-[260px] flex items-end p-6 cursor-pointer group"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <SafeImage
                src="/src/assets/images/product_walnut_credenza_1794926094553.jpg"
                alt="Atelier timber craftsmanship"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-2">
                <p className="text-xs opacity-85">Material Provenance</p>
                <h3 className="font-display text-xl font-medium">
                  Crafted from kiln-dried timber &amp; Belgian flax
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4">
                  <span>Read Our Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div
              onClick={() => navigate({ page: 'contact' })}
              className="md:col-span-7 relative rounded-xl overflow-hidden border min-h-[260px] flex items-end p-6 cursor-pointer group"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <SafeImage
                src="/src/assets/images/hero_lookcreative_dining_1794926095951.jpg"
                alt="Vespera Design Studio & Trade Concierge"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 text-white space-y-2 max-w-md">
                <p className="text-xs opacity-85">Vespera Design Studio</p>
                <h3 className="font-display text-2xl font-medium">
                  From Spatial Consultation to White-Glove Delivery
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4">
                  <span>Book Studio Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TOP PICK OF THE SEASON (6x2 Architectural Grid) */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-18">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-medium">
            Top Pick of the Season
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Essential silhouettes curated across dining, living, study, and decorative objects
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {TOP_SEASON_PICKS.map((pick) => (
            <button
              key={pick.title}
              type="button"
              onClick={() => navigate({ page: 'shop', category: pick.category })}
              className="group text-center space-y-2.5 cursor-pointer"
            >
              <div
                className="aspect-square w-full rounded-lg overflow-hidden border transition-transform duration-200 group-hover:-translate-y-1"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <img
                  src={resolveAssetUrl(pick.image)}
                  alt={pick.title}
                  referrerPolicy="no-referrer"
                  style={{ objectPosition: pick.objectPosition || '50% 50%' }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="font-body text-sm font-medium group-hover:underline underline-offset-4">
                {pick.title}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 7. FLEXIBLE ATELIER FINANCING (Architectural 2-Column Split) */}
      {(() => {
        const activeTier =
          FINANCING_TIERS.find((t) => t.months === selectedFinancingMonths) ||
          FINANCING_TIERS[0];
        const previewPrincipal = cartSubtotal > 0 ? cartSubtotal : 2450;
        const previewTotal = previewPrincipal * (1 + activeTier.rate / 100);
        const previewMonthly = Math.round(previewTotal / activeTier.months);
        const featuredBoucle = products.find((p) =>
          p.name.toLowerCase().includes('bouclé') || p.name.toLowerCase().includes('solis')
        );

        return (
          <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 pb-14 sm:pb-18">
            <div
              className="rounded-xl overflow-hidden border grid grid-cols-1 lg:grid-cols-12 items-stretch"
              style={{
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Left Architectural Product Photography */}
              <div className="lg:col-span-6 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]">
                <SafeImage
                  src="/src/assets/images/product_boucle_lounge_1794926095999.jpg"
                  alt="Solis curved ivory bouclé lounge chair eligible for 0% monthly installments"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-wrap items-end justify-between gap-4 text-white">
                  <div className="space-y-1">
                    <p className="text-xs text-white/80">
                      Featured Seating · Hand-Turned White Oak &amp; Wool Bouclé
                    </p>
                    <p className="font-display text-xl sm:text-2xl font-medium">
                      {featuredBoucle ? featuredBoucle.name : 'Solis Curved Bouclé Lounge'}
                    </p>
                  </div>
                  {featuredBoucle && (
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'product', slug: featuredBoucle.slug })}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold underline underline-offset-4 hover:opacity-85 cursor-pointer whitespace-nowrap"
                    >
                      <span>Inspect Piece</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Interactive Financing Atelier Panel */}
              <div
                className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-between gap-8"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-contrast)',
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium tracking-wide opacity-75">
                      Atelier Installments · Instant Card Pre-Qualification
                    </p>
                    <h2 className="font-display headline-balance text-3xl sm:text-4xl font-medium leading-tight">
                      Flexible Monthly Financing
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed opacity-85 max-w-xl">
                    Spread residential or trade commissions across 3 to 12 monthly payments with 0% interest for 3 months on major credit cards.
                  </p>
                </div>

                {/* Interactive Plan Term Selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs opacity-80">
                    <span>Select an installment schedule</span>
                    <span className="tabular-nums">
                      {cartSubtotal > 0
                        ? `Current Bag: ${formatPrice(cartSubtotal)}`
                        : `Sample Order: ${formatPrice(2450)}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {FINANCING_TIERS.map((tier) => {
                      const active = tier.months === activeTier.months;
                      return (
                        <button
                          key={tier.term}
                          type="button"
                          onClick={() => setSelectedFinancingMonths(tier.months)}
                          className="px-3.5 py-3 rounded-lg border text-left transition-colors cursor-pointer"
                          style={{
                            backgroundColor: active
                              ? 'var(--color-accent-contrast)'
                              : 'color-mix(in srgb, var(--color-accent-contrast) 6%, transparent)',
                            color: active
                              ? 'var(--color-accent)'
                              : 'var(--color-accent-contrast)',
                            borderColor: active
                              ? 'var(--color-accent-contrast)'
                              : 'color-mix(in srgb, var(--color-accent-contrast) 22%, transparent)',
                          }}
                        >
                          <p className="text-lg font-semibold tabular-nums leading-none">
                            {tier.label}
                          </p>
                          <p className="text-xs mt-1.5 opacity-85 whitespace-nowrap">
                            {tier.term}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Calculated Estimate Row */}
                  <div
                    className="pt-4 border-t flex flex-wrap items-baseline justify-between gap-3"
                    style={{
                      borderColor:
                        'color-mix(in srgb, var(--color-accent-contrast) 18%, transparent)',
                    }}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs opacity-75">
                        Estimated {activeTier.term} Plan ({activeTier.label} APR)
                      </p>
                      <p className="text-xs opacity-70 tabular-nums">
                        Total payable: {formatPrice(previewTotal)}
                      </p>
                    </div>
                    <p className="font-display text-2xl sm:text-3xl font-medium tabular-nums">
                      {formatPrice(previewMonthly)}
                      <span className="text-sm font-body font-normal opacity-80">/mo</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEmiAmount(cartSubtotal > 0 ? cartSubtotal : 2450);
                      setFinancingModalOpen(true);
                    }}
                    className="px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--color-accent-contrast)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    Calculate Custom Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'shop', category: 'All' })}
                    className="px-5 py-3 rounded-lg border text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                    style={{
                      borderColor:
                        'color-mix(in srgb, var(--color-accent-contrast) 30%, transparent)',
                    }}
                  >
                    <span>Shop All Pieces</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Financing Calculator Modal */}
      {financingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="EMI Financing Schedule">
          <div className="fixed inset-0 bg-black/45" onClick={() => setFinancingModalOpen(false)} />
          <div
            className="relative w-full max-w-lg rounded-xl border p-6 space-y-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="font-display text-xl font-medium">Card EMI &amp; Installment Calculator</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Estimate monthly payments on any qualifying furniture order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFinancingModalOpen(false)}
                aria-label="Close financing modal"
                className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Order Amount ({currencySettings.currency})
              </label>
              <input
                type="number"
                min={currencySettings.currency === 'BDT' ? convertAmount(250) : 250}
                step={currencySettings.currency === 'BDT' ? 500 : 50}
                value={convertAmount(emiAmount)}
                onChange={(e) => {
                  const raw = Math.max(0, Number(e.target.value));
                  setEmiAmount(
                    currencySettings.currency === 'BDT'
                      ? raw / currencySettings.bdtExchangeRate
                      : raw
                  );
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent font-mono-tabular"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>

            <div className="rounded-lg border divide-y text-sm" style={{ borderColor: 'var(--color-border)' }}>
              {FINANCING_TIERS.map((tier) => {
                const totalWithFee = emiAmount * (1 + tier.rate / 100);
                const monthly = totalWithFee / tier.months;
                return (
                  <div key={tier.term} className="p-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{tier.term} Plan</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {tier.label} interest · Total {formatPrice(totalWithFee)}
                      </p>
                    </div>
                    <span className="font-mono-tabular font-semibold">
                      {formatPrice(monthly)}/mo
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setFinancingModalOpen(false);
                  navigate({ page: 'shop', category: 'All' });
                }}
                className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
              >
                Browse Eligible Pieces
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. LOYALTY POINTS & STUDIO FILMS */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20 space-y-14">
        <div className="space-y-10 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-medium">
            Vespera Loyalty Points
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-3 px-4">
              <div
                className="w-16 h-16 rounded-full border flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brass)',
                }}
              >
                <UserPlus className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-body text-base font-semibold">Sign Up</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Create your studio profile and earn 500 welcome points on your first sign-in.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 px-4">
              <div
                className="w-16 h-16 rounded-full border flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brass)',
                }}
              >
                <Coins className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-body text-base font-semibold">Collect</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Shop our collections to earn points with every architectural piece and referral.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 px-4">
              <div
                className="w-16 h-16 rounded-full border flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brass)',
                }}
              >
                <Gift className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-body text-base font-semibold">Redeem</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Unlock private collection previews, white-glove upgrades, and studio privileges.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setLoyaltyModalOpen(true)}
              className="vespera-btn-primary px-8 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide cursor-pointer whitespace-nowrap"
            >
              How It Works
            </button>
          </div>
        </div>

        {/* 3-Column Studio Video / Story Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STUDIO_FILMS.map((film) => (
            <button
              key={film.id}
              type="button"
              onClick={() => setActiveFilmId(film.id)}
              className="group relative aspect-video w-full rounded-xl overflow-hidden border text-left cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <SafeImage
                src={film.image}
                alt={film.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15" />

              {/* Center Play Affordance */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-white/90 text-[#1c1b19] flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-xs opacity-80">{film.subtitle}</p>
                <p className="font-display text-sm sm:text-base font-medium leading-snug mt-0.5">
                  {film.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Loyalty Program Modal */}
      {loyaltyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Vespera Loyalty Program">
          <div className="fixed inset-0 bg-black/45" onClick={() => setLoyaltyModalOpen(false)} />
          <div
            className="relative w-full max-w-lg rounded-xl border p-6 space-y-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="font-display text-xl font-medium">Vespera Loyalty Program</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Earn 10 points per {formatPrice(100)} spent · Redeem anytime at checkout
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLoyaltyModalOpen(false)}
                aria-label="Close loyalty modal"
                className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-lg border divide-y text-sm" style={{ borderColor: 'var(--color-border)' }}>
              <div className="p-3.5 flex justify-between">
                <span>First Studio Registration</span>
                <span className="font-mono-tabular font-semibold">+500 pts</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Furniture &amp; Lighting Orders</span>
                <span className="font-mono-tabular font-semibold">10 pts / {formatPrice(100)}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>500 Points Redemption Value</span>
                <span className="font-mono-tabular font-semibold">{formatPrice(100)} Credit</span>
              </div>
            </div>

            {loyaltyJoined ? (
              <div className="p-4 rounded-lg text-sm space-y-1" style={{ backgroundColor: 'var(--color-bg-surface-alt)' }}>
                <p className="font-semibold">Welcome to Vespera Loyalty</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  500 welcome points have been reserved for {loyaltyEmail}.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!loyaltyEmail.trim()) return;
                  setLoyaltyJoined(true);
                }}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <input
                  type="email"
                  required
                  value={loyaltyEmail}
                  onChange={(e) => setLoyaltyEmail(e.target.value)}
                  placeholder="Enter your email to claim 500 pts"
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
                <button
                  type="submit"
                  className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  Claim 500 Points
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Studio Film Story Modal */}
      {activeFilmId && (() => {
        const film = STUDIO_FILMS.find((f) => f.id === activeFilmId);
        if (!film) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={film.title}>
            <div className="fixed inset-0 bg-black/50" onClick={() => setActiveFilmId(null)} />
            <div
              className="relative w-full max-w-xl rounded-xl border overflow-hidden shadow-2xl"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <div className="aspect-video w-full relative">
                <SafeImage src={film.image} alt={film.title} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setActiveFilmId(null)}
                  aria-label="Close story modal"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {film.subtitle}
                  </p>
                  <h3 className="font-display text-xl font-medium mt-1">{film.title}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {film.summary}
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilmId(null);
                      navigate({ page: 'shop', category: film.targetCategory });
                    }}
                    className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Explore {film.targetCategory}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9. CUSTOMER TESTIMONIALS (2x2 White Cards Over Interior Backdrop · 4/4 Slider) */}
      <section
        className="relative overflow-hidden border-t py-16 sm:py-22"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="Client testimonials"
      >
        {/* Full-Bleed Architectural Interior Photography Backdrop */}
        <SafeImage
          src="/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg"
          alt="Sunlit Vespera Atelier interior backdrop"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/55" />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
          {/* Header & Slider Pagination Strip */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 text-white">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-medium tracking-wider opacity-85">
                Verified Studio Clients · 4.9 / 5.0 Average
              </p>
              <h2 className="font-display headline-balance text-3xl sm:text-4xl font-medium">
                Client Impressions
              </h2>
              <p className="text-sm text-white/85">
                Residential collectors and architects sharing how Vespera pieces live inside their spaces.
              </p>
            </div>

            {reviewPages.length > 1 && (
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className="text-xs font-mono-tabular text-white/85 mr-1">
                  {safeTestimonialSlide + 1} / {reviewPages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTestimonialSlide((prev) => (prev - 1 + reviewPages.length) % reviewPages.length)
                  }
                  aria-label="Previous 4 testimonials"
                  className="w-10 h-10 rounded-full bg-white/95 text-[#1c1b19] hover:bg-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTestimonialSlide((prev) => (prev + 1) % reviewPages.length)
                  }
                  aria-label="Next 4 testimonials"
                  className="w-10 h-10 rounded-full bg-white/95 text-[#1c1b19] hover:bg-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 4/4 Horizontal Slider Viewport (2x2 White Cards Per Slide) */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${safeTestimonialSlide * 100}%)` }}
            >
              {reviewPages.map((pageReviews, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
                >
                  {pageReviews.map((review) => {
                    const reviewedProduct = products.find((p) => p.id === review.productId);
                    const reviewerInitials = review.authorName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <article
                        key={review.id}
                        className="bg-white text-[#1c1b19] rounded-xl p-7 sm:p-9 shadow-xl flex flex-col justify-between gap-7"
                      >
                        <p className="text-[15px] sm:text-base leading-relaxed text-[#2b2926]">
                          &ldquo;{review.comment}&rdquo;
                        </p>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-[#e6dfd5] bg-[#f3efe8] flex items-center justify-center">
                              {review.authorAvatar ? (
                                <SafeImage
                                  src={review.authorAvatar}
                                  alt={review.authorName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-display text-sm font-semibold text-[#1c1b19]">
                                  {reviewerInitials}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-display text-lg font-medium leading-snug text-[#1c1b19] truncate">
                                {review.authorName}
                              </p>
                              <p className="text-xs text-[#6b655e] truncate">
                                {review.authorRole}
                              </p>
                            </div>
                          </div>

                          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center gap-0.5" style={{ color: 'var(--color-brass)' }}>
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            {reviewedProduct ? (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate({ page: 'product', slug: reviewedProduct.slug })
                                }
                                className="text-[11px] font-medium text-[#5c574f] hover:text-[#1c1b19] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                              >
                                {reviewedProduct.name}
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#5c574f]">
                                {review.productName}
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Slide Dots */}
          {reviewPages.length > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1" role="tablist" aria-label="Testimonial slides">
              {reviewPages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === safeTestimonialSlide}
                  aria-label={`View testimonial set ${idx + 1}`}
                  onClick={() => setTestimonialSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === safeTestimonialSlide
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
