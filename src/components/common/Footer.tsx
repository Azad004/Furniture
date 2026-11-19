import React from 'react';
import { Clock, Mail, Phone, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigate } = useStore();

  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: 'var(--color-accent)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-accent-contrast)',
      }}
    >
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)] gap-8 lg:gap-9 pb-12 border-b"
          style={{ borderColor: 'color-mix(in srgb, var(--color-accent-contrast) 18%, transparent)' }}
        >
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Vespera Atelier
            </h2>
            <p className="text-sm leading-relaxed max-w-md opacity-80">
              Architectural furniture crafted from kiln-dried European white oak, oiled American walnut, Roman travertine, and unbleached Belgian linen. Made for quiet permanence.
            </p>
            <p className="text-xs opacity-65">
              Showrooms in San Francisco · New York · Copenhagen
            </p>
          </div>

          <div className="space-y-3 text-left">
            <h3 className="text-xs font-semibold tracking-wide">
              Catalog
            </h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'All' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  All Pieces
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'Sofas' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Sofas &amp; Sectionals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'Chairs' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Chairs &amp; Seating
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'Tables' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Tables &amp; Stone
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'Storage' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Storage &amp; Credenzas
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <h3 className="text-xs font-semibold tracking-wide">
              Atelier &amp; Journal
            </h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'about' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'events' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Events
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'style-report' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Design Style Report
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'innovation' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Innovation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'showrooms' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Showrooms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'contact' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <h3 className="text-xs font-semibold tracking-wide">
              Client Care
            </h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'track' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'service' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Service Request
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'help' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Help (Q&amp;A)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'recently-viewed' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Recently Viewed
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'account', tab: 'overview' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'admin', module: 'overview' })}
                  className="text-left hover:opacity-100 hover:underline cursor-pointer"
                >
                  Admin Console
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3.5 text-left">
            <h3 className="text-xs font-semibold tracking-wide">
              Delivery Queries &amp; Support
            </h3>
            <div className="space-y-2.5 text-sm opacity-85">
              <p className="flex items-start gap-2 leading-snug">
                <Truck className="w-4 h-4 mt-0.5 shrink-0 opacity-75" />
                <span>White-glove freight scheduling, lead times &amp; transit inquiries</span>
              </p>
              <a
                href="tel:+14157994210"
                className="flex items-center gap-2 tabular-nums hover:opacity-100 hover:underline"
              >
                <Phone className="w-4 h-4 shrink-0 opacity-75" />
                <span>+1 (415) 799-4210</span>
              </a>
              <a
                href="mailto:delivery@vespera-atelier.com"
                className="flex items-center gap-2 break-all hover:opacity-100 hover:underline"
              >
                <Mail className="w-4 h-4 shrink-0 opacity-75" />
                <span>delivery@vespera-atelier.com</span>
              </a>
              <p className="flex items-start gap-2 text-xs opacity-75">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Mon – Sat · 9:00 AM – 6:00 PM PST</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <button
                type="button"
                onClick={() => navigate({ page: 'contact' })}
                className="text-left text-sm font-medium underline underline-offset-4 hover:opacity-80 cursor-pointer"
              >
                Send Delivery Query
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'track' })}
                className="text-left text-sm font-medium underline underline-offset-4 hover:opacity-80 cursor-pointer"
              >
                Track Shipment
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs opacity-75">
          <span>&copy; {new Date().getFullYear()} Vespera Atelier. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => navigate({ page: 'contact' })}
              className="text-left hover:opacity-100 hover:underline cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'events' })}
              className="text-left hover:opacity-100 hover:underline cursor-pointer"
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'style-report' })}
              className="text-left hover:opacity-100 hover:underline cursor-pointer"
            >
              Design Style Report
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'innovation' })}
              className="text-left hover:opacity-100 hover:underline cursor-pointer"
            >
              Innovation
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'privacy' })}
              className="text-left hover:opacity-100 hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
