import { BodyFontOption, DisplayFontOption } from '../types/store';

// ============================================================================
// VESPERA ATELIER — CLIENT SECURITY, SANITIZATION & CRYPTOGRAPHIC UTILITIES
// ============================================================================

export const MAX_IMAGE_FILE_BYTES = 2 * 1024 * 1024; // 2 MB cap to prevent storage DoS
export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle expiry
const ADMIN_AUTH_VAULT_KEY = 'vespera_admin_vault_v1';
const ADMIN_SESSION_KEY = 'vespera_admin_session_v1';
const CUSTOMER_CRED_KEY = 'vespera_customer_creds_v1';
const RATE_LIMIT_PREFIX = 'vespera_rl_';

// Default bootstrap admin passcode hash metadata (never stored in plaintext)
// Initial studio owner passcode: Vespera#2026 (owner can rotate in Admin -> System Settings)
const DEFAULT_ADMIN_SEED = 'Vespera#2026';

export const ALLOWED_DISPLAY_FONTS: readonly DisplayFontOption[] = [
  '"Playfair Display", Georgia, serif',
  '"Cormorant Garamond", Georgia, serif',
  '"Fraunces", Georgia, serif',
  '"Bodoni Moda", Georgia, serif',
];

export const ALLOWED_BODY_FONTS: readonly BodyFontOption[] = [
  '"Plus Jakarta Sans", -apple-system, sans-serif',
  '"DM Sans", -apple-system, sans-serif',
  '"Manrope", -apple-system, sans-serif',
  '"Public Sans", -apple-system, sans-serif',
];

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

// ============================================================================
// 1. CRYPTOGRAPHIC PRIMITIVES (Web Crypto PBKDF2-HMAC-SHA256)
// ============================================================================

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return out;
}

export function generateRandomHex(byteLength = 16): string {
  const buf = new Uint8Array(byteLength);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < byteLength; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(buf);
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function deriveSecretHash(secret: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  const saltBytes = hexToBytes(saltHex);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        secretBytes,
        'PBKDF2',
        false,
        ['deriveBits']
      );
      const derived = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBytes.buffer as ArrayBuffer,
          iterations: 100_000,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );
      return bytesToHex(new Uint8Array(derived));
    } catch {
      // Fall through to SHA-256 digest if PBKDF2 is restricted in environment
      const combined = new Uint8Array(saltBytes.length + secretBytes.length);
      combined.set(saltBytes, 0);
      combined.set(secretBytes, saltBytes.length);
      const digest = await crypto.subtle.digest('SHA-256', combined);
      return bytesToHex(new Uint8Array(digest));
    }
  }

  // Deterministic fallback hash only if Web Crypto is completely unavailable
  let h1 = 0x811c9dc5;
  const input = `${saltHex}:${secret}`;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0');
}

// ============================================================================
// 2. RATE LIMITING & BRUTE-FORCE PROTECTION
// ============================================================================

interface RateLimitBucket {
  attempts: number[];
  lockedUntil: number;
}

export function getRateLimitStatus(
  bucketKey: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  try {
    const raw = sessionStorage.getItem(`${RATE_LIMIT_PREFIX}${bucketKey}`);
    if (!raw) return { allowed: true, remaining: maxAttempts, retryAfterSec: 0 };
    const parsed = JSON.parse(raw) as RateLimitBucket;
    if (parsed.lockedUntil && parsed.lockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.ceil((parsed.lockedUntil - now) / 1000),
      };
    }
    const recent = (parsed.attempts || []).filter((ts) => now - ts < windowMs);
    const remaining = Math.max(0, maxAttempts - recent.length);
    return { allowed: remaining > 0, remaining, retryAfterSec: 0 };
  } catch {
    return { allowed: true, remaining: maxAttempts, retryAfterSec: 0 };
  }
}

