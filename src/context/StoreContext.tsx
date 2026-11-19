import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_CONTENT,
  INITIAL_CURRENCY_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_HERO_SLIDES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_VIEW_COUNTS,
  INITIAL_REVIEWS,
  INITIAL_SHOP_LOOK_TILES,
  INITIAL_BEST_SELLERS_TILES,
  INITIAL_COLLECTION_TILES,
  INITIAL_SITE_VISITS,
  INITIAL_THEME_SETTINGS,
  INITIAL_TYPOGRAPHY_SETTINGS,
} from '../data/initialData';
import {
  AccountTab,
  AdminModule,
  CartItem,
  CategoryThumbnail,
  CurrencySettings,
  Customer,
  FurnitureCategory,
  HeroSlide,
  MosaicTile,
  Order,
  OrderStatus,
  Product,
  Review,
  ReviewStatus,
  RouteTarget,
  StoreContent,
  ThemeSettings,
  TypographySettings,
  UserProfile,
} from '../types/store';
import {
  ALLOWED_BODY_FONTS,
  ALLOWED_DISPLAY_FONTS,
  clampInteger,
  clampNumber,
  generateRandomHex,
  getRateLimitStatus,
  isAdminSessionValid,
  isValidEmail,
  recordFailedAttempt,
  safeDecodeURIComponent,
  sanitizeEmail,
  sanitizeFontFamily,
  sanitizeHexColor,
  sanitizeImageUrl,
  sanitizeMultilineText,
  sanitizePhone,
  sanitizeText,
} from '../utils/security';

interface PersistedState {
  products: Product[];
  heroSlides: HeroSlide[];
  heroIntervalSec: number;
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  themeSettings: ThemeSettings;
  typographySettings: TypographySettings;
  content: StoreContent;
  cart: CartItem[];
  userProfile: UserProfile | null;
  recentlyViewedIds: string[];
  wishlistIds: string[];
  currencySettings: CurrencySettings;
  bestSellersTiles: MosaicTile[];
  shopLookTiles: MosaicTile[];
  collectionTiles: MosaicTile[];
  siteVisits: number;
  productViewCounts: Record<string, number>;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  id: INITIAL_CUSTOMERS[0].id,
  name: INITIAL_CUSTOMERS[0].name,
  email: INITIAL_CUSTOMERS[0].email,
  phone: INITIAL_CUSTOMERS[0].phone,
  city: INITIAL_CUSTOMERS[0].city,
  membershipTier: 'Atelier Member',
  loyaltyPoints: 840,
};

const STORAGE_KEY = 'vespera_atelier_store_v3';

type SharedStateSlice = Pick<
  PersistedState,
  | 'products'
  | 'heroSlides'
  | 'heroIntervalSec'
  | 'orders'
  | 'customers'
  | 'reviews'
  | 'themeSettings'
  | 'typographySettings'
  | 'content'
  | 'currencySettings'
  | 'bestSellersTiles'
  | 'shopLookTiles'
  | 'collectionTiles'
  | 'siteVisits'
  | 'productViewCounts'
>;

function extractSharedState(s: PersistedState): SharedStateSlice {
  return {
    products: s.products,
    heroSlides: s.heroSlides,
    heroIntervalSec: s.heroIntervalSec,
    orders: s.orders,
    customers: s.customers,
    reviews: s.reviews,
    themeSettings: s.themeSettings,
    typographySettings: s.typographySettings,
    content: s.content,
    currencySettings: s.currencySettings,
    bestSellersTiles: s.bestSellersTiles,
    shopLookTiles: s.shopLookTiles,
    collectionTiles: s.collectionTiles,
    siteVisits: s.siteVisits,
    productViewCounts: s.productViewCounts,
  };
}

function mergeServerData(
  prev: PersistedState,
  data: Partial<SharedStateSlice>
): PersistedState {
  return {
    ...prev,
    products: Array.isArray(data.products)
      ? data.products.map((p) => ({
          ...p,
          images: (Array.isArray(p.images) ? p.images : [])
            .map((img) => sanitizeImageUrl(img))
            .filter(Boolean),
          price: clampNumber(p.price, 1, 1_000_000, 100),
          stock: clampInteger(p.stock, 0, 100_000, 0),
        }))
      : prev.products,
    heroSlides:
      Array.isArray(data.heroSlides) && data.heroSlides.length > 0
        ? data.heroSlides.map((slide) => ({
            ...slide,
            image:
              sanitizeImageUrl(slide.image) ||
              '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
          }))
        : prev.heroSlides,
    heroIntervalSec:
      data.heroIntervalSec !== undefined
        ? clampInteger(data.heroIntervalSec, 3, 20, prev.heroIntervalSec)
        : prev.heroIntervalSec,
    orders: Array.isArray(data.orders) ? data.orders : prev.orders,
    customers: Array.isArray(data.customers) ? data.customers : prev.customers,
    reviews: Array.isArray(data.reviews) ? data.reviews : prev.reviews,
    themeSettings: data.themeSettings
      ? sanitizeTheme(data.themeSettings)
      : prev.themeSettings,
    typographySettings: data.typographySettings
      ? sanitizeTypography(data.typographySettings)
      : prev.typographySettings,
    content: data.content ? { ...prev.content, ...data.content } : prev.content,
    currencySettings: data.currencySettings
      ? {
          currency: data.currencySettings.currency === 'BDT' ? 'BDT' : 'USD',
          bdtExchangeRate: clampNumber(
            data.currencySettings.bdtExchangeRate,
            1,
            10000,
            prev.currencySettings.bdtExchangeRate
          ),
        }
      : prev.currencySettings,
    bestSellersTiles:
      Array.isArray(data.bestSellersTiles) && data.bestSellersTiles.length === 5
        ? sanitizeTilesList(data.bestSellersTiles)
        : prev.bestSellersTiles,
    shopLookTiles:
      Array.isArray(data.shopLookTiles) && data.shopLookTiles.length === 5
        ? sanitizeTilesList(data.shopLookTiles)
        : prev.shopLookTiles,
    collectionTiles:
      Array.isArray(data.collectionTiles) && data.collectionTiles.length === 3
        ? sanitizeTilesList(data.collectionTiles)
        : prev.collectionTiles,
    siteVisits:
      data.siteVisits !== undefined
        ? clampInteger(data.siteVisits, 0, 100_000_000, prev.siteVisits)
        : prev.siteVisits,
    productViewCounts:
      data.productViewCounts && typeof data.productViewCounts === 'object'
        ? { ...prev.productViewCounts, ...data.productViewCounts }
        : prev.productViewCounts,
  };
}

