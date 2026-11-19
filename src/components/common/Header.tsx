import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Heart,
  HelpCircle,
  History,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from './SafeImage';

const QUICK_SEARCH_TERMS = ['Bouclé', 'Walnut', 'Travertine', 'Linen', 'Lighting', 'Desk'];

export const Header: React.FC = () => {
  const {
    route,
    navigate,
    products,
    cartItemCount,
    setCartOpen,
    userProfile,
    content,
    recentlyViewedIds,
    wishlistIds,
    formatPrice,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 40);
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMoreOpen(false);
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  // Show navbar on route change
  useEffect(() => {
    setHeaderVisible(true);
    lastScrollYRef.current = window.scrollY || 0;
  }, [route.page]);

  // Hide on scroll down, reveal on scroll up
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);
        const lastY = lastScrollYRef.current;
        const delta = currentY - lastY;

        setIsScrolled(currentY > 16);

        if (searchOpen || moreOpen || mobileMenuOpen || currentY <= 40) {
          setHeaderVisible(true);
        } else if (delta > 6 && currentY > 90) {
          setHeaderVisible(false);
        } else if (delta < -6) {
          setHeaderVisible(true);
        }

        lastScrollYRef.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchOpen, moreOpen, mobileMenuOpen]);

  const matchingProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [products, searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate({ page: 'shop', category: 'All', query: q || undefined });
  };

  const navItems: Array<{ label: string; active: boolean; onClick: () => void }> = [
    {
      label: 'Home',
      active: route.page === 'home',
      onClick: () => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setMoreOpen(false);
        navigate({ page: 'home' });
      },
    },
    {
      label: 'Shop',
      active: route.page === 'shop' || route.page === 'product',
      onClick: () => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setMoreOpen(false);
        navigate({ page: 'shop', category: 'All' });
      },
    },
    {
      label: 'Collections',
      active: route.page === 'collections',
      onClick: () => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setMoreOpen(false);
        navigate({ page: 'collections' });
      },
    },
    {
      label: 'About',
      active: route.page === 'about',
      onClick: () => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setMoreOpen(false);
        navigate({ page: 'about' });
      },
    },
  ];

  const moreItems: Array<{
    label: string;
    description: string;
    page: 'showrooms' | 'service' | 'help' | 'recently-viewed' | 'wishlist';
    icon: React.FC<{ className?: string }>;
    count?: number;
  }> = [
    {
      label: 'Showroom',
      description: 'Visit our SF, NY & Copenhagen galleries',
      page: 'showrooms',
      icon: MapPin,
    },
    {
      label: 'Service Request',
      description: 'Timber care, repairs & warranty claims',
      page: 'service',
      icon: Wrench,
    },
    {
      label: 'Help (Q&A)',
      description: 'Shipping, care & buyer answers',
      page: 'help',
      icon: HelpCircle,
    },
    {
      label: 'Recently Viewed',
      description: 'Pieces you inspected across the catalog',
      page: 'recently-viewed',
      icon: History,
      count: recentlyViewedIds.length,
    },
    {
      label: 'Wishlist',
      description: 'Bookmarked furniture and lighting pieces',
      page: 'wishlist',
      icon: Heart,
      count: wishlistIds.length,
    },
  ];

  const isMoreActive =
    route.page === 'showrooms' ||
    route.page === 'service' ||
    route.page === 'help' ||
    route.page === 'recently-viewed' ||
    route.page === 'wishlist';

  const userFirstName = userProfile?.name.split(' ')[0];

  return (
    <div
      className={`sticky top-0 z-40 transition-transform duration-300 ease-out will-change-transform ${
        headerVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
      }`}
    >
      {content.showAnnouncementBar && !bannerDismissed && (
        <div
          className="hidden sm:flex items-center justify-center relative px-10 py-1.5 text-xs tracking-wide backdrop-blur-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 88%, transparent)',
            color: 'var(--color-accent-contrast)',
          }}
        >
          <span className="truncate">
            {content.announcementBar.replace(/\$2,500/g, formatPrice(2500))}
          </span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="absolute right-4 p-1 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header
        className="border-b backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-bg-canvas) 45%, transparent)',
          borderColor: 'rgba(255, 255, 255, 0.35)',
          boxShadow: isScrolled ? '0 8px 32px rgba(28, 27, 25, 0.08)' : 'none',
        }}
      >
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchOpen(false);
              navigate({ page: 'home' });
            }}
            className="font-display text-2xl font-semibold tracking-tight whitespace-nowrap shrink-0 cursor-pointer text-left justify-self-start"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Vespera
          </button>

          {/* Zone 2: 5 Clean Single-Line Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center justify-self-center gap-7 lg:gap-9 text-base lg:text-[17px] font-medium"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer group"
                style={{
                  color: item.active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-px transition-transform origin-left duration-200 ${
                    item.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                />
              </button>
            ))}

            {/* More Dropdown Nav Item (Showroom, Service Request, Help Q&A) */}
            <div ref={moreDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setMoreOpen((v) => !v);
                }}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className="relative py-1 inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer group"
                style={{
                  color:
                    isMoreActive || moreOpen
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                }}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    moreOpen ? 'rotate-180' : ''
                  }`}
                />
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-px transition-transform origin-left duration-200 ${
                    isMoreActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                />
              </button>

              {moreOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-3 w-72 rounded-xl border p-2 shadow-xl z-50 space-y-1"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {moreItems.map((sub) => {
                    const Icon = sub.icon;
                    const subActive = route.page === sub.page;
                    return (
                      <button
                        key={sub.page}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMoreOpen(false);
                          navigate({ page: sub.page });
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 hover:bg-black/5 transition-colors cursor-pointer"
                        style={{
                          backgroundColor: subActive
                            ? 'var(--color-bg-surface-alt)'
                            : 'transparent',
                        }}
                      >
                        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="text-sm font-medium leading-tight"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {sub.label}
                            </p>
                            {typeof sub.count === 'number' && sub.count > 0 && (
                              <span
                                className="text-xs font-mono-tabular"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                ({sub.count})
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs mt-0.5 leading-snug"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {sub.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Utility Controls (Search, User Profile, Bag, Mobile Menu) */}
          <div className="flex items-center gap-2 shrink-0 justify-self-end">
            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen((v) => !v);
              }}
              aria-label="Search catalog"
              aria-expanded={searchOpen}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3 min-h-[40px] rounded-lg border text-xs font-medium hover:bg-black/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer backdrop-blur-md"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: searchOpen
                  ? 'color-mix(in srgb, var(--color-bg-surface-alt) 75%, transparent)'
                  : 'color-mix(in srgb, var(--color-bg-surface) 48%, transparent)',
                color: 'var(--color-text-primary)',
              }}
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              <span className="hidden lg:inline">Search</span>
            </button>

            {/* Wishlist Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(false);
                navigate({ page: 'wishlist' });
              }}
              aria-label={`Wishlist (${wishlistIds.length} saved)`}
              title="Saved Wishlist"
              className="inline-flex items-center gap-1.5 px-2.5 min-h-[40px] rounded-lg border text-xs font-medium hover:bg-black/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer backdrop-blur-md"
              style={{
                borderColor:
                  route.page === 'wishlist' ? 'var(--color-text-primary)' : 'var(--color-border)',
                backgroundColor:
                  route.page === 'wishlist'
                    ? 'color-mix(in srgb, var(--color-bg-surface-alt) 75%, transparent)'
                    : 'color-mix(in srgb, var(--color-bg-surface) 48%, transparent)',
                color: 'var(--color-text-primary)',
              }}
            >
              <Heart
                className={`w-4 h-4 ${
                  wishlistIds.length > 0 ? 'fill-[#b84a14] text-[#b84a14]' : ''
                }`}
              />
              {wishlistIds.length > 0 && (
                <span className="tabular-nums">{wishlistIds.length}</span>
              )}
            </button>

            {/* User Profile Page Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(false);
                navigate({ page: 'account', tab: 'overview' });
              }}
              aria-label={userProfile ? `Account: ${userProfile.name}` : 'Sign in to account'}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3 min-h-[40px] rounded-lg border text-xs font-medium hover:bg-black/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer backdrop-blur-md"
              style={{
                borderColor:
                  route.page === 'account' ? 'var(--color-text-primary)' : 'var(--color-border)',
                backgroundColor:
                  route.page === 'account'
                    ? 'color-mix(in srgb, var(--color-bg-surface-alt) 75%, transparent)'
                    : 'color-mix(in srgb, var(--color-bg-surface) 48%, transparent)',
                color: 'var(--color-text-primary)',
              }}
            >
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">
                {userFirstName || 'Sign In'}
              </span>
            </button>

            {/* Primary Bag CTA */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setCartOpen(true);
              }}
              className="vespera-btn-primary inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="tabular-nums">Bag ({cartItemCount})</span>
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setMobileMenuOpen((v) => !v);
              }}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors cursor-pointer backdrop-blur-md"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'color-mix(in srgb, var(--color-bg-surface) 48%, transparent)',
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar & Live Product Preview Panel */}
        {searchOpen && (
          <div
            className="border-t shadow-lg"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-5 space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <Search
                    className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-55"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search sofas, travertine tables, oak chairs, lighting..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
                <button
                  type="submit"
                  className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  Search Catalog
                </button>
              </form>

              {searchTerm.trim() === '' ? (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>Popular searches:</span>
                  {QUICK_SEARCH_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchTerm(term)}
                      className="px-2.5 py-1 rounded-md border hover:bg-black/5 transition-colors cursor-pointer"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-bg-surface-alt)',
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              ) : matchingProducts.length === 0 ? (
                <p className="text-xs py-2" style={{ color: 'var(--color-text-muted)' }}>
                  No pieces match “{searchTerm}”. Try searching by category or material such as Oak, Walnut, or Travertine.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Instant Results ({matchingProducts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const q = searchTerm.trim();
                        setSearchOpen(false);
                        navigate({ page: 'shop', category: 'All', query: q });
                      }}
                      className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      <span>View all in Shop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matchingProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          navigate({ page: 'product', slug: product.slug });
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-lg border text-left hover:bg-black/5 transition-colors cursor-pointer"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-bg-surface-alt)',
                        }}
                      >
                        <div className="w-16 h-14 rounded-md bg-white overflow-hidden shrink-0 border flex items-center justify-center" style={{ borderColor: 'var(--color-border)' }}>
                          <SafeImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                            {product.category} · {product.material}
                          </p>
                          <p className="font-display text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-xs font-semibold tabular-nums mt-0.5">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Hamburger Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-1"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-colors cursor-pointer"
                style={{
                  color: item.active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  backgroundColor: item.active ? 'var(--color-bg-surface-alt)' : 'transparent',
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}

            {/* More Submenu in Mobile Drawer */}
            <div className="pt-2 mt-2 border-t space-y-1" style={{ borderColor: 'var(--color-border)' }}>
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                More
              </p>
              {moreItems.map((sub) => {
                const Icon = sub.icon;
                const subActive = route.page === sub.page;
                return (
                  <button
                    key={sub.page}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate({ page: sub.page });
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                    style={{
                      color: subActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      backgroundColor: subActive ? 'var(--color-bg-surface-alt)' : 'transparent',
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{sub.label}</span>
                    {typeof sub.count === 'number' && sub.count > 0 && (
                      <span className="text-xs font-mono-tabular opacity-75">
                        ({sub.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate({ page: 'account', tab: 'overview' });
                }}
                className="flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <User className="w-3.5 h-3.5" />
                <span>{userProfile ? userProfile.name : 'Sign In / Profile'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate({ page: 'track' });
                }}
                className="px-3 py-2.5 rounded-lg border text-xs font-medium cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Track Order
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
