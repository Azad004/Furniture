import React, { useState } from 'react';
import { Check, Coins, Lock, Plus, RotateCcw, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  BodyFontOption,
  CurrencyCode,
  DisplayFontOption,
  HeroSlide,
  ThemeSettings,
} from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';
import {
  changeAdminPasscode,
  isUsingDefaultAdminPasscode,
  validateAndReadImageFile,
} from '../../utils/security';

const THEME_PRESETS: Array<{ name: string; settings: ThemeSettings }> = [
  {
    name: 'Warm Alabaster (Default)',
    settings: {
      bgCanvas: '#faf8f5',
      bgSurface: '#ffffff',
      bgSurfaceAlt: '#f3efe8',
      textPrimary: '#1c1b19',
      textMuted: '#5c574f',
      accent: '#1e2a32',
      brass: '#8c6d46',
    },
  },
  {
    name: 'Nordic Slate & Chalk',
    settings: {
      bgCanvas: '#f6f7f9',
      bgSurface: '#ffffff',
      bgSurfaceAlt: '#eceff3',
      textPrimary: '#141921',
      textMuted: '#556070',
      accent: '#182436',
      brass: '#6e7f91',
    },
  },
  {
    name: 'Gallery Limestone',
    settings: {
      bgCanvas: '#f4f1ea',
      bgSurface: '#fbf9f5',
      bgSurfaceAlt: '#e9e3d7',
      textPrimary: '#221f1a',
      textMuted: '#635c51',
      accent: '#3b332b',
      brass: '#9a7b4f',
    },
  },
];

const DISPLAY_FONTS: Array<{ label: string; value: DisplayFontOption }> = [
  { label: 'Playfair Display (Classic Serif)', value: '"Playfair Display", Georgia, serif' },
  { label: 'Cormorant Garamond (Editorial Serif)', value: '"Cormorant Garamond", Georgia, serif' },
  { label: 'Fraunces (Sculptural Serif)', value: '"Fraunces", Georgia, serif' },
  { label: 'Bodoni Moda (High-Contrast Serif)', value: '"Bodoni Moda", Georgia, serif' },
];

const BODY_FONTS: Array<{ label: string; value: BodyFontOption }> = [
  { label: 'Plus Jakarta Sans (Clean Geometric)', value: '"Plus Jakarta Sans", -apple-system, sans-serif' },
  { label: 'DM Sans (Modern Grotesque)', value: '"DM Sans", -apple-system, sans-serif' },
  { label: 'Manrope (Structured Sans)', value: '"Manrope", -apple-system, sans-serif' },
  { label: 'Public Sans (Neutral Editorial)', value: '"Public Sans", -apple-system, sans-serif' },
];