function sanitizeTheme(raw?: Partial<ThemeSettings>): ThemeSettings {
  return {
    bgCanvas: sanitizeHexColor(raw?.bgCanvas, INITIAL_THEME_SETTINGS.bgCanvas),
    bgSurface: sanitizeHexColor(raw?.bgSurface, INITIAL_THEME_SETTINGS.bgSurface),
    bgSurfaceAlt: sanitizeHexColor(raw?.bgSurfaceAlt, INITIAL_THEME_SETTINGS.bgSurfaceAlt),
    textPrimary: sanitizeHexColor(raw?.textPrimary, INITIAL_THEME_SETTINGS.textPrimary),
    textMuted: sanitizeHexColor(raw?.textMuted, INITIAL_THEME_SETTINGS.textMuted),
    accent: sanitizeHexColor(raw?.accent, INITIAL_THEME_SETTINGS.accent),
    brass: sanitizeHexColor(raw?.brass, INITIAL_THEME_SETTINGS.brass),
  };
}

function sanitizeTypography(raw?: Partial<TypographySettings>): TypographySettings {
  return {
    displayFont: sanitizeFontFamily(
      raw?.displayFont,
      ALLOWED_DISPLAY_FONTS,
      INITIAL_TYPOGRAPHY_SETTINGS.displayFont
    ),
    bodyFont: sanitizeFontFamily(
      raw?.bodyFont,
      ALLOWED_BODY_FONTS,
      INITIAL_TYPOGRAPHY_SETTINGS.bodyFont
    ),
  };
}

function sanitizeTilesList(tiles: MosaicTile[]): MosaicTile[] {
  return tiles.map((tile) => ({
    ...tile,
    label: sanitizeText(tile.label, 120),
    alt: sanitizeText(tile.alt, 220),
    image: sanitizeImageUrl(tile.image) || '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
    hotspots: Array.isArray(tile.hotspots)
      ? tile.hotspots.map((spot) => ({
          ...spot,
          xPercent: clampNumber(spot.xPercent, 0, 100, 50),
          yPercent: clampNumber(spot.yPercent, 0, 100, 50),
          customTitle: spot.customTitle ? sanitizeText(spot.customTitle, 80) : undefined,
          customSubtitle: spot.customSubtitle ? sanitizeText(spot.customSubtitle, 120) : undefined,
          badgeText: spot.badgeText ? sanitizeText(spot.badgeText, 24) : undefined,
          customPrice:
            spot.customPrice !== undefined
              ? clampNumber(spot.customPrice, 0, 1_000_000, 0)
              : undefined,
        }))
      : [],
  }));
}