export function recordFailedAttempt(
  bucketKey: string,
  maxAttempts: number,
  windowMs: number,
  lockoutMs: number
): { locked: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  try {
    const raw = sessionStorage.getItem(`${RATE_LIMIT_PREFIX}${bucketKey}`);
    const prev: RateLimitBucket = raw ? JSON.parse(raw) : { attempts: [], lockedUntil: 0 };
    const recent = [...(prev.attempts || []).filter((ts) => now - ts < windowMs), now];
    const locked = recent.length >= maxAttempts;
    const next: RateLimitBucket = {
      attempts: locked ? [] : recent,
      lockedUntil: locked ? now + lockoutMs : 0,
    };
    sessionStorage.setItem(`${RATE_LIMIT_PREFIX}${bucketKey}`, JSON.stringify(next));
    return {
      locked,
      remaining: locked ? 0 : Math.max(0, maxAttempts - recent.length),
      retryAfterSec: locked ? Math.ceil(lockoutMs / 1000) : 0,
    };
  } catch {
    return { locked: false, remaining: maxAttempts, retryAfterSec: 0 };
  }
}

export function clearRateLimit(bucketKey: string): void {
  try {
    sessionStorage.removeItem(`${RATE_LIMIT_PREFIX}${bucketKey}`);
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// 3. ADMIN PASSCODE VAULT & TIMED SESSION MANAGEMENT
// ============================================================================

interface AdminVaultRecord {
  salt: string;
  hash: string;
  isDefault: boolean;
  updatedAt: string;
}

interface AdminSessionRecord {
  token: string;
  issuedAt: number;
  lastActiveAt: number;
  expiresAt: number;
}

export async function ensureAdminVault(): Promise<AdminVaultRecord> {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_VAULT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminVaultRecord>;
      if (parsed.salt && parsed.hash) {
        return {
          salt: parsed.salt,
          hash: parsed.hash,
          isDefault: Boolean(parsed.isDefault),
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch {
    // Re-seed vault if corrupted
  }

  const salt = generateRandomHex(16);
  const hash = await deriveSecretHash(DEFAULT_ADMIN_SEED, salt);
  const record: AdminVaultRecord = {
    salt,
    hash,
    isDefault: true,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(ADMIN_AUTH_VAULT_KEY, JSON.stringify(record));
  } catch {
    // Ignore quota errors
  }
  return record;
}

export function isUsingDefaultAdminPasscode(): boolean {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_VAULT_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as Partial<AdminVaultRecord>;
    return parsed.isDefault !== false;
  } catch {
    return true;
  }
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Passcode must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Passcode must not exceed 128 characters.' };
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  if (!hasLetter || !hasDigit) {
    return {
      valid: false,
      message: 'Passcode must include both letters and at least one number.',
    };
  }
  return { valid: true };
}

export async function verifyAdminPasscode(passcode: string): Promise<{
  ok: boolean;
  error?: string;
  retryAfterSec?: number;
}> {
  const rl = getRateLimitStatus('admin_login', 5, 5 * 60 * 1000);
  if (!rl.allowed) {
    return {
      ok: false,
      error: `Too many failed attempts. Locked for ${rl.retryAfterSec}s.`,
      retryAfterSec: rl.retryAfterSec,
    };
  }

  const vault = await ensureAdminVault();
  const candidateHash = await deriveSecretHash(passcode, vault.salt);
  if (constantTimeEqual(candidateHash, vault.hash)) {
    clearRateLimit('admin_login');
    const now = Date.now();
    const session: AdminSessionRecord = {
      token: generateRandomHex(24),
      issuedAt: now,
      lastActiveAt: now,
      expiresAt: now + ADMIN_IDLE_TIMEOUT_MS,
    };
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
    return { ok: true };
  }

  const fail = recordFailedAttempt('admin_login', 5, 5 * 60 * 1000, 60 * 1000);
  if (fail.locked) {
    return {
      ok: false,
      error: `Too many failed attempts. Access locked for ${fail.retryAfterSec} seconds.`,
      retryAfterSec: fail.retryAfterSec,
    };
  }
  return {
    ok: false,
    error: `Invalid passcode. ${fail.remaining} attempt${fail.remaining === 1 ? '' : 's'} remaining before temporary lockout.`,
  };
}

export async function changeAdminPasscode(
  currentPasscode: string,
  newPasscode: string
): Promise<{ ok: boolean; error?: string }> {
  const vault = await ensureAdminVault();
  const currentHash = await deriveSecretHash(currentPasscode, vault.salt);
  if (!constantTimeEqual(currentHash, vault.hash)) {
    return { ok: false, error: 'Current passcode is incorrect.' };
  }

  const strength = validatePasswordStrength(newPasscode);
  if (!strength.valid) {
    return { ok: false, error: strength.message };
  }

  const newSalt = generateRandomHex(16);
  const newHash = await deriveSecretHash(newPasscode, newSalt);
  const updated: AdminVaultRecord = {
    salt: newSalt,
    hash: newHash,
    isDefault: false,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(ADMIN_AUTH_VAULT_KEY, JSON.stringify(updated));
  } catch {
    return { ok: false, error: 'Unable to save updated credentials to browser storage.' };
  }
  return { ok: true };
}

export function isAdminSessionValid(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as Partial<AdminSessionRecord>;
    if (!session.token || typeof session.expiresAt !== 'number') return false;
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function touchAdminSession(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as AdminSessionRecord;
    const now = Date.now();
    if (now > session.expiresAt) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    const next: AdminSessionRecord = {
      ...session,
      lastActiveAt: now,
      expiresAt: now + ADMIN_IDLE_TIMEOUT_MS,
    };
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// 4. CUSTOMER CREDENTIAL STORE (Salted PBKDF2-SHA256)
// ============================================================================

interface CustomerCredential {
  salt: string;
  hash: string;
  createdAt: string;
}

function loadCustomerCreds(): Record<string, CustomerCredential> {
  try {
    const raw = localStorage.getItem(CUSTOMER_CRED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function registerOrVerifyCustomer(
  email: string,
  password: string,
  mode: 'signin' | 'register'
): Promise<{ ok: boolean; error?: string }> {
  const cleanEmail = sanitizeEmail(email);
  if (!isValidEmail(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  const rl = getRateLimitStatus(`cust_${cleanEmail}`, 5, 5 * 60 * 1000);
  if (!rl.allowed) {
    return {
      ok: false,
      error: `Too many sign-in attempts. Please wait ${rl.retryAfterSec}s before trying again.`,
    };
  }

  const creds = loadCustomerCreds();
  const existing = creds[cleanEmail];

  if (mode === 'register') {
    if (existing) {
      return {
        ok: false,
        error: 'An account with this email already exists. Please switch to Sign In.',
      };
    }
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return { ok: false, error: strength.message };
    }
    const salt = generateRandomHex(16);
    const hash = await deriveSecretHash(password, salt);
    creds[cleanEmail] = { salt, hash, createdAt: new Date().toISOString() };
    try {
      localStorage.setItem(CUSTOMER_CRED_KEY, JSON.stringify(creds));
    } catch {
      return { ok: false, error: 'Unable to save account credentials.' };
    }
    clearRateLimit(`cust_${cleanEmail}`);
    return { ok: true };
  }

  // Sign-in mode
  if (!existing) {
    recordFailedAttempt(`cust_${cleanEmail}`, 5, 5 * 60 * 1000, 60 * 1000);
    return {
      ok: false,
      error: 'Invalid email or password. If you are new, choose Create Account.',
    };
  }

  const candidate = await deriveSecretHash(password, existing.salt);
  if (!constantTimeEqual(candidate, existing.hash)) {
    const fail = recordFailedAttempt(`cust_${cleanEmail}`, 5, 5 * 60 * 1000, 60 * 1000);
    return {
      ok: false,
      error: fail.locked
        ? `Too many failed attempts. Try again in ${fail.retryAfterSec}s.`
        : `Invalid email or password. ${fail.remaining} attempts remaining.`,
    };
  }

  clearRateLimit(`cust_${cleanEmail}`);
  return { ok: true };
}

// ============================================================================
// 5. URL, FILE, TEXT & CSS TOKEN SANITIZATION
// ============================================================================

export function sanitizeImageUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 3_000_000) return '';

  // Block control characters or embedded whitespace injection
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return '';

  // Allow safe root-relative static studio asset paths
  if (trimmed.startsWith('/src/assets/') || trimmed.startsWith('/assets/')) {
    if (trimmed.includes('..') || trimmed.includes('\\')) return '';
    return trimmed;
  }

  // Allow verified base64 raster data URIs only (strictly block SVG/HTML/JS!)
  if (trimmed.startsWith('data:')) {
    const rasterDataUriPattern =
      /^data:image\/(png|jpeg|jpg|webp|avif);base64,[A-Za-z0-9+/=\s]+$/i;
    return rasterDataUriPattern.test(trimmed) ? trimmed : '';
  }

  // Allow strictly HTTPS URLs with no embedded username/password credentials
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return '';
    if (parsed.username || parsed.password) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

async function hasValidRasterMagicBytes(file: File): Promise<boolean> {
  try {
    const headerBuf = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(headerBuf);
    if (bytes.length < 4) return false;

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47;

    // JPEG: FF D8 FF
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    // WebP: RIFF....WEBP
    const isWebp =
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;

    // AVIF / ISO BMFF: ....ftyp
    const isAvif =
      bytes.length >= 8 &&
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70;

    return isPng || isJpeg || isWebp || isAvif;
  } catch {
    return false;
  }
}

export async function validateAndReadImageFile(
  file: File
): Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }> {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      ok: false,
      error: `Unsupported file type "${file.type || 'unknown'}". Only PNG, JPG, WebP, or AVIF images are permitted (SVG is blocked for security).`,
    };
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_FILE_BYTES) {
    return {
      ok: false,
      error: `Image "${file.name}" exceeds the 2 MB security size limit.`,
    };
  }

  const magicOk = await hasValidRasterMagicBytes(file);
  if (!magicOk) {
    return {
      ok: false,
      error: `File "${file.name}" failed binary image signature verification.`,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        resolve({ ok: false, error: 'Unable to read image file.' });
        return;
      }
      const safe = sanitizeImageUrl(reader.result);
      if (!safe) {
        resolve({ ok: false, error: 'Image encoding failed security validation.' });
        return;
      }
      resolve({ ok: true, dataUrl: safe });
    };
    reader.onerror = () => resolve({ ok: false, error: 'Failed to read selected image file.' });
    reader.readAsDataURL(file);
  });
}

export function sanitizeText(value: unknown, maxLength = 300): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultilineText(value: unknown, maxLength = 4000): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(value: unknown): string {
  return sanitizeText(value, 160).toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function sanitizePhone(value: unknown): string {
  return sanitizeText(value, 32).replace(/[^0-9+\-()\s.]/g, '');
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function sanitizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : fallback;
}

export function sanitizeFontFamily<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof value !== 'string') return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function safeDecodeURIComponent(segment: string): string {
  try {
    return sanitizeText(decodeURIComponent(segment), 120);
  } catch {
    return sanitizeText(segment, 120);
  }
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
  return Math.round(clampNumber(value, min, max, fallback));
}

// ============================================================================
// 6. PII MASKING HELPERS (Order Tracking Privacy)
// ============================================================================

export function maskPersonName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Verified Client';
  return parts
    .map((part) => (part.length <= 1 ? `${part}*` : `${part[0]}${'*'.repeat(Math.min(4, part.length - 1))}`))
    .join(' ');
}

export function maskShippingAddress(address: string): string {
  const segments = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (segments.length <= 1) {
    return 'Verify billing email to view delivery destination';
  }
  const cityRegion = segments[segments.length - 1].replace(/\d/g, '•');
  return `••••••, ${cityRegion}`;
}
