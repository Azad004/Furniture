export type FurnitureCategory =
  | 'Sofas'
  | 'Chairs'
  | 'Tables'
  | 'Storage'
  | 'Office'
  | 'Bedroom'
  | 'Lighting'
  | 'Study'
  | 'Textiles'
  | 'Decor'
  | 'Kitchen'
  | 'Kids'
  | 'Outdoor'
  | 'Smart Series'
  | 'Artists Club'
  | 'Pets';

export const ALL_CATEGORIES: FurnitureCategory[] = [
  'Sofas',
  'Chairs',
  'Tables',
  'Storage',
  'Office',
  'Bedroom',
  'Lighting',
  'Study',
  'Textiles',
  'Decor',
  'Kitchen',
  'Kids',
  'Outdoor',
  'Smart Series',
  'Artists Club',
  'Pets',
];

export type MaterialType =
  | 'Solid White Oak'
  | 'American Walnut'
  | 'Belgian Linen'
  | 'Ivory Bouclé'
  | 'Honed Travertine'
  | 'Brushed Brass';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: FurnitureCategory;
  material: MaterialType;
  price: number;
  stock: number;
  sku: string;
  dimensions: string;
  leadTime: string;
  description: string;
  craftsmanshipNote: string;
  images: string[];
  finishes: string[];
  bestSeller: boolean;
  newArrival: boolean;
  rating: number;
  reviewCount: number;
}

export interface CategoryThumbnail {
  id: string;
  name: FurnitureCategory;
  image: string;
  objectPosition?: string;
  imageScale?: number;
}

export interface HeroSlide {
  id: string;
  kicker: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaTarget: RouteTarget;
  image: string;
  assetDesignation: string;
  active: boolean;
}

export interface LookHotspot {
  id: string;
  productId: string;
  xPercent: number;
  yPercent: number;
  label: string;
}

export interface MosaicHotspot {
  id: string;
  productId: string;
  xPercent: number;
  yPercent: number;
  cardSide: 'left' | 'right';
  showBadge?: boolean;
  badgeText?: string;
  customTitle?: string;
  customSubtitle?: string;
  customPrice?: number;
}

export interface MosaicTile {
  id: string;
  label: string;
  image: string;
  alt: string;
  objectPositionClass?: string;
  hotspots: MosaicHotspot[];
}

export interface CartItem {
  productId: string;
  finish: string;
  quantity: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Paused'
  | 'Cancelled'
  | 'Refunded';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  finish: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  deliveryTier: 'White-Glove Assembly' | 'Threshold Delivery';
  paymentMethod: 'Credit Card' | 'Cash on Delivery';
  items: OrderItemSnapshot[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  refundReason?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedAt: string;
}

export type ReviewStatus = 'Approved' | 'Pending' | 'Hidden';

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ThemeSettings {
  bgCanvas: string;
  bgSurface: string;
  bgSurfaceAlt: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  brass: string;
}

export type DisplayFontOption =
  | '"Playfair Display", Georgia, serif'
  | '"Cormorant Garamond", Georgia, serif'
  | '"Fraunces", Georgia, serif'
  | '"Bodoni Moda", Georgia, serif';

export type BodyFontOption =
  | '"Plus Jakarta Sans", -apple-system, sans-serif'
  | '"DM Sans", -apple-system, sans-serif'
  | '"Manrope", -apple-system, sans-serif'
  | '"Public Sans", -apple-system, sans-serif';

export interface TypographySettings {
  displayFont: DisplayFontOption;
  bodyFont: BodyFontOption;
}

export interface StoreContent {
  privacyPolicyTitle: string;
  privacyPolicyUpdatedAt: string;
  privacyPolicyBody: string;
  announcementBar: string;
  showAnnouncementBar: boolean;
}

export type CurrencyCode = 'USD' | 'BDT';

export interface CurrencySettings {
  currency: CurrencyCode;
  bdtExchangeRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  membershipTier: 'Atelier Member' | 'Trade Partner';
  loyaltyPoints: number;
}

export type AccountTab = 'overview' | 'orders' | 'profile' | 'loyalty';

export type AdminModule =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'content'
  | 'hotspots'
  | 'reviews'
  | 'settings';

export type RouteTarget =
  | { page: 'home' }
  | { page: 'shop'; category?: FurnitureCategory | 'All'; query?: string }
  | { page: 'collections' }
  | { page: 'product'; slug: string }
  | { page: 'track'; orderNumber?: string }
  | { page: 'account'; tab?: AccountTab }
  | { page: 'checkout' }
  | { page: 'about' }
  | { page: 'showrooms' }
  | { page: 'service' }
  | { page: 'help' }
  | { page: 'recently-viewed' }
  | { page: 'wishlist' }
  | { page: 'events' }
  | { page: 'style-report' }
  | { page: 'innovation' }
  | { page: 'contact' }
  | { page: 'privacy' }
  | { page: 'admin'; module: AdminModule; productMode?: 'new' | 'edit'; productId?: string };