function darkenHex(hex: string, amount = 0.14): string {
  const safeHex = sanitizeHexColor(hex, INITIAL_THEME_SETTINGS.accent);
  const clean = safeHex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getContrastText(hex: string): string {
  const safeHex = sanitizeHexColor(hex, INITIAL_THEME_SETTINGS.accent);
  const clean = safeHex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1c1b19' : '#faf8f5';
}

function parseHashRoute(): RouteTarget {
  const rawHash = window.location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = rawHash.split('?');
  const searchParams = new URLSearchParams(queryPart || '');
  const rawQuery = searchParams.get('q');
  const query = rawQuery ? sanitizeText(rawQuery, 120) || undefined : undefined;
  const segments = pathPart
    .split('/')
    .filter(Boolean)
    .slice(0, 6)
    .map((s) => safeDecodeURIComponent(s));

  if (segments.length === 0) return { page: 'home' };
  if (segments[0] === 'shop') {
    const cat = segments[1] as FurnitureCategory | 'All' | undefined;
    return { page: 'shop', category: cat || 'All', query };
  }
  if (segments[0] === 'collections') return { page: 'collections' };
  if (segments[0] === 'product' && segments[1]) {
    return { page: 'product', slug: segments[1] };
  }
  if (segments[0] === 'track') {
    return { page: 'track', orderNumber: segments[1] || undefined };
  }
  if (segments[0] === 'account') {
    const tab = (segments[1] as AccountTab) || 'overview';
    const validTabs: AccountTab[] = ['overview', 'orders', 'profile', 'loyalty'];
    return { page: 'account', tab: validTabs.includes(tab) ? tab : 'overview' };
  }
  if (segments[0] === 'checkout') return { page: 'checkout' };
  if (segments[0] === 'about') return { page: 'about' };
  if (segments[0] === 'showrooms') return { page: 'showrooms' };
  if (segments[0] === 'service') return { page: 'service' };
  if (segments[0] === 'help') return { page: 'help' };
  if (segments[0] === 'recently-viewed') return { page: 'recently-viewed' };
  if (segments[0] === 'wishlist') return { page: 'wishlist' };
  if (segments[0] === 'events') return { page: 'events' };
  if (segments[0] === 'style-report') return { page: 'style-report' };
  if (segments[0] === 'innovation') return { page: 'innovation' };
  if (segments[0] === 'contact') return { page: 'contact' };
  if (segments[0] === 'privacy') return { page: 'privacy' };
  if (segments[0] === 'admin') {
    const mod = (segments[1] as AdminModule) || 'overview';
    const validModules: AdminModule[] = [
      'overview',
      'products',
      'orders',
      'customers',
      'content',
      'hotspots',
      'reviews',
      'settings',
    ];
    const resolvedMod = validModules.includes(mod) ? mod : 'overview';
    if (resolvedMod === 'products' && segments[2] === 'new') {
      return { page: 'admin', module: 'products', productMode: 'new' };
    }
    if (resolvedMod === 'products' && segments[2] === 'edit' && segments[3]) {
      return { page: 'admin', module: 'products', productMode: 'edit', productId: segments[3] };
    }
    return { page: 'admin', module: resolvedMod };
  }
  return { page: 'home' };
}

function routeToHash(target: RouteTarget): string {
  switch (target.page) {
    case 'home':
      return '#/';
    case 'shop': {
      const base =
        target.category && target.category !== 'All'
          ? `#/shop/${encodeURIComponent(target.category)}`
          : '#/shop';
      return target.query && target.query.trim()
        ? `${base}?q=${encodeURIComponent(target.query.trim())}`
        : base;
    }
    case 'collections':
      return '#/collections';
    case 'product':
      return `#/product/${encodeURIComponent(target.slug)}`;
    case 'track':
      return target.orderNumber
        ? `#/track/${encodeURIComponent(target.orderNumber)}`
        : '#/track';
    case 'account':
      return target.tab && target.tab !== 'overview'
        ? `#/account/${target.tab}`
        : '#/account';
    case 'checkout':
      return '#/checkout';
    case 'about':
      return '#/about';
    case 'showrooms':
      return '#/showrooms';
    case 'service':
      return '#/service';
    case 'help':
      return '#/help';
    case 'recently-viewed':
      return '#/recently-viewed';
    case 'wishlist':
      return '#/wishlist';
    case 'events':
      return '#/events';
    case 'style-report':
      return '#/style-report';
    case 'innovation':
      return '#/innovation';
    case 'contact':
      return '#/contact';
    case 'privacy':
      return '#/privacy';
    case 'admin':
      if (target.module === 'products' && target.productMode === 'new') {
        return '#/admin/products/new';
      }
      if (target.module === 'products' && target.productMode === 'edit' && target.productId) {
        return `#/admin/products/edit/${encodeURIComponent(target.productId)}`;
      }
      return target.module === 'overview' ? '#/admin' : `#/admin/${target.module}`;
  }
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      const savedProducts = parsed.products?.length ? parsed.products : INITIAL_PRODUCTS;
      const existingIds = new Set(savedProducts.map((p) => p.id));
      const newSeedProducts = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
      const seedReviewMap = new Map(INITIAL_REVIEWS.map((r) => [r.id, r]));
      const savedReviews = (parsed.reviews?.length ? parsed.reviews : INITIAL_REVIEWS).map((r) => {
        const seed = seedReviewMap.get(r.id);
        return seed && !r.authorAvatar && seed.authorAvatar
          ? { ...r, authorAvatar: seed.authorAvatar }
          : r;
      });
      const existingReviewIds = new Set(savedReviews.map((r) => r.id));
      const newSeedReviews = INITIAL_REVIEWS.filter((r) => !existingReviewIds.has(r.id));

      const savedOrders = parsed.orders ?? INITIAL_ORDERS;
      const existingOrderIds = new Set(savedOrders.map((o) => o.id));
      const newSeedOrders =
        parsed.siteVisits === undefined
          ? INITIAL_ORDERS.filter((o) => !existingOrderIds.has(o.id))
          : [];

      return {
        products: [...savedProducts, ...newSeedProducts].map((p) => ({
          ...p,
          images: (Array.isArray(p.images) ? p.images : [])
            .map((img) => sanitizeImageUrl(img))
            .filter(Boolean),
          price: clampNumber(p.price, 1, 1_000_000, 100),
          stock: clampInteger(p.stock, 0, 100_000, 0),
        })),
        heroSlides: (parsed.heroSlides?.length ? parsed.heroSlides : INITIAL_HERO_SLIDES).map(
          (slide) => ({
            ...slide,
            image:
              sanitizeImageUrl(slide.image) ||
              '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
          })
        ),
        heroIntervalSec: clampInteger(parsed.heroIntervalSec, 3, 20, 6),
        orders: [...savedOrders, ...newSeedOrders],
        customers: Array.isArray(parsed.customers) ? parsed.customers : INITIAL_CUSTOMERS,
        reviews: [...savedReviews, ...newSeedReviews],
        themeSettings: sanitizeTheme(parsed.themeSettings),
        typographySettings: sanitizeTypography(parsed.typographySettings),
        content: { ...INITIAL_CONTENT, ...(parsed.content || {}) },
        cart: Array.isArray(parsed.cart)
          ? parsed.cart
              .filter((c) => c && typeof c.productId === 'string')
              .map((c) => ({
                productId: c.productId,
                finish: sanitizeText(c.finish, 80) || 'Standard Finish',
                quantity: clampInteger(c.quantity, 1, 20, 1),
              }))
          : [],
        userProfile:
          parsed.userProfile !== undefined ? parsed.userProfile : DEFAULT_USER_PROFILE,
        recentlyViewedIds: Array.isArray(parsed.recentlyViewedIds)
          ? parsed.recentlyViewedIds.filter((id) => typeof id === 'string').slice(0, 12)
          : [],
        wishlistIds: Array.isArray(parsed.wishlistIds)
          ? parsed.wishlistIds.filter((id) => typeof id === 'string').slice(0, 100)
          : [],
        currencySettings: {
          currency: parsed.currencySettings?.currency === 'BDT' ? 'BDT' : 'USD',
          bdtExchangeRate: clampNumber(
            parsed.currencySettings?.bdtExchangeRate,
            1,
            10000,
            INITIAL_CURRENCY_SETTINGS.bdtExchangeRate
          ),
        },
        bestSellersTiles: sanitizeTilesList(
          Array.isArray(parsed.bestSellersTiles) && parsed.bestSellersTiles.length === 5
            ? parsed.bestSellersTiles
            : INITIAL_BEST_SELLERS_TILES
        ),
        shopLookTiles: sanitizeTilesList(
          Array.isArray(parsed.shopLookTiles) && parsed.shopLookTiles.length === 5
            ? parsed.shopLookTiles
            : INITIAL_SHOP_LOOK_TILES
        ),
        collectionTiles: sanitizeTilesList(
          Array.isArray(parsed.collectionTiles) && parsed.collectionTiles.length === 3
            ? parsed.collectionTiles
            : INITIAL_COLLECTION_TILES
        ),
        siteVisits: clampInteger(parsed.siteVisits, 0, 100_000_000, INITIAL_SITE_VISITS),
        productViewCounts: {
          ...INITIAL_PRODUCT_VIEW_COUNTS,
          ...(parsed.productViewCounts || {}),
        },
      };
    }
  } catch {
    // Fallback to initial seed state if storage is unavailable
  }
  return {
    products: INITIAL_PRODUCTS,
    heroSlides: INITIAL_HERO_SLIDES,
    heroIntervalSec: 6,
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    reviews: INITIAL_REVIEWS,
    themeSettings: INITIAL_THEME_SETTINGS,
    typographySettings: INITIAL_TYPOGRAPHY_SETTINGS,
    content: INITIAL_CONTENT,
    cart: [],
    userProfile: DEFAULT_USER_PROFILE,
    recentlyViewedIds: [],
    wishlistIds: [],
    currencySettings: INITIAL_CURRENCY_SETTINGS,
    bestSellersTiles: INITIAL_BEST_SELLERS_TILES,
    shopLookTiles: INITIAL_SHOP_LOOK_TILES,
    collectionTiles: INITIAL_COLLECTION_TILES,
    siteVisits: INITIAL_SITE_VISITS,
    productViewCounts: INITIAL_PRODUCT_VIEW_COUNTS,
  };
}

interface PlaceOrderPayload {
  customerName: string;
  customerEmail: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  deliveryTier: 'White-Glove Assembly' | 'Threshold Delivery';
  paymentMethod: 'Credit Card' | 'Cash on Delivery';
}