export const AdminSettings: React.FC = () => {
  const {
    currencySettings,
    updateCurrencySettings,
    formatPrice,
    themeSettings,
    typographySettings,
    heroSlides,
    heroIntervalSec,
    updateThemeSettings,
    updateTypographySettings,
    updateHeroSlides,
    resetDesignSettings,
    navigate,
  } = useStore();

  const [slidesDraft, setSlidesDraft] = useState<HeroSlide[]>(heroSlides);
  const [intervalDraft, setIntervalDraft] = useState<number>(heroIntervalSec);
  const [sliderSaved, setSliderSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Admin Passcode Rotation state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [defaultPasscodeActive, setDefaultPasscodeActive] = useState<boolean>(() =>
    isUsingDefaultAdminPasscode()
  );

  const handlePasscodeRotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);
    if (newPasscode !== confirmPasscode) {
      setSecurityMessage({ type: 'error', text: 'New passcode confirmation does not match.' });
      return;
    }
    const res = await changeAdminPasscode(currentPasscode, newPasscode);
    if (!res.ok) {
      setSecurityMessage({ type: 'error', text: res.error || 'Unable to update passcode.' });
      return;
    }
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setDefaultPasscodeActive(false);
    setSecurityMessage({
      type: 'success',
      text: 'Administrator passcode updated and salted with PBKDF2-SHA256.',
    });
  };

  const handleSlideFieldChange = (
    id: string,
    patch: Partial<HeroSlide>
  ) => {
    setSlidesDraft((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleSlideImageUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    const result = await validateAndReadImageFile(file);
    if (!result.ok) {
      setUploadError(result.error);
      return;
    }
    handleSlideFieldChange(id, {
      image: result.dataUrl,
      assetDesignation: `lookcreative graphics · ${file.name.slice(0, 60)}`,
    });
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      kicker: 'Seasonal Release',
      headline: 'Bespoke forms crafted for quiet architectural spaces',
      subheadline: 'Hand-finished timber and stone available for immediate studio dispatch.',
      ctaLabel: 'Explore Collection',
      ctaTarget: { page: 'shop', category: 'All' },
      image: '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
      assetDesignation: 'lookcreative graphics · Custom Upload',
      active: true,
    };
    setSlidesDraft((prev) => [...prev, newSlide]);
  };

  const handleRemoveSlide = (id: string) => {
    if (slidesDraft.length <= 1) return;
    setSlidesDraft((prev) => prev.filter((s) => s.id !== id));
  };

  const saveHeroSlider = () => {
    updateHeroSlides(slidesDraft, intervalDraft);
    setSliderSaved(true);
    setTimeout(() => setSliderSaved(false), 2500);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">System Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Configure live CSS theme variables, storefront typography pairings, and the Home Page auto-sliding hero graphics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate({ page: 'home' })}
          className="px-4 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 cursor-pointer self-start sm:self-auto"
          style={{ borderColor: 'var(--color-border)' }}
        >
          Preview Live Home Page
        </button>
      </div>

      {/* 0. STORE CURRENCY & EXCHANGE RATE (USD <-> BDT) */}
      <section
        className="rounded-xl border p-6 space-y-6"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-start gap-3">
            <Coins className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
            <div>
              <h2 className="font-display text-xl font-medium">
                Store Currency &amp; Exchange Rate
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Switch the entire storefront and admin console between US Dollar ($) and Bangladeshi Taka (৳).
              </p>
            </div>
          </div>
          <span
            className="text-xs font-mono-tabular font-semibold px-3 py-1.5 rounded-lg border self-start sm:self-auto"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-surface-alt)',
            }}
          >
            Active: {currencySettings.currency} · Sample {formatPrice(2450)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              {
                code: 'USD' as CurrencyCode,
                symbol: '$',
                name: 'US Dollar (USD)',
                note: 'Base catalog pricing in dollars ($2,450)',
              },
              {
                code: 'BDT' as CurrencyCode,
                symbol: '৳',
                name: 'Bangladeshi Taka (BDT)',
                note: `Converted at 1 USD = ৳${currencySettings.bdtExchangeRate} (৳${Math.round(
                  2450 * currencySettings.bdtExchangeRate
                ).toLocaleString('en-US')})`,
              },
            ]
          ).map((option) => {
            const active = currencySettings.currency === option.code;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => updateCurrencySettings({ currency: option.code })}
                className="p-4 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between gap-4"
                style={{
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: active
                    ? 'var(--color-bg-surface-alt)'
                    : 'var(--color-bg-surface)',
                }}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="w-10 h-10 rounded-lg border flex items-center justify-center font-display text-lg font-semibold shrink-0"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: active ? 'var(--color-accent)' : 'transparent',
                      color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-primary)',
                    }}
                  >
                    {option.symbol}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{option.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {option.note}
                    </p>
                  </div>
                </div>
                {active && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              BDT Exchange Rate (1 USD = ? BDT)
            </label>
            <input
              type="number"
              min={1}
              step={0.5}
              value={currencySettings.bdtExchangeRate}
              onChange={(e) =>
                updateCurrencySettings({ bdtExchangeRate: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2 text-sm rounded-lg border bg-transparent font-mono-tabular"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs mr-1" style={{ color: 'var(--color-text-muted)' }}>
              Quick rates:
            </span>
            {[115, 120, 122, 125].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => updateCurrencySettings({ bdtExchangeRate: rate })}
                className="px-3 py-1.5 rounded-lg border text-xs font-mono-tabular hover:bg-black/5 cursor-pointer"
                style={{
                  borderColor:
                    currencySettings.bdtExchangeRate === rate
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  backgroundColor:
                    currencySettings.bdtExchangeRate === rate
                      ? 'var(--color-bg-surface-alt)'
                      : 'transparent',
                }}
              >
                ৳{rate}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 1. THEME ADJUSTMENT (Live CSS Variables) */}
      <section
        className="rounded-xl border p-6 space-y-6"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="font-display text-xl font-medium">1. Theme Adjustment</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Updates root CSS color variables globally in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDesignSettings}
            className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => updateThemeSettings(preset.settings)}
              className="px-3.5 py-2 rounded-lg border text-xs font-medium inline-flex items-center gap-2 hover:bg-black/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border"
                style={{ backgroundColor: preset.settings.bgCanvas, borderColor: 'rgba(0,0,0,0.2)' }}
              />
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: preset.settings.accent }}
              />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Individual Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            [
              { key: 'bgCanvas', label: 'Primary Canvas Background' },
              { key: 'bgSurface', label: 'Card Surface Background' },
              { key: 'bgSurfaceAlt', label: 'Secondary Section Surface' },
              { key: 'textPrimary', label: 'Primary Ink Text' },
              { key: 'textMuted', label: 'Muted Metadata Text' },
              { key: 'accent', label: 'Primary CTA & Accent' },
            ] as const
          ).map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-lg border flex items-center justify-between gap-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-xs font-mono-tabular mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {themeSettings[item.key]}
                </p>
              </div>
              <input
                type="color"
                aria-label={item.label}
                value={themeSettings[item.key]}
                onChange={(e) => updateThemeSettings({ [item.key]: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 2. TYPOGRAPHY ADJUSTMENT */}
      <section
        className="rounded-xl border p-6 space-y-5"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display text-xl font-medium">2. Typography Adjustment</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Select high-contrast Serif headers and clean Sans-Serif body fonts across the storefront and console.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Primary Header Serif Font
            </label>
            <select
              value={typographySettings.displayFont}
              onChange={(e) =>
                updateTypographySettings({ displayFont: e.target.value as DisplayFontOption })
              }
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)] cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {DISPLAY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Body &amp; UI Sans-Serif Font
            </label>
            <select
              value={typographySettings.bodyFont}
              onChange={(e) =>
                updateTypographySettings({ bodyFont: e.target.value as BodyFontOption })
              }
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)] cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="p-5 rounded-lg border space-y-2"
          style={{
            backgroundColor: 'var(--color-bg-surface-alt)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Live Typography Specimen
          </p>
          <p className="font-display text-2xl font-medium">
            Sculptural forms shaped in solid oak and raw stone
          </p>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Crafted with mortise-and-tenon joinery and finished in zero-VOC plant oils for quiet longevity.
          </p>
        </div>
      </section>

      {/* 3. HERO SLIDER UPDATE (lookcreative graphics) */}
      <section
        className="rounded-xl border p-6 space-y-6"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="font-display text-xl font-medium">3. Hero Slider Update (lookcreative graphics)</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Upload slide imagery, customize editorial headlines, and adjust auto-slide cadence for the Home Page hero.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            className="px-3.5 py-2 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 hover:bg-black/5 cursor-pointer self-start sm:self-auto"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
        </div>

        <div className="max-w-xs">
          <label className="block text-xs font-semibold mb-1.5">
            Auto-Slide Interval (Seconds)
          </label>
          <input
            type="number"
            min={3}
            max={20}
            value={intervalDraft}
            onChange={(e) => setIntervalDraft(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent font-mono-tabular"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>

        <div className="space-y-5">
          {slidesDraft.map((slide, idx) => (
            <div
              key={slide.id}
              className="rounded-xl border p-4 sm:p-5 space-y-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono-tabular text-xs font-semibold">
                    Slide 0{idx + 1}
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.active}
                      onChange={(e) =>
                        handleSlideFieldChange(slide.id, { active: e.target.checked })
                      }
                      className="accent-[var(--color-accent)]"
                    />
                    <span>Active on Home Page</span>
                  </label>
                </div>

                {slidesDraft.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="text-xs text-rose-700 inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 space-y-2.5">
                  <div className="aspect-[16/9] rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                    <SafeImage
                      src={slide.image}
                      alt={slide.headline}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label
                    className="w-full py-2 px-3 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-2 hover:bg-black/5 cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Hero Graphic</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={(e) => handleSlideImageUpload(slide.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Kicker</label>
                    <input
                      type="text"
                      value={slide.kicker}
                      onChange={(e) =>
                        handleSlideFieldChange(slide.id, { kicker: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">CTA Button Label</label>
                    <input
                      type="text"
                      value={slide.ctaLabel}
                      onChange={(e) =>
                        handleSlideFieldChange(slide.id, { ctaLabel: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1">Hero Headline</label>
                    <input
                      type="text"
                      value={slide.headline}
                      onChange={(e) =>
                        handleSlideFieldChange(slide.id, { headline: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1">Subheadline</label>
                    <textarea
                      rows={2}
                      value={slide.subheadline}
                      onChange={(e) =>
                        handleSlideFieldChange(slide.id, { subheadline: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {uploadError && (
          <p
            role="alert"
            className="rounded-lg border px-4 py-2.5 text-xs font-medium text-rose-800 bg-rose-50 border-rose-200"
          >
            {uploadError}
          </p>
        )}

        <div className="flex items-center justify-end gap-4 pt-2">
          {sliderSaved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Check className="w-4 h-4" />
              <span>Hero slider updated on storefront</span>
            </span>
          )}
          <button
            type="button"
            onClick={saveHeroSlider}
            className="vespera-btn-primary px-6 py-2.5 text-sm font-semibold cursor-pointer"
          >
            Save Hero Slider
          </button>
        </div>
      </section>

      {/* 4. ADMIN ACCESS & SECURITY HARDENING */}
      <section
        className="rounded-xl border p-6 space-y-6"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
              <h2 className="font-display text-xl font-medium">Admin Access &amp; Security</h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Rotate the studio administrator passcode. Credentials are derived with salted PBKDF2-HMAC-SHA256 (100,000 iterations) and sessions auto-lock after 30 minutes of inactivity.
            </p>
          </div>
          {defaultPasscodeActive && (
            <span className="text-xs font-semibold text-amber-800">
              Recommendation: Replace default studio passcode
            </span>
          )}
        </div>

        <form onSubmit={handlePasscodeRotation} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1">Current Passcode</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPasscode}
              onChange={(e) => setCurrentPasscode(e.target.value)}
              placeholder="Current passcode"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">New Passcode (8+ chars, letters &amp; numbers)</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="New strong passcode"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Confirm New Passcode</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="Confirm new passcode"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs">
              {securityMessage && (
                <span
                  role="alert"
                  className={
                    securityMessage.type === 'success'
                      ? 'font-medium text-emerald-700'
                      : 'font-medium text-rose-700'
                  }
                >
                  {securityMessage.text}
                </span>
              )}
            </div>
            <button
              type="submit"
              className="vespera-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Update Admin Passcode</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
