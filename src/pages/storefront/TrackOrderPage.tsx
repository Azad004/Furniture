import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ClipboardList,
  Lock,
  PackageCheck,
  PauseCircle,
  RotateCcw,
  Search,
  Truck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';
import {
  getRateLimitStatus,
  maskPersonName,
  maskShippingAddress,
  recordFailedAttempt,
} from '../../utils/security';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
}

const TIMELINE_STEPS: Array<{
  status: Exclude<OrderStatus, 'Refunded' | 'Paused' | 'Cancelled'>;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    status: 'Pending',
    title: 'Order Confirmed',
    description: 'Studio specification received and lumber/upholstery stock allocated.',
    icon: ClipboardList,
  },
  {
    status: 'Processing',
    title: 'Atelier Finish & QA',
    description: 'Joinery inspection, oil hand-finishing, and protective crating in progress.',
    icon: PackageCheck,
  },
  {
    status: 'Shipped',
    title: 'White-Glove Freight Dispatch',
    description: 'In transit with regional white-glove carrier; delivery window confirmed.',
    icon: Truck,
  },
  {
    status: 'Delivered',
    title: 'Placed & Assembled',
    description: 'Delivered to room of choice with packaging removal complete.',
    icon: CheckCircle2,
  },
];

const STATUS_INDEX: Record<Exclude<OrderStatus, 'Refunded' | 'Paused' | 'Cancelled'>, number> = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
};

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber }) => {
  const { orders, products, userProfile, navigate, formatPrice } = useStore();

  const ownOrders = userProfile
    ? orders.filter(
        (o) =>
          o.customerId === userProfile.id ||
          o.customerEmail.toLowerCase() === userProfile.email.toLowerCase()
      )
    : [];

  const defaultOrderNumber = initialOrderNumber || ownOrders[0]?.orderNumber || '';

  const [orderInput, setOrderInput] = useState(defaultOrderNumber);
  const [emailInput, setEmailInput] = useState(userProfile?.email || '');
  const [searchedNumber, setSearchedNumber] = useState(defaultOrderNumber);
  const [searchedEmail, setSearchedEmail] = useState(userProfile?.email || '');
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderInput(initialOrderNumber);
      setSearchedNumber(initialOrderNumber);
      setLookupError(null);
    }
  }, [initialOrderNumber]);

  const normalizedQuery = searchedNumber.trim().toLowerCase().replace(/^#/, '');
  const normalizedEmail = searchedEmail.trim().toLowerCase();

  const matchedOrder = normalizedQuery
    ? orders.find((o) => {
        const matchesNumber =
          o.orderNumber.toLowerCase() === normalizedQuery ||
          o.id.toLowerCase() === normalizedQuery;
        if (!matchesNumber) return false;
        if (normalizedEmail && o.customerEmail.toLowerCase() !== normalizedEmail) return false;
        return true;
      })
    : undefined;

  const isPiiVerified = Boolean(
    matchedOrder &&
      ((userProfile &&
        (matchedOrder.customerId === userProfile.id ||
          matchedOrder.customerEmail.toLowerCase() === userProfile.email.toLowerCase())) ||
        (normalizedEmail &&
          matchedOrder.customerEmail.toLowerCase() === normalizedEmail))
  );

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const rl = getRateLimitStatus('order_track', 20, 5 * 60 * 1000);
    if (!rl.allowed) {
      setLookupError(
        `Too many tracking lookups. Please wait ${rl.retryAfterSec}s before trying again.`
      );
      return;
    }
    recordFailedAttempt('order_track', 20, 5 * 60 * 1000, 60 * 1000);

    const cleaned = orderInput.trim().replace(/^#/, '');
    setSearchedNumber(cleaned);
    setSearchedEmail(emailInput.trim());
    if (cleaned) {
      navigate({ page: 'track', orderNumber: cleaned });
    }
  };

  const quickSelectOrder = (orderNum: string) => {
    setLookupError(null);
    setOrderInput(orderNum);
    setSearchedNumber(orderNum);
    if (userProfile?.email) {
      setEmailInput(userProfile.email);
      setSearchedEmail(userProfile.email);
    }
    navigate({ page: 'track', orderNumber: orderNum });
  };

  const activeStageIndex =
    matchedOrder &&
    matchedOrder.status !== 'Refunded' &&
    matchedOrder.status !== 'Paused' &&
    matchedOrder.status !== 'Cancelled'
      ? STATUS_INDEX[matchedOrder.status]
      : -1;

  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <header className="pb-8 border-b space-y-2.5" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-medium tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          White-Glove Dispatch &amp; Freight Status
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-medium">Track Your Order</h1>
        <p className="text-base sm:text-lg max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>
          Follow each architectural piece from studio joinery inspection through regional white-glove freight placement.
        </p>
      </header>

      {/* Lookup Form */}
      <section
        className="rounded-xl border p-6 sm:p-8 space-y-5"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-medium mb-1.5">Order Number</label>
            <div className="relative">
              <Search
                className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50"
                aria-hidden="true"
              />
              <input
                type="text"
                required
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                placeholder="e.g. VSP-1047"
                className="w-full pl-11 pr-4 py-3 text-base rounded-lg border bg-transparent font-mono-tabular"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-sm font-medium mb-1.5">
              Billing Email <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Verify with order email"
              className="w-full px-4 py-3 text-base rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="vespera-btn-primary w-full py-3 px-5 text-base font-semibold cursor-pointer whitespace-nowrap"
            >
              Track Order
            </button>
          </div>
        </form>

        {lookupError && (
          <p
            role="alert"
            className="rounded-lg border px-4 py-2.5 text-sm font-medium text-rose-800 bg-rose-50 border-rose-200"
          >
            {lookupError}
          </p>
        )}

        {/* Quick Order Switcher scoped strictly to signed-in member's own orders */}
        {ownOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-sm">
            <span style={{ color: 'var(--color-text-muted)' }}>Your recent orders:</span>
            {ownOrders.slice(0, 5).map((ord) => {
              const active = matchedOrder?.orderNumber === ord.orderNumber;
              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => quickSelectOrder(ord.orderNumber)}
                  className={`px-3.5 py-2 rounded-lg border font-mono-tabular transition-colors cursor-pointer ${
                    active ? 'font-semibold' : 'hover:bg-black/5'
                  }`}
                  style={{
                    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: active ? 'var(--color-bg-surface-alt)' : 'transparent',
                  }}
                >
                  {ord.orderNumber} · {ord.status}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Result State */}
      {!matchedOrder ? (
        <section
          className="rounded-xl border p-10 text-center space-y-3"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <AlertCircle className="w-10 h-10 mx-auto opacity-45" strokeWidth={1.5} />
          <h2 className="font-display text-2xl font-medium">
            No order found matching “{searchedNumber || '—'}”
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Verify your order reference (e.g., VSP-1047) or clear the optional billing email filter and try again.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Live Fulfillment Timeline */}
          <section
            className="lg:col-span-7 rounded-xl border p-6 sm:p-8 space-y-7"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Tracking Reference
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-medium mt-0.5">
                  Order #{matchedOrder.orderNumber}
                </h2>
                <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  Placed {matchedOrder.createdAt} · Carrier Ref:{' '}
                  <span className="font-mono-tabular">
                    VSP-FR-{matchedOrder.orderNumber.replace(/\D/g, '')}82
                  </span>
                </p>
              </div>

              <span
                className="px-4 py-2 rounded-lg border text-sm font-semibold"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                Status: {matchedOrder.status}
              </span>
            </div>

            {matchedOrder.status === 'Refunded' ? (
              <div
                className="rounded-xl border p-5 flex items-start gap-3.5"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                <RotateCcw className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-base font-semibold">Order Refunded</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {matchedOrder.refundReason ||
                      'This order has been refunded in full back to the original payment method.'}
                  </p>
                </div>
              </div>
            ) : matchedOrder.status === 'Paused' ? (
              <div
                className="rounded-xl border p-5 flex items-start gap-3.5"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                <PauseCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-700" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-amber-700">Order Paused</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {matchedOrder.refundReason ||
                      'Fulfillment is currently on hold per client request. Resume anytime from your account or studio concierge.'}
                  </p>
                </div>
              </div>
            ) : matchedOrder.status === 'Cancelled' ? (
              <div
                className="rounded-xl border p-5 flex items-start gap-3.5"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                <Ban className="w-5 h-5 mt-0.5 shrink-0 text-rose-700" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-rose-700">Order Cancelled</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {matchedOrder.refundReason ||
                      'This order has been cancelled prior to final dispatch.'}
                  </p>
                </div>
              </div>
            ) : (
              <ol className="space-y-6">
                {TIMELINE_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const completed = index <= activeStageIndex;
                  const current = index === activeStageIndex;
                  return (
                    <li key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-11 h-11 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            backgroundColor: completed
                              ? 'var(--color-accent)'
                              : 'var(--color-bg-surface-alt)',
                            borderColor: completed
                              ? 'var(--color-accent)'
                              : 'var(--color-border)',
                            color: completed
                              ? 'var(--color-accent-contrast)'
                              : 'var(--color-text-muted)',
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < TIMELINE_STEPS.length - 1 && (
                          <div
                            className="w-px flex-1 min-h-[24px] my-1"
                            style={{
                              backgroundColor:
                                index < activeStageIndex
                                  ? 'var(--color-accent)'
                                  : 'var(--color-border)',
                            }}
                          />
                        )}
                      </div>

                      <div className="pb-2">
                        <div className="flex items-center gap-2.5">
                          <h3
                            className={`text-base sm:text-[17px] font-semibold ${
                              completed ? '' : 'opacity-55'
                            }`}
                          >
                            {step.title}
                          </h3>
                          {current && (
                            <span
                              className="text-xs font-semibold px-2.5 py-0.5 rounded border"
                              style={{
                                borderColor: 'var(--color-border)',
                                backgroundColor: 'var(--color-bg-surface-alt)',
                                color: 'var(--color-brass)',
                              }}
                            >
                              Current Stage
                            </span>
                          )}
                        </div>
                        <p
                          className="text-sm sm:text-[15px] mt-1 leading-relaxed"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Right 5 Cols: Delivery & Item Manifest */}
          <aside
            className="lg:col-span-5 rounded-xl border p-6 sm:p-7 space-y-5"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3
              className="font-display text-xl sm:text-2xl font-medium pb-3.5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Shipment Manifest
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 text-sm">
              <div>
                <p style={{ color: 'var(--color-text-muted)' }}>Recipient &amp; Destination</p>
                <p className="font-semibold text-base sm:text-lg mt-0.5">
                  {isPiiVerified
                    ? matchedOrder.customerName
                    : maskPersonName(matchedOrder.customerName)}
                </p>
                <p className="mt-0.5 text-sm sm:text-[15px]" style={{ color: 'var(--color-text-muted)' }}>
                  {isPiiVerified
                    ? matchedOrder.shippingAddress
                    : maskShippingAddress(matchedOrder.shippingAddress)}
                </p>
                {!isPiiVerified && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Enter matching billing email above to reveal full recipient &amp; address</span>
                  </p>
                )}
              </div>
              <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Service Tier &amp; Payment</p>
                <p className="font-medium text-sm sm:text-[15px] mt-0.5">
                  {matchedOrder.deliveryTier} · {matchedOrder.paymentMethod}
                </p>
              </div>
            </div>

            <div
              className="space-y-3.5 pt-3.5 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {matchedOrder.items.map((item, idx) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center gap-3.5">
                    <div
                      className="w-16 h-14 rounded-lg border bg-white overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {product ? (
                        <SafeImage
                          src={product.images[0]}
                          alt={item.productName}
                          className="w-full h-full object-contain p-1 mix-blend-multiply"
                        />
                      ) : (
                        <PackageCheck className="w-5 h-5 opacity-30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {product ? (
                        <button
                          type="button"
                          onClick={() => navigate({ page: 'product', slug: product.slug })}
                          className="text-left text-base font-medium hover:underline truncate block w-full cursor-pointer"
                        >
                          {item.productName}
                        </button>
                      ) : (
                        <p className="text-base font-medium truncate">{item.productName}</p>
                      )}
                      <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {item.finish} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-base font-semibold tabular-nums shrink-0">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className="pt-4 border-t space-y-2 text-base"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span className="tabular-nums">{formatPrice(matchedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>Freight Delivery</span>
                <span className="tabular-nums">
                  {matchedOrder.shippingFee === 0
                    ? 'Complimentary'
                    : formatPrice(matchedOrder.shippingFee)}
                </span>
              </div>
              <div
                className="flex justify-between font-semibold text-lg sm:text-xl pt-2.5 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span>Order Total</span>
                <span className="tabular-nums">{formatPrice(matchedOrder.total)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};