interface StoreContextValue {
  route: RouteTarget;
  navigate: (target: RouteTarget) => void;
  categories: CategoryThumbnail[];
  products: Product[];
  heroSlides: HeroSlide[];
  heroIntervalSec: number;
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  themeSettings: ThemeSettings;
  typographySettings: TypographySettings;
  content: StoreContent;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  userProfile: UserProfile | null;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  signInUserProfile: (payload: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
  }) => void;
  signOutUserProfile: () => void;
  cartItemCount: number;
  cartSubtotal: number;
  addToCart: (productId: string, finish?: string, quantity?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (productId: string, finish: string, quantity: number) => void;
  removeFromCart: (productId: string, finish: string) => void;
  clearCart: () => void;
  placeOrder: (payload: PlaceOrderPayload) => Order;
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, refundReason?: string) => void;
  updateCustomerOrderStatus: (
    orderId: string,
    action: 'pause' | 'resume' | 'cancel'
  ) => { ok: boolean; error?: string };
  submitReview: (payload: {
    productId: string;
    authorName: string;
    authorRole: string;
    rating: number;
    comment: string;
  }) => void;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;
  updateContent: (patch: Partial<StoreContent>) => void;
  updateThemeSettings: (patch: Partial<ThemeSettings>) => void;
  updateTypographySettings: (patch: Partial<TypographySettings>) => void;
  updateHeroSlides: (slides: HeroSlide[], intervalSec?: number) => void;
  resetDesignSettings: () => void;
  recentlyViewedIds: string[];
  recordProductView: (productId: string) => void;
  removeRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  currencySettings: CurrencySettings;
  updateCurrencySettings: (patch: Partial<CurrencySettings>) => void;
  convertAmount: (usdAmount: number) => number;
  formatPrice: (usdAmount: number) => string;
  bestSellersTiles: MosaicTile[];
  shopLookTiles: MosaicTile[];
  collectionTiles: MosaicTile[];
  siteVisits: number;
  productViewCounts: Record<string, number>;
  updateBestSellersTiles: (tiles: MosaicTile[]) => void;
  updateShopLookTiles: (tiles: MosaicTile[]) => void;
  updateCollectionTiles: (tiles: MosaicTile[]) => void;
  resetMosaicTiles: (section: 'bestSellers' | 'shopLook' | 'collections') => void;
  lastSyncedAt: string;
  refreshFromServer: () => Promise<boolean>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());
  const [route, setRoute] = useState<RouteTarget>(() => parseHashRoute());
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => new Date().toISOString());

  const lastViewRef = useRef<{ id: string; at: number } | null>(null);
  const clientIdRef = useRef<string>(generateRandomHex(8));
  const latestStateRef = useRef<PersistedState>(state);
  latestStateRef.current = state;

  const isRemoteUpdateRef = useRef<boolean>(false);
  const skipNextFullSyncRef = useRef<boolean>(false);
  const serverHydratedRef = useRef<boolean>(false);
  const pendingVisitRef = useRef<boolean>(false);
  const backendAvailableRef = useRef<boolean>(true);
  const lastSharedJsonRef = useRef<string>(JSON.stringify(extractSharedState(state)));

  const isJsonResponse = (res: Response): boolean =>
    res.ok && (res.headers.get('content-type') || '').toLowerCase().includes('application/json');

  const dispatchVisitEvent = useCallback(() => {
    if (!backendAvailableRef.current) return;
    void fetch('/api/events/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: clientIdRef.current }),
    })
      .then((res) => (isJsonResponse(res) ? res.json() : null))
      .then((json) => {
        if (json?.ok && typeof json.siteVisits === 'number') {
          isRemoteUpdateRef.current = true;
          setState((prev) => ({
            ...prev,
            siteVisits: clampInteger(json.siteVisits, 0, 100_000_000, prev.siteVisits),
          }));
          if (typeof json.updatedAt === 'string') {
            setLastSyncedAt(json.updatedAt);
          }
        }
      })
      .catch(() => {
        // Offline or static host; local optimistic count remains intact
      });
  }, []);

  const applyRemoteSnapshot = useCallback(
    (data: Partial<SharedStateSlice>, timestamp?: string) => {
      isRemoteUpdateRef.current = true;
      setState((prev) => mergeServerData(prev, data));
      setLastSyncedAt(timestamp || new Date().toISOString());
    },
    []
  );

  const seedServerIfNeeded = useCallback(async () => {
    if (!backendAvailableRef.current) {
      serverHydratedRef.current = true;
      return;
    }
    try {
      const shared = extractSharedState(latestStateRef.current);
      const res = await fetch('/api/state/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientIdRef.current,
          seedOnly: true,
          data: shared,
        }),
      });
      if (isJsonResponse(res)) {
        const json = await res.json();
        if (json?.data) {
          applyRemoteSnapshot(json.data as Partial<SharedStateSlice>, json.updatedAt);
        } else {
          lastSharedJsonRef.current = JSON.stringify(shared);
          setLastSyncedAt(json?.updatedAt || new Date().toISOString());
        }
      } else {
        backendAvailableRef.current = false;
      }
    } catch {
      // Ignore transient seed failures
    } finally {
      serverHydratedRef.current = true;
      if (pendingVisitRef.current) {
        pendingVisitRef.current = false;
        dispatchVisitEvent();
      }
    }
  }, [applyRemoteSnapshot, dispatchVisitEvent]);

  const refreshFromServer = useCallback(async (): Promise<boolean> => {
    if (!backendAvailableRef.current) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          applyRemoteSnapshot(parsed, new Date().toISOString());
        } else {
          setLastSyncedAt(new Date().toISOString());
        }
        return true;
      } catch {
        setLastSyncedAt(new Date().toISOString());
        return false;
      }
    }

    try {
      const res = await fetch('/api/dashboard/metrics', { cache: 'no-store' });
      if (!isJsonResponse(res)) {
        backendAvailableRef.current = false;
        setLastSyncedAt(new Date().toISOString());
        return false;
      }
      const json = (await res.json()) as {
        initialized?: boolean;
        updatedAt?: string;
        serverTime?: string;
        data?: Partial<SharedStateSlice> | null;
      };
      const stamp = json.serverTime || json.updatedAt || new Date().toISOString();
      if (json.initialized && json.data) {
        applyRemoteSnapshot(json.data, stamp);
      } else {
        setLastSyncedAt(stamp);
      }
      return true;
    } catch {
      return false;
    }
  }, [applyRemoteSnapshot]);

  // Real-time WebSocket synchronization with auto-reconnect + HTTP fallback
  // Automatically steps down cleanly on static hosts (e.g., GitHub Pages)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.protocol === 'file:' || window.location.hostname.endsWith('.github.io'))
    ) {
      backendAvailableRef.current = false;
      serverHydratedRef.current = true;
      return;
    }

    let active = true;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let reconnectDelay = 1000;
    let wsEverOpened = false;
    let initialFailures = 0;

    const connect = () => {
      if (!active || !backendAvailableRef.current) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        ws = new WebSocket(wsUrl);
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        wsEverOpened = true;
        initialFailures = 0;
        reconnectDelay = 1000;
        try {
          ws?.send(JSON.stringify({ type: 'hello', clientId: clientIdRef.current }));
        } catch {
          // Ignore send error during handshake
        }
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const msg = JSON.parse(String(event.data)) as {
            type?: string;
            initialized?: boolean;
            updatedAt?: string;
            data?: Partial<SharedStateSlice> | null;
            siteVisits?: number;
            productViewCounts?: Record<string, number>;
          };

          if (msg.type === 'state:init') {
            if (msg.initialized && msg.data) {
              applyRemoteSnapshot(msg.data, msg.updatedAt);
              serverHydratedRef.current = true;
              if (pendingVisitRef.current) {
                pendingVisitRef.current = false;
                dispatchVisitEvent();
              }
            } else {
              void seedServerIfNeeded();
            }
          } else if (msg.type === 'state:updated' && msg.data) {
            applyRemoteSnapshot(msg.data, msg.updatedAt);
          } else if (msg.type === 'analytics:updated') {
            isRemoteUpdateRef.current = true;
            setState((prev) => ({
              ...prev,
              siteVisits:
                typeof msg.siteVisits === 'number'
                  ? clampInteger(msg.siteVisits, 0, 100_000_000, prev.siteVisits)
                  : prev.siteVisits,
              productViewCounts:
                msg.productViewCounts && typeof msg.productViewCounts === 'object'
                  ? { ...prev.productViewCounts, ...msg.productViewCounts }
                  : prev.productViewCounts,
            }));
            setLastSyncedAt(msg.updatedAt || new Date().toISOString());
          }
        } catch {
          // Ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (!active) return;
        if (!wsEverOpened) {
          initialFailures += 1;
          if (initialFailures >= 2) {
            backendAvailableRef.current = false;
            serverHydratedRef.current = true;
            return;
          }
        }
        scheduleReconnect();
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          // Ignore close error
        }
      };
    };

    const scheduleReconnect = () => {
      if (!active || !backendAvailableRef.current || reconnectTimer !== null) return;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        reconnectDelay = Math.min(reconnectDelay * 1.8, 15000);
        connect();
      }, reconnectDelay);
    };

    connect();

    // HTTP hydration fallback if WebSocket handshake is delayed
    const fallbackTimer = window.setTimeout(() => {
      if (!active || serverHydratedRef.current || !backendAvailableRef.current) return;
      void fetch('/api/state', { cache: 'no-store' })
        .then((res) => (isJsonResponse(res) ? res.json() : null))
        .then((json) => {
          if (!active || serverHydratedRef.current) return;
          if (!json) {
            backendAvailableRef.current = false;
            serverHydratedRef.current = true;
            return;
          }
          if (json.initialized && json.data) {
            applyRemoteSnapshot(json.data as Partial<SharedStateSlice>, json.updatedAt);
            serverHydratedRef.current = true;
            if (pendingVisitRef.current) {
              pendingVisitRef.current = false;
              dispatchVisitEvent();
            }
          } else {
            void seedServerIfNeeded();
          }
        })
        .catch(() => {
          // Remain usable offline with localStorage
          backendAvailableRef.current = false;
          serverHydratedRef.current = true;
        });
    }, 1200);

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {
        // Ignore cleanup close error
      }
    };
  }, [applyRemoteSnapshot, dispatchVisitEvent, seedServerIfNeeded]);

  // Cross-tab localStorage synchronization fallback
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as Partial<PersistedState>;
        applyRemoteSnapshot(parsed, new Date().toISOString());
      } catch {
        // Ignore malformed storage payload
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [applyRemoteSnapshot]);

  // Count unique storefront session visit and publish atomically to server
  useEffect(() => {
    if (route.page === 'admin') return;
    try {
      if (!sessionStorage.getItem('vespera_visit_counted')) {
        sessionStorage.setItem('vespera_visit_counted', '1');
        skipNextFullSyncRef.current = true;
        setState((prev) => ({ ...prev, siteVisits: prev.siteVisits + 1 }));
        if (serverHydratedRef.current) {
          dispatchVisitEvent();
        } else {
          pendingVisitRef.current = true;
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [route.page, dispatchVisitEvent]);

  // Sync hash changes (browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashRoute());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Persist store state locally and push shared changes to server
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }

    const shared = extractSharedState(state);
    const sharedJson = JSON.stringify(shared);

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      lastSharedJsonRef.current = sharedJson;
      return;
    }

    if (skipNextFullSyncRef.current) {
      skipNextFullSyncRef.current = false;
      lastSharedJsonRef.current = sharedJson;
      return;
    }

    if (
      !backendAvailableRef.current ||
      !serverHydratedRef.current ||
      sharedJson === lastSharedJsonRef.current
    ) {
      return;
    }

    const syncTimer = window.setTimeout(() => {
      lastSharedJsonRef.current = sharedJson;
      void fetch('/api/state/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientIdRef.current,
          data: shared,
        }),
      })
        .then((res) => (isJsonResponse(res) ? res.json() : null))
        .then((json) => {
          if (json?.ok && typeof json.updatedAt === 'string') {
            setLastSyncedAt(json.updatedAt);
          }
        })
        .catch(() => {
          // Offline or transient network error
        });
    }, 150);

    return () => window.clearTimeout(syncTimer);
  }, [state]);

  // Apply dynamic CSS theme variables & typography to :root
  useEffect(() => {
    const root = document.documentElement;
    const t = state.themeSettings;
    const typo = state.typographySettings;

    root.style.setProperty('--color-bg-canvas', t.bgCanvas);
    root.style.setProperty('--color-bg-surface', t.bgSurface);
    root.style.setProperty('--color-bg-surface-alt', t.bgSurfaceAlt);
    root.style.setProperty('--color-text-primary', t.textPrimary);
    root.style.setProperty('--color-text-muted', t.textMuted);
    root.style.setProperty('--color-accent', t.accent);
    root.style.setProperty('--color-accent-hover', darkenHex(t.accent, 0.16));
    root.style.setProperty('--color-accent-contrast', getContrastText(t.accent));
    root.style.setProperty('--color-brass', t.brass);
    root.style.setProperty('--font-display', typo.displayFont);
    root.style.setProperty('--font-body', typo.bodyFont);
  }, [state.themeSettings, state.typographySettings]);

  const navigate = (target: RouteTarget) => {
    const nextHash = routeToHash(target);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      setRoute(target);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (
    productId: string,
    finish?: string,
    quantity = 1,
    openDrawer = true
  ) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return;
    const resolvedFinish = sanitizeText(finish || product.finishes[0] || 'Standard Finish', 80);
    const maxAllowed = Math.min(20, product.stock);
    const addQty = clampInteger(quantity, 1, maxAllowed, 1);

    setState((prev) => {
      const existingIndex = prev.cart.findIndex(
        (item) => item.productId === productId && item.finish === resolvedFinish
      );
      const nextCart = [...prev.cart];
      if (existingIndex >= 0) {
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: Math.min(maxAllowed, nextCart[existingIndex].quantity + addQty),
        };
      } else {
        nextCart.push({ productId, finish: resolvedFinish, quantity: addQty });
      }
      return { ...prev, cart: nextCart };
    });

    if (openDrawer) setCartOpen(true);
  };

  const updateCartQuantity = (productId: string, finish: string, quantity: number) => {
    const product = state.products.find((p) => p.id === productId);
    const maxAllowed = product ? Math.min(20, Math.max(0, product.stock)) : 20;
    const safeQty = clampInteger(quantity, 0, maxAllowed, 0);

    setState((prev) => {
      if (safeQty <= 0) {
        return {
          ...prev,
          cart: prev.cart.filter(
            (item) => !(item.productId === productId && item.finish === finish)
          ),
        };
      }
      return {
        ...prev,
        cart: prev.cart.map((item) =>
          item.productId === productId && item.finish === finish
            ? { ...item, quantity: safeQty }
            : item
        ),
      };
    });
  };

  const removeFromCart = (productId: string, finish: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter(
        (item) => !(item.productId === productId && item.finish === finish)
      ),
    }));
  };

  const clearCart = () => setState((prev) => ({ ...prev, cart: [] }));

  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = state.cart.reduce((sum, item) => {
    const product = state.products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const placeOrder = (payload: PlaceOrderPayload): Order => {
    const cleanName = sanitizeText(payload.customerName, 120);
    const cleanEmail = sanitizeEmail(payload.customerEmail);
    const cleanPhone = sanitizePhone(payload.phone);
    const cleanStreet = sanitizeText(payload.street, 180);
    const cleanCity = sanitizeText(payload.city, 100);
    const cleanPostal = sanitizeText(payload.postalCode, 24);

    const items = state.cart
      .map((ci) => {
        const product = state.products.find((p) => p.id === ci.productId);
        if (!product || product.stock <= 0) return null;
        const safeQty = clampInteger(ci.quantity, 1, Math.min(20, product.stock), 1);
        return {
          productId: product.id,
          productName: product.name,
          finish: sanitizeText(ci.finish, 80) || 'Standard Finish',
          quantity: safeQty,
          unitPrice: product.price,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const shippingFee =
      payload.deliveryTier === 'White-Glove Assembly'
        ? subtotal >= 2500
          ? 0
          : 195
        : subtotal >= 1500
        ? 0
        : 95;

    const maxOrderSeq = state.orders.reduce((max, o) => {
      const n = Number(o.orderNumber.replace(/\D/g, ''));
      return Number.isFinite(n) && n > max ? n : max;
    }, 1051);
    const orderNum = `VSP-${maxOrderSeq + 1}`;

    const existingCustomer = state.customers.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );
    const customerId = existingCustomer ? existingCustomer.id : `cust-${Date.now()}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerId,
      customerName: cleanName,
      customerEmail: cleanEmail,
      shippingAddress: `${cleanStreet}, ${cleanCity} ${cleanPostal}`,
      deliveryTier: payload.deliveryTier,
      paymentMethod: payload.paymentMethod,
      items,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => {
      const updatedCustomers = existingCustomer
        ? prev.customers
        : [
            {
              id: customerId,
              name: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
              city: cleanCity,
              joinedAt: new Date().toISOString().slice(0, 10),
            },
            ...prev.customers,
          ];

      const updatedProducts = prev.products.map((p) => {
        const orderedQty = items
          .filter((it) => it.productId === p.id)
          .reduce((s, it) => s + it.quantity, 0);
        return orderedQty > 0 ? { ...p, stock: Math.max(0, p.stock - orderedQty) } : p;
      });

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        customers: updatedCustomers,
        products: updatedProducts,
        cart: [],
      };
    });

    return newOrder;
  };

  const addProduct = (product: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount'>) => {
    if (!isAdminSessionValid()) return;
    const cleanName = sanitizeText(product.name, 140);
    if (!cleanName) return;
    const safeImages = product.images.map((img) => sanitizeImageUrl(img)).filter(Boolean);
    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      ...product,
      name: cleanName,
      sku: sanitizeText(product.sku, 48),
      dimensions: sanitizeText(product.dimensions, 120),
      leadTime: sanitizeText(product.leadTime, 120),
      description: sanitizeMultilineText(product.description, 2000),
      craftsmanshipNote: sanitizeMultilineText(product.craftsmanshipNote, 1000),
      price: clampNumber(product.price, 1, 1_000_000, 100),
      stock: clampInteger(product.stock, 0, 100_000, 0),
      images:
        safeImages.length > 0
          ? safeImages
          : ['/src/assets/images/whitebg_boucle_chair_iso_1794928869933.jpg'],
      finishes: product.finishes.map((f) => sanitizeText(f, 80)).filter(Boolean),
      id: `prod-${Date.now()}`,
      slug: `${slugBase || 'piece'}-${Date.now().toString().slice(-4)}`,
      rating: 5.0,
      reviewCount: 0,
    };
    setState((prev) => ({ ...prev, products: [newProduct, ...prev.products] }));
  };

  const updateProduct = (id: string, patch: Partial<Product>) => {
    if (!isAdminSessionValid()) return;
    const sanitizedPatch: Partial<Product> = { ...patch };
    if (patch.name !== undefined) sanitizedPatch.name = sanitizeText(patch.name, 140);
    if (patch.sku !== undefined) sanitizedPatch.sku = sanitizeText(patch.sku, 48);
    if (patch.dimensions !== undefined) sanitizedPatch.dimensions = sanitizeText(patch.dimensions, 120);
    if (patch.leadTime !== undefined) sanitizedPatch.leadTime = sanitizeText(patch.leadTime, 120);
    if (patch.description !== undefined)
      sanitizedPatch.description = sanitizeMultilineText(patch.description, 2000);
    if (patch.craftsmanshipNote !== undefined)
      sanitizedPatch.craftsmanshipNote = sanitizeMultilineText(patch.craftsmanshipNote, 1000);
    if (patch.price !== undefined)
      sanitizedPatch.price = clampNumber(patch.price, 1, 1_000_000, 100);
    if (patch.stock !== undefined)
      sanitizedPatch.stock = clampInteger(patch.stock, 0, 100_000, 0);
    if (patch.images !== undefined) {
      const safeImages = patch.images.map((img) => sanitizeImageUrl(img)).filter(Boolean);
      sanitizedPatch.images = safeImages;
    }
    if (patch.finishes !== undefined) {
      sanitizedPatch.finishes = patch.finishes.map((f) => sanitizeText(f, 80)).filter(Boolean);
    }

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...sanitizedPatch } : p)),
    }));
  };

  const deleteProduct = (id: string) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
      cart: prev.cart.filter((c) => c.productId !== id),
      recentlyViewedIds: prev.recentlyViewedIds.filter((pid) => pid !== id),
      wishlistIds: prev.wishlistIds.filter((pid) => pid !== id),
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, refundReason?: string) => {
    if (!isAdminSessionValid()) return;
    const cleanReason =
      refundReason !== undefined ? sanitizeMultilineText(refundReason, 400) : undefined;
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? { ...o, status, refundReason: cleanReason ?? o.refundReason }
          : o
      ),
    }));
  };

  const updateCustomerOrderStatus = (
    orderId: string,
    action: 'pause' | 'resume' | 'cancel'
  ): { ok: boolean; error?: string } => {
    const profile = state.userProfile;
    if (!profile) {
      return { ok: false, error: 'You must be signed in to manage orders.' };
    }
    const target = state.orders.find((o) => o.id === orderId);
    if (!target) {
      return { ok: false, error: 'Order record not found.' };
    }
    const isOwner =
      target.customerId === profile.id ||
      target.customerEmail.toLowerCase() === profile.email.toLowerCase();
    if (!isOwner) {
      return { ok: false, error: 'Unauthorized order modification attempt.' };
    }

    let nextStatus: OrderStatus | null = null;
    let reason: string | undefined;

    if (action === 'pause' && (target.status === 'Pending' || target.status === 'Processing')) {
      nextStatus = 'Paused';
      reason = 'Client paused fulfillment from account portal.';
    } else if (action === 'resume' && target.status === 'Paused') {
      nextStatus = 'Pending';
      reason = undefined;
    } else if (
      action === 'cancel' &&
      (target.status === 'Pending' ||
        target.status === 'Processing' ||
        target.status === 'Paused')
    ) {
      nextStatus = 'Cancelled';
      reason = 'Client cancelled order from account portal.';
    }

    if (!nextStatus) {
      return { ok: false, error: `Cannot ${action} an order with status "${target.status}".` };
    }

    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus!, refundReason: reason } : o
      ),
    }));
    return { ok: true };
  };

  const submitReview = (payload: {
    productId: string;
    authorName: string;
    authorRole: string;
    rating: number;
    comment: string;
  }) => {
    const rl = getRateLimitStatus('submit_review', 5, 10 * 60 * 1000);
    if (!rl.allowed) return;
    recordFailedAttempt('submit_review', 5, 10 * 60 * 1000, 60 * 1000);

    const product = state.products.find((p) => p.id === payload.productId);
    if (!product) return;
    const cleanAuthor = sanitizeText(payload.authorName, 80);
    const cleanComment = sanitizeMultilineText(payload.comment, 1200);
    if (!cleanAuthor || !cleanComment) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: payload.productId,
      productName: product.name,
      authorName: cleanAuthor,
      authorRole: sanitizeText(payload.authorRole, 80) || 'Verified Buyer',
      rating: clampInteger(payload.rating, 1, 5, 5),
      comment: cleanComment,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({ ...prev, reviews: [newReview, ...prev.reviews] }));
  };

  const updateReviewStatus = (reviewId: string, status: ReviewStatus) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === reviewId ? { ...r, status } : r)),
    }));
  };

  const deleteReview = (reviewId: string) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== reviewId),
    }));
  };

  const updateContent = (patch: Partial<StoreContent>) => {
    if (!isAdminSessionValid()) return;
    const cleanPatch: Partial<StoreContent> = {};
    if (patch.announcementBar !== undefined)
      cleanPatch.announcementBar = sanitizeText(patch.announcementBar, 240);
    if (patch.showAnnouncementBar !== undefined)
      cleanPatch.showAnnouncementBar = Boolean(patch.showAnnouncementBar);
    if (patch.privacyPolicyTitle !== undefined)
      cleanPatch.privacyPolicyTitle = sanitizeText(patch.privacyPolicyTitle, 180);
    if (patch.privacyPolicyBody !== undefined)
      cleanPatch.privacyPolicyBody = sanitizeMultilineText(patch.privacyPolicyBody, 12000);

    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        ...cleanPatch,
        privacyPolicyUpdatedAt:
          cleanPatch.privacyPolicyBody !== undefined || cleanPatch.privacyPolicyTitle !== undefined
            ? new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : prev.content.privacyPolicyUpdatedAt,
      },
    }));
  };

  const updateThemeSettings = (patch: Partial<ThemeSettings>) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      themeSettings: sanitizeTheme({ ...prev.themeSettings, ...patch }),
    }));
  };

  const updateTypographySettings = (patch: Partial<TypographySettings>) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      typographySettings: sanitizeTypography({ ...prev.typographySettings, ...patch }),
    }));
  };

  const updateHeroSlides = (slides: HeroSlide[], intervalSec?: number) => {
    if (!isAdminSessionValid()) return;
    const cleanSlides = slides.map((s) => ({
      ...s,
      kicker: sanitizeText(s.kicker, 100),
      headline: sanitizeText(s.headline, 180),
      subheadline: sanitizeText(s.subheadline, 360),
      ctaLabel: sanitizeText(s.ctaLabel, 60),
      assetDesignation: sanitizeText(s.assetDesignation, 120),
      image:
        sanitizeImageUrl(s.image) ||
        '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
    }));
    setState((prev) => ({
      ...prev,
      heroSlides: cleanSlides,
      heroIntervalSec:
        intervalSec !== undefined
          ? clampInteger(intervalSec, 3, 20, prev.heroIntervalSec)
          : prev.heroIntervalSec,
    }));
  };

  const resetDesignSettings = () => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      themeSettings: INITIAL_THEME_SETTINGS,
      typographySettings: INITIAL_TYPOGRAPHY_SETTINGS,
    }));
  };

  const updateUserProfile = (patch: Partial<UserProfile>) => {
    setState((prev) => {
      if (!prev.userProfile) return prev;
      const cleanName = patch.name !== undefined ? sanitizeText(patch.name, 120) : prev.userProfile.name;
      const cleanEmail =
        patch.email !== undefined && isValidEmail(patch.email)
          ? sanitizeEmail(patch.email)
          : prev.userProfile.email;
      const cleanPhone =
        patch.phone !== undefined ? sanitizePhone(patch.phone) : prev.userProfile.phone;
      const cleanCity = patch.city !== undefined ? sanitizeText(patch.city, 100) : prev.userProfile.city;

      const updated: UserProfile = {
        ...prev.userProfile,
        name: cleanName || prev.userProfile.name,
        email: cleanEmail,
        phone: cleanPhone,
        city: cleanCity,
        membershipTier: patch.membershipTier ?? prev.userProfile.membershipTier,
      };
      return {
        ...prev,
        userProfile: updated,
        customers: prev.customers.map((c) =>
          c.id === updated.id || c.email.toLowerCase() === updated.email.toLowerCase()
            ? {
                ...c,
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                city: updated.city,
              }
            : c
        ),
      };
    });
  };

  const signInUserProfile = (payload: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
  }) => {
    const cleanEmail = sanitizeEmail(payload.email);
    if (!isValidEmail(cleanEmail)) return;
    setState((prev) => {
      const existing = prev.customers.find((c) => c.email.toLowerCase() === cleanEmail);
      const id = existing ? existing.id : `cust-${Date.now()}`;
      const newProfile: UserProfile = {
        id,
        name: existing ? existing.name : sanitizeText(payload.name, 120) || cleanEmail.split('@')[0],
        email: existing ? existing.email : cleanEmail,
        phone: existing ? existing.phone : sanitizePhone(payload.phone || ''),
        city: existing ? existing.city : sanitizeText(payload.city || '', 100) || 'San Francisco',
        membershipTier: 'Atelier Member',
        loyaltyPoints: existing ? 840 : 500,
      };
      const updatedCustomers = existing
        ? prev.customers
        : [
            {
              id,
              name: newProfile.name,
              email: newProfile.email,
              phone: newProfile.phone || '—',
              city: newProfile.city,
              joinedAt: new Date().toISOString().slice(0, 10),
            },
            ...prev.customers,
          ];
      return {
        ...prev,
        userProfile: newProfile,
        customers: updatedCustomers,
      };
    });
  };

  const signOutUserProfile = () => {
    setState((prev) => ({ ...prev, userProfile: null }));
  };

  const recordProductView = useCallback((productId: string) => {
    if (!productId) return;
    const now = Date.now();
    if (
      lastViewRef.current &&
      lastViewRef.current.id === productId &&
      now - lastViewRef.current.at < 800
    ) {
      return;
    }
    lastViewRef.current = { id: productId, at: now };

    skipNextFullSyncRef.current = true;
    setState((prev) => {
      const nextViews = {
        ...prev.productViewCounts,
        [productId]: (prev.productViewCounts[productId] || 0) + 1,
      };
      const nextRecent =
        prev.recentlyViewedIds[0] === productId
          ? prev.recentlyViewedIds
          : [productId, ...prev.recentlyViewedIds.filter((id) => id !== productId)].slice(0, 12);
      return {
        ...prev,
        recentlyViewedIds: nextRecent,
        productViewCounts: nextViews,
      };
    });

    if (!backendAvailableRef.current) return;

    void fetch('/api/events/product-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, clientId: clientIdRef.current }),
    })
      .then((res) => (isJsonResponse(res) ? res.json() : null))
      .then((json) => {
        if (json?.ok && json.productViewCounts && typeof json.productViewCounts === 'object') {
          isRemoteUpdateRef.current = true;
          setState((prev) => ({
            ...prev,
            productViewCounts: { ...prev.productViewCounts, ...json.productViewCounts },
          }));
          if (typeof json.updatedAt === 'string') {
            setLastSyncedAt(json.updatedAt);
          }
        }
      })
      .catch(() => {
        // Offline or static host
      });
  }, []);

  const removeRecentlyViewed = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      recentlyViewedIds: prev.recentlyViewedIds.filter((id) => id !== productId),
    }));
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setState((prev) => ({ ...prev, recentlyViewedIds: [] }));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    if (!productId) return;
    setState((prev) => {
      const exists = prev.wishlistIds.includes(productId);
      const next = exists
        ? prev.wishlistIds.filter((id) => id !== productId)
        : [productId, ...prev.wishlistIds];
      return { ...prev, wishlistIds: next };
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setState((prev) => ({ ...prev, wishlistIds: [] }));
  }, []);

  const updateCurrencySettings = useCallback((patch: Partial<CurrencySettings>) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      currencySettings: {
        currency:
          patch.currency === 'BDT' || patch.currency === 'USD'
            ? patch.currency
            : prev.currencySettings.currency,
        bdtExchangeRate:
          patch.bdtExchangeRate !== undefined
            ? clampNumber(patch.bdtExchangeRate, 1, 10000, prev.currencySettings.bdtExchangeRate)
            : prev.currencySettings.bdtExchangeRate,
      },
    }));
  }, []);

  const convertAmount = useCallback(
    (usdAmount: number) => {
      if (state.currencySettings.currency === 'BDT') {
        return Math.round(usdAmount * state.currencySettings.bdtExchangeRate);
      }
      return Math.round(usdAmount);
    },
    [state.currencySettings.currency, state.currencySettings.bdtExchangeRate]
  );

  const formatPrice = useCallback(
    (usdAmount: number) => {
      const converted = convertAmount(usdAmount);
      const symbol = state.currencySettings.currency === 'BDT' ? '৳' : '$';
      return `${symbol}${converted.toLocaleString('en-US')}`;
    },
    [convertAmount, state.currencySettings.currency]
  );

  const updateBestSellersTiles = useCallback((tiles: MosaicTile[]) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({ ...prev, bestSellersTiles: sanitizeTilesList(tiles) }));
  }, []);

  const updateShopLookTiles = useCallback((tiles: MosaicTile[]) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({ ...prev, shopLookTiles: sanitizeTilesList(tiles) }));
  }, []);

  const updateCollectionTiles = useCallback((tiles: MosaicTile[]) => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({ ...prev, collectionTiles: sanitizeTilesList(tiles) }));
  }, []);

  const resetMosaicTiles = useCallback((section: 'bestSellers' | 'shopLook' | 'collections') => {
    if (!isAdminSessionValid()) return;
    setState((prev) => ({
      ...prev,
      ...(section === 'bestSellers'
        ? { bestSellersTiles: INITIAL_BEST_SELLERS_TILES }
        : section === 'shopLook'
          ? { shopLookTiles: INITIAL_SHOP_LOOK_TILES }
          : { collectionTiles: INITIAL_COLLECTION_TILES }),
    }));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        route,
        navigate,
        categories: INITIAL_CATEGORIES,
        products: state.products,
        heroSlides: state.heroSlides,
        heroIntervalSec: state.heroIntervalSec,
        orders: state.orders,
        customers: state.customers,
        reviews: state.reviews,
        themeSettings: state.themeSettings,
        typographySettings: state.typographySettings,
        content: state.content,
        cart: state.cart,
        cartOpen,
        setCartOpen,
        userProfile: state.userProfile,
        profileOpen,
        setProfileOpen,
        updateUserProfile,
        signInUserProfile,
        signOutUserProfile,
        cartItemCount,
        cartSubtotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updateCustomerOrderStatus,
        submitReview,
        updateReviewStatus,
        deleteReview,
        updateContent,
        updateThemeSettings,
        updateTypographySettings,
        updateHeroSlides,
        resetDesignSettings,
        recentlyViewedIds: state.recentlyViewedIds,
        recordProductView,
        removeRecentlyViewed,
        clearRecentlyViewed,
        wishlistIds: state.wishlistIds,
        toggleWishlist,
        clearWishlist,
        currencySettings: state.currencySettings,
        updateCurrencySettings,
        convertAmount,
        formatPrice,
        bestSellersTiles: state.bestSellersTiles,
        shopLookTiles: state.shopLookTiles,
        collectionTiles: state.collectionTiles,
        siteVisits: state.siteVisits,
        productViewCounts: state.productViewCounts,
        updateBestSellersTiles,
        updateShopLookTiles,
        updateCollectionTiles,
        resetMosaicTiles,
        lastSyncedAt,
        refreshFromServer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
