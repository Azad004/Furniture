import React, { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import {
  ensureAdminVault,
  getRateLimitStatus,
  isUsingDefaultAdminPasscode,
  verifyAdminPasscode,
} from '../../utils/security';
import { SafeImage } from '../common/SafeImage';

const INTERIOR_BACKDROP_SRC =
  '/src/assets/images/furniture_interior_backdrop_1795089361104.jpg';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
  onExit: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onAuthenticated,
  onExit,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutSec, setLockoutSec] = useState(0);
  const [usingDefault, setUsingDefault] = useState(true);

  useEffect(() => {
    void ensureAdminVault().then((vault) => {
      setUsingDefault(vault.isDefault);
    });
    const rl = getRateLimitStatus('admin_login', 5, 5 * 60 * 1000);
    if (!rl.allowed && rl.retryAfterSec > 0) {
      setLockoutSec(rl.retryAfterSec);
      setError(`Too many failed attempts. Locked for ${rl.retryAfterSec}s.`);
    }
  }, []);

  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = window.setInterval(() => {
      setLockoutSec((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutSec]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || submitting || lockoutSec > 0) return;
    setSubmitting(true);
    setError(null);

    const res = await verifyAdminPasscode(passcode);
    setSubmitting(false);

    if (res.ok) {
      setPasscode('');
      onAuthenticated();
      return;
    }

    setError(res.error || 'Authentication failed.');
    if (res.retryAfterSec) {
      setLockoutSec(res.retryAfterSec);
    }
    setUsingDefault(isUsingDefaultAdminPasscode());
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-canvas)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Full-Bleed Architectural Furniture Interior Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
        <SafeImage
          src={INTERIOR_BACKDROP_SRC}
          alt="Sunlit architectural living room interior with curved wool bouclé sectional and Roman travertine coffee table"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#181613]/60 via-[#1c1b19]/38 to-[#181613]/65" />
      </div>

      <div
        className="relative z-10 w-full max-w-md rounded-xl border p-7 sm:p-9 space-y-6 backdrop-blur-md shadow-2xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-bg-surface) 94%, transparent)',
          borderColor: 'rgba(255, 255, 255, 0.35)',
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: 'var(--color-brass)' }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Protected Console</span>
            </span>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1 text-xs font-medium hover:underline cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">
            Vespera Admin Sign In
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Enter your studio administrator passcode to access catalog management, client records, and order controls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-passcode" className="block text-xs font-semibold mb-1.5">
              Administrator Passcode
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50"
                aria-hidden="true"
              />
              <input
                id="admin-passcode"
                type={showPasscode ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={lockoutSec > 0 || submitting}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter studio passcode"
                className="w-full pl-10 pr-11 py-3 text-sm rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <button
                type="button"
                onClick={() => setShowPasscode((v) => !v)}
                aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center hover:bg-black/5 cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border px-3.5 py-2.5 text-xs font-medium text-rose-800 bg-rose-50 border-rose-200"
            >
              {lockoutSec > 0
                ? `Too many failed attempts. Please wait ${lockoutSec}s before trying again.`
                : error}
            </div>
          )}

          <button
            type="submit"
            disabled={lockoutSec > 0 || submitting || !passcode}
            className="vespera-btn-primary w-full py-3 px-5 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Verifying Credentials...'
              : lockoutSec > 0
                ? `Locked (${lockoutSec}s)`
                : 'Unlock Admin Console'}
          </button>
        </form>

        <div
          className="pt-4 border-t space-y-1.5 text-xs"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <p>
            Protected with salted PBKDF2-SHA256 verification, 5-attempt lockout, and automatic 30-minute idle timeout.
          </p>
          {usingDefault && (
            <p className="pt-1">
              Initial owner passcode:{' '}
              <code
                className="px-1.5 py-0.5 rounded font-mono-tabular font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Vespera#2026
              </code>{' '}
              (rotate immediately in System Settings).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
