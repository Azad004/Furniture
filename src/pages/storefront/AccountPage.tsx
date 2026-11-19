import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Ban,
  Check,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  PauseCircle,
  Play,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AccountTab } from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';
import {
  isValidEmail,
  isValidPhone,
  registerOrVerifyCustomer,
} from '../../utils/security';

interface AccountPageProps {
  initialTab?: AccountTab;
}

const ACCOUNT_TABS: Array<{
  id: AccountTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Account Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders & Tracking', icon: Package },
  { id: 'profile', label: 'Profile & Address', icon: User },
  { id: 'loyalty', label: 'Loyalty Privileges', icon: Award },
];

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'overview' }) => {
  const {
    userProfile,
    updateUserProfile,
    signInUserProfile,
    signOutUserProfile,
    orders,
    updateCustomerOrderStatus,
    products,
    cartItemCount,
    setCartOpen,
    navigate,
    formatPrice,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  // Profile form state
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [membershipTier, setMembershipTier] = useState<'Atelier Member' | 'Trade Partner'>(
    userProfile?.membershipTier || 'Atelier Member'
  );
  const [savedToast, setSavedToast] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Sign-in / Registration form state
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCity, setLoginCity] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setPhone(userProfile.phone);
      setCity(userProfile.city);
      setMembershipTier(userProfile.membershipTier);
    }
  }, [userProfile]);

  const userOrders = userProfile
    ? orders.filter(
        (o) =>
          o.customerId === userProfile.id ||
          o.customerEmail.toLowerCase() === userProfile.email.toLowerCase()
      )
    : [];

  const lifetimeSpend = userOrders
    .filter((o) => o.status !== 'Refunded' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const initials = userProfile
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'VA';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    if (!name.trim()) {
      setProfileError('Please provide your full name.');
      return;
    }
    if (!isValidEmail(email)) {
      setProfileError('Please enter a valid email address.');
      return;
    }
    if (phone.trim() && !isValidPhone(phone)) {
      setProfileError('Please enter a valid phone number (7–15 digits).');
      return;
    }
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      membershipTier,
    });
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 1800);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword || authSubmitting) return;
    setAuthError(null);
    setAuthSubmitting(true);

    const res = await registerOrVerifyCustomer(loginEmail, loginPassword, authMode);
    setAuthSubmitting(false);

    if (!res.ok) {
      setAuthError(res.error || 'Authentication failed.');
      return;
    }

    signInUserProfile({
      name: loginName.trim() || loginEmail.split('@')[0],
      email: loginEmail.trim(),
      city: loginCity.trim() || 'San Francisco',
    });
    setLoginName('');
    setLoginEmail('');
    setLoginPassword('');
    setLoginCity('');
    navigate({ page: 'account', tab: 'overview' });
  };

  // SIGNED-OUT PAGE VIEW
  if (!userProfile) {
    return (
      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <header className="pb-8 border-b space-y-2 mb-10" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Vespera Studio Membership
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium">
            Sign In or Create Account
          </h1>
          <p className="text-sm max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>
            Access saved studio specifications, white-glove delivery schedules, loyalty points, and order tracking.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Password-Protected Sign In / Registration Form */}
          <section
            className="lg:col-span-7 rounded-xl border p-6 sm:p-8 space-y-6"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-medium">
                  {authMode === 'signin' ? 'Member Sign In' : 'Create Member Account'}
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {authMode === 'signin'
                    ? 'Sign in with your verified email and password.'
                    : 'Register with a strong password (8+ characters, letters & numbers) to receive 500 welcome points.'}
                </p>
              </div>

              <div
                role="group"
                aria-label="Account mode"
                className="inline-flex items-center p-1 rounded-lg border"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                {(['signin', 'register'] as const).map((m) => {
                  const active = authMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setAuthMode(m);
                        setAuthError(null);
                      }}
                      className="px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                      style={{
                        backgroundColor: active ? 'var(--color-accent)' : 'transparent',
                        color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
                      }}
                    >
                      {m === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {authMode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="Claire Beaumont"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">City</label>
                    <input
                      type="text"
                      maxLength={100}
                      value={loginCity}
                      onChange={(e) => setLoginCity(e.target.value)}
                      placeholder="San Francisco"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@studio.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={authMode === 'signin' ? 'Enter your password' : 'Min 8 characters with letters & numbers'}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              {authError && (
                <p
                  role="alert"
                  className="rounded-lg border px-3.5 py-2.5 text-xs font-medium text-rose-800 bg-rose-50 border-rose-200"
                >
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="vespera-btn-primary px-6 py-3 text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {authSubmitting
                  ? 'Verifying...'
                  : authMode === 'signin'
                    ? 'Sign In to My Account'
                    : 'Create Verified Account'}
              </button>
            </form>
          </section>

          {/* Right 5 Cols: Membership Perks & Order Tracking */}
          <aside className="lg:col-span-5 space-y-5">
            <div
              className="rounded-xl border p-6 space-y-4"
              style={{
                backgroundColor: 'var(--color-bg-surface-alt)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="font-display text-lg font-medium">Membership Privileges</h3>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <li className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                  <span>Earn 10 Vespera Loyalty Points per {formatPrice(100)} spent toward white-glove credits.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                  <span>Live milestone tracking from kiln-dried joinery inspection to placement.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                  <span>Expedited checkout with saved billing and showroom delivery preferences.</span>
                </li>
              </ul>
            </div>

            <div
              className="rounded-xl border p-6 space-y-3"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="font-display text-lg font-medium">Looking for a shipment?</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Track any order immediately using your order reference number without signing in.
              </p>
              <button
                type="button"
                onClick={() => navigate({ page: 'track' })}
                className="inline-flex items-center gap-2 text-xs font-semibold underline underline-offset-4 cursor-pointer"
              >
                <span>Open Order Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  // SIGNED-IN FULL PAGE VIEW
  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 space-y-10">
      {/* Top Member Identity Banner */}
      <header
        className="rounded-xl border p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-base sm:text-lg font-semibold shrink-0"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
            }}
          >
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-medium">
                {userProfile.name}
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-md border text-xs font-medium"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  color: 'var(--color-brass)',
                }}
              >
                {userProfile.membershipTier}
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {userProfile.email} · {userProfile.city || 'San Francisco'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ page: 'track' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold hover:bg-black/5 transition-colors cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Truck className="w-4 h-4" />
            <span>Track an Order</span>
          </button>

          <button
            type="button"
            onClick={() => signOutUserProfile()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium hover:bg-black/5 transition-colors cursor-pointer"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Account Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Column */}
        <aside className="lg:col-span-3">
          <nav
            aria-label="Account sections"
            className="rounded-xl border p-2 flex lg:flex-col gap-1 overflow-x-auto"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {ACCOUNT_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate({ page: 'account', tab: tab.id });
                  }}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active ? 'font-semibold' : 'hover:bg-black/5'
                  }`}
                  style={{
                    backgroundColor: active ? 'var(--color-accent)' : 'transparent',
                    color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-primary)',
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.id === 'orders' && (
                    <span className="text-xs opacity-80 tabular-nums">({userOrders.length})</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Active Tab Workspace */}
        <section className="lg:col-span-9 space-y-6">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div
                  className="rounded-xl border p-6 space-y-1.5"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Orders on File
                  </p>
                  <p className="font-display text-3xl font-medium tabular-nums">
                    {userOrders.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold underline underline-offset-4 pt-1 cursor-pointer"
                  >
                    View Order History
                  </button>
                </div>

                <div
                  className="rounded-xl border p-6 space-y-1.5"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Vespera Loyalty Points
                  </p>
                  <p
                    className="font-display text-3xl font-medium tabular-nums"
                    style={{ color: 'var(--color-brass)' }}
                  >
                    {userProfile.loyaltyPoints.toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('loyalty')}
                    className="text-xs font-semibold underline underline-offset-4 pt-1 cursor-pointer"
                  >
                    Redemption Tiers
                  </button>
                </div>

                <div
                  className="rounded-xl border p-6 space-y-1.5"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Lifetime Studio Spend
                  </p>
                  <p className="font-display text-3xl font-medium tabular-nums">
                    {formatPrice(lifetimeSpend)}
                  </p>
                  <span className="text-xs block pt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {cartItemCount > 0 ? `${cartItemCount} in bag ready for checkout` : 'White-glove eligible'}
                  </span>
                </div>
              </div>

              {/* Latest Order Snapshot */}
              <div
                className="rounded-xl border p-6 sm:p-8 space-y-5"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <h2 className="font-display text-xl font-medium">Most Recent Order</h2>
                  {userOrders[0] && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate({ page: 'track', orderNumber: userOrders[0].orderNumber })
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track #{userOrders[0].orderNumber}</span>
                    </button>
                  )}
                </div>

                {userOrders.length === 0 ? (
                  <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      No orders placed under {userProfile.email} yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'shop', category: 'All' })}
                      className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer self-start"
                    >
                      Browse Architectural Pieces
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div>
                        <span className="font-mono-tabular font-semibold">
                          #{userOrders[0].orderNumber}
                        </span>
                        <span className="mx-2 opacity-40">·</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {userOrders[0].createdAt} · {userOrders[0].deliveryTier}
                        </span>
                      </div>
                      <span
                        className="px-3 py-1 rounded-md border text-xs font-semibold"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-bg-surface-alt)',
                        }}
                      >
                        {userOrders[0].status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userOrders[0].items.map((item, idx) => {
                        const prod = products.find((p) => p.id === item.productId);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border"
                            style={{
                              borderColor: 'var(--color-border)',
                              backgroundColor: 'var(--color-bg-surface-alt)',
                            }}
                          >
                            <div className="w-14 h-12 rounded bg-white border overflow-hidden shrink-0 flex items-center justify-center" style={{ borderColor: 'var(--color-border)' }}>
                              {prod ? (
                                <SafeImage
                                  src={prod.images[0]}
                                  alt={item.productName}
                                  className="w-full h-full object-contain p-1 mix-blend-multiply"
                                />
                              ) : (
                                <Package className="w-4 h-4 opacity-30" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold truncate">{item.productName}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                {item.finish} · Qty {item.quantity}
                              </p>
                            </div>
                            <span className="text-xs font-semibold tabular-nums">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="rounded-xl border p-5 text-left hover:bg-black/5 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
                    <div>
                      <p className="text-sm font-semibold">Saved Contact &amp; City</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {userProfile.phone || 'Add phone'} · {userProfile.city}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="rounded-xl border p-5 text-left hover:bg-black/5 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
                    <div>
                      <p className="text-sm font-semibold">Active Shopping Bag</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} queued
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </>
          )}

          {/* 2. ORDERS & TRACKING TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-medium">Order History</h2>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'track' })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold hover:bg-black/5 cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Lookup Any Order ID</span>
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div
                  className="rounded-xl border p-10 text-center space-y-4"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <Package className="w-10 h-10 mx-auto opacity-30" strokeWidth={1.5} />
                  <p className="font-display text-lg font-medium">No completed orders yet</p>
                  <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                    Once you complete a furniture commission or studio order, live freight milestones will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'shop', category: 'All' })}
                    className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border p-6 space-y-4"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        borderColor: 'var(--color-border)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div>
                          <p className="font-mono-tabular text-base font-semibold">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            Placed {order.createdAt} · {order.deliveryTier} · {order.shippingAddress}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 rounded-md border text-xs font-semibold"
                            style={{
                              borderColor: 'var(--color-border)',
                              backgroundColor: 'var(--color-bg-surface-alt)',
                            }}
                          >
                            {order.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              navigate({ page: 'track', orderNumber: order.orderNumber })
                            }
                            className="vespera-btn-primary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Shipment</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {order.items.map((item, idx) => {
                          const prod = products.find((p) => p.id === item.productId);
                          return (
                            <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-12 h-10 rounded bg-white border overflow-hidden shrink-0 flex items-center justify-center"
                                  style={{ borderColor: 'var(--color-border)' }}
                                >
                                  {prod ? (
                                    <SafeImage
                                      src={prod.images[0]}
                                      alt={item.productName}
                                      className="w-full h-full object-contain p-0.5 mix-blend-multiply"
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 opacity-30" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{item.productName}</p>
                                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                    {item.finish} · Qty {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold tabular-nums shrink-0">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-sm font-semibold"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {(order.status === 'Pending' || order.status === 'Processing') && (
                            <button
                              type="button"
                              onClick={() => updateCustomerOrderStatus(order.id, 'pause')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>Pause Order</span>
                            </button>
                          )}

                          {order.status === 'Paused' && (
                            <button
                              type="button"
                              onClick={() => updateCustomerOrderStatus(order.id, 'resume')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Resume Order</span>
                            </button>
                          )}

                          {(order.status === 'Pending' ||
                            order.status === 'Processing' ||
                            order.status === 'Paused') && (
                            <button
                              type="button"
                              onClick={() => updateCustomerOrderStatus(order.id, 'cancel')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            Total ({order.paymentMethod})
                          </span>
                          <span className="tabular-nums text-base">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PROFILE & ADDRESS TAB */}
          {activeTab === 'profile' && (
            <div
              className="rounded-xl border p-6 sm:p-8 space-y-6"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h2 className="font-display text-2xl font-medium">Profile &amp; Studio Details</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Changes saved here automatically prefill Checkout and sync with your client record.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (415) 890-3412"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Membership Classification</label>
                  <select
                    value={membershipTier}
                    onChange={(e) =>
                      setMembershipTier(e.target.value as 'Atelier Member' | 'Trade Partner')
                    }
                    className="w-full sm:w-72 px-3.5 py-2.5 text-sm rounded-lg border bg-transparent cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="Atelier Member">Atelier Member</option>
                    <option value="Trade Partner">Trade Partner (Architect / Designer)</option>
                  </select>
                </div>

                {profileError && (
                  <p
                    role="alert"
                    className="rounded-lg border px-3.5 py-2.5 text-xs font-medium text-rose-800 bg-rose-50 border-rose-200"
                  >
                    {profileError}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="vespera-btn-primary px-6 py-3 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    {savedToast ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Profile Updated</span>
                      </>
                    ) : (
                      <span>Save Profile Details</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'checkout' })}
                    className="px-5 py-3 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. LOYALTY PRIVILEGES TAB */}
          {activeTab === 'loyalty' && (
            <div
              className="rounded-xl border p-6 sm:p-8 space-y-6"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <h2 className="font-display text-2xl font-medium">Vespera Loyalty Points</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Earn 10 points per {formatPrice(100)} spent · Redeem toward studio orders and white-glove privileges
                  </p>
                </div>
                <div
                  className="px-4 py-2 rounded-lg border text-right"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                  }}
                >
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Available Balance
                  </p>
                  <p
                    className="font-display text-2xl font-semibold tabular-nums"
                    style={{ color: 'var(--color-brass)' }}
                  >
                    {userProfile.loyaltyPoints.toLocaleString()} pts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div
                  className="rounded-lg border p-4 space-y-1.5"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                  }}
                >
                  <CreditCard className="w-4 h-4" style={{ color: 'var(--color-brass)' }} />
                  <p className="font-semibold">500 pts = {formatPrice(100)} Credit</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Redeemable on any sofa, dining table, or lighting commission.
                  </p>
                </div>
                <div
                  className="rounded-lg border p-4 space-y-1.5"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                  }}
                >
                  <Truck className="w-4 h-4" style={{ color: 'var(--color-brass)' }} />
                  <p className="font-semibold">White-Glove Upgrade</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Complimentary room-of-choice placement &amp; crating removal.
                  </p>
                </div>
                <div
                  className="rounded-lg border p-4 space-y-1.5"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                  }}
                >
                  <Award className="w-4 h-4" style={{ color: 'var(--color-brass)' }} />
                  <p className="font-semibold">Archive Previews</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    48-hour early access to signed Artists Club and limited releases.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'All' })}
                  className="vespera-btn-primary px-6 py-3 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Shop Collection to Earn Points
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
