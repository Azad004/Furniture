import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const STATE_FILE_PATH = path.resolve(__dirname, '.vespera-store-state.json');

interface SharedStoreData {
  products: unknown[];
  heroSlides: unknown[];
  heroIntervalSec: number;
  orders: unknown[];
  customers: unknown[];
  reviews: unknown[];
  themeSettings: Record<string, unknown>;
  typographySettings: Record<string, unknown>;
  content: Record<string, unknown>;
  currencySettings: Record<string, unknown>;
  bestSellersTiles: unknown[];
  shopLookTiles: unknown[];
  collectionTiles: unknown[];
  siteVisits: number;
  productViewCounts: Record<string, number>;
}

interface ServerStoreEnvelope {
  initialized: boolean;
  revision: number;
  updatedAt: string;
  data: SharedStoreData | null;
}

function loadPersistedEnvelope(): ServerStoreEnvelope {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const raw = fs.readFileSync(STATE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<ServerStoreEnvelope>;
      if (parsed && parsed.initialized && parsed.data && typeof parsed.data === 'object') {
        return {
          initialized: true,
          revision: typeof parsed.revision === 'number' ? parsed.revision : 1,
          updatedAt:
            typeof parsed.updatedAt === 'string'
              ? parsed.updatedAt
              : new Date().toISOString(),
          data: parsed.data,
        };
      }
    }
  } catch {
    // Fall back to uninitialized state if persisted file is corrupted
  }
  return {
    initialized: false,
    revision: 0,
    updatedAt: new Date().toISOString(),
    data: null,
  };
}

let storeEnvelope: ServerStoreEnvelope = loadPersistedEnvelope();

function persistEnvelopeToDisk(): void {
  try {
    const tmpPath = `${STATE_FILE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(storeEnvelope), 'utf8');
    fs.renameSync(tmpPath, STATE_FILE_PATH);
  } catch {
    // Non-fatal in read-only or restricted environments
  }
}

function isValidSharedPayload(raw: unknown): raw is SharedStoreData {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  return (
    Array.isArray(obj.products) &&
    Array.isArray(obj.orders) &&
    Array.isArray(obj.customers) &&
    Array.isArray(obj.reviews) &&
    typeof obj.siteVisits === 'number' &&
    obj.productViewCounts !== null &&
    typeof obj.productViewCounts === 'object'
  );
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10mb' }));

  // Defensive security headers across all API & HTML responses
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 8 * 1024 * 1024,
  });

  const getActiveConnections = () => {
    let count = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) count += 1;
    });
    return count;
  };

  const broadcast = (message: Record<string, unknown>, excludeClientId?: string) => {
    const payload = JSON.stringify({
      ...message,
      activeConnections: getActiveConnections(),
    });
    wss.clients.forEach((client) => {
      const tagged = client as WebSocket & { clientId?: string };
      if (client.readyState !== WebSocket.OPEN) return;
      if (excludeClientId && tagged.clientId === excludeClientId) return;
      client.send(payload);
    });
  };

  wss.on('connection', (ws) => {
    const tagged = ws as WebSocket & { clientId?: string; isAlive?: boolean };
    tagged.isAlive = true;

    ws.on('pong', () => {
      tagged.isAlive = true;
    });

    ws.on('message', (rawMsg) => {
      try {
        const msg = JSON.parse(String(rawMsg)) as { type?: string; clientId?: string };
        if (msg.type === 'hello' && typeof msg.clientId === 'string') {
          tagged.clientId = msg.clientId.slice(0, 64);
        }
      } catch {
        // Ignore malformed messages
      }
    });

    // Send initial authoritative state snapshot on connect
    ws.send(
      JSON.stringify({
        type: 'state:init',
        initialized: storeEnvelope.initialized,
        revision: storeEnvelope.revision,
        updatedAt: storeEnvelope.updatedAt,
        data: storeEnvelope.data,
        activeConnections: getActiveConnections(),
      })
    );

    ws.on('close', () => {
      broadcast({ type: 'presence:updated', updatedAt: new Date().toISOString() });
    });
  });

  // Periodic WebSocket heartbeat to clear stale connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      const tagged = client as WebSocket & { isAlive?: boolean };
      if (tagged.isAlive === false) {
        client.terminate();
        return;
      }
      tagged.isAlive = false;
      client.ping();
    });
  }, 30_000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  // ==========================================================================
  // REST API: Real-Time State Synchronization & 30s Dashboard Metrics Pull
  // ==========================================================================

  app.get('/api/state', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      initialized: storeEnvelope.initialized,
      revision: storeEnvelope.revision,
      updatedAt: storeEnvelope.updatedAt,
      data: storeEnvelope.data,
      activeConnections: getActiveConnections(),
    });
  });

  app.post('/api/state/sync', (req, res) => {
    const body = req.body as {
      clientId?: string;
      seedOnly?: boolean;
      data?: unknown;
    };

    if (!isValidSharedPayload(body?.data)) {
      res.status(400).json({ ok: false, error: 'Invalid shared state payload' });
      return;
    }

    // If this is a first-boot seed and server already has state, return existing state
    if (body.seedOnly && storeEnvelope.initialized && storeEnvelope.data) {
      res.json({
        ok: true,
        revision: storeEnvelope.revision,
        updatedAt: storeEnvelope.updatedAt,
        data: storeEnvelope.data,
        activeConnections: getActiveConnections(),
      });
      return;
    }

    const clientId =
      typeof body.clientId === 'string' ? body.clientId.slice(0, 64) : undefined;

    storeEnvelope = {
      initialized: true,
      revision: storeEnvelope.revision + 1,
      updatedAt: new Date().toISOString(),
      data: body.data,
    };
    persistEnvelopeToDisk();

    broadcast(
      {
        type: 'state:updated',
        clientId,
        revision: storeEnvelope.revision,
        updatedAt: storeEnvelope.updatedAt,
        data: storeEnvelope.data,
      },
      clientId
    );

    res.json({
      ok: true,
      revision: storeEnvelope.revision,
      updatedAt: storeEnvelope.updatedAt,
      activeConnections: getActiveConnections(),
    });
  });

  app.post('/api/events/visit', (req, res) => {
    if (!storeEnvelope.initialized || !storeEnvelope.data) {
      res.json({ ok: false, initialized: false });
      return;
    }
    const clientId =
      typeof req.body?.clientId === 'string' ? req.body.clientId.slice(0, 64) : undefined;
    storeEnvelope.data.siteVisits = (Number(storeEnvelope.data.siteVisits) || 0) + 1;
    storeEnvelope.revision += 1;
    storeEnvelope.updatedAt = new Date().toISOString();
    persistEnvelopeToDisk();

    broadcast(
      {
        type: 'analytics:updated',
        clientId,
        revision: storeEnvelope.revision,
        updatedAt: storeEnvelope.updatedAt,
        siteVisits: storeEnvelope.data.siteVisits,
        productViewCounts: storeEnvelope.data.productViewCounts,
      },
      clientId
    );

    res.json({
      ok: true,
      siteVisits: storeEnvelope.data.siteVisits,
      revision: storeEnvelope.revision,
      updatedAt: storeEnvelope.updatedAt,
    });
  });

  app.post('/api/events/product-view', (req, res) => {
    const productId =
      typeof req.body?.productId === 'string' ? req.body.productId.trim().slice(0, 64) : '';
    if (!productId || !storeEnvelope.initialized || !storeEnvelope.data) {
      res.json({ ok: false });
      return;
    }
    const clientId =
      typeof req.body?.clientId === 'string' ? req.body.clientId.slice(0, 64) : undefined;
    const prevCount = Number(storeEnvelope.data.productViewCounts[productId]) || 0;
    storeEnvelope.data.productViewCounts = {
      ...storeEnvelope.data.productViewCounts,
      [productId]: prevCount + 1,
    };
    storeEnvelope.revision += 1;
    storeEnvelope.updatedAt = new Date().toISOString();
    persistEnvelopeToDisk();

    broadcast(
      {
        type: 'analytics:updated',
        clientId,
        revision: storeEnvelope.revision,
        updatedAt: storeEnvelope.updatedAt,
        siteVisits: storeEnvelope.data.siteVisits,
        productViewCounts: storeEnvelope.data.productViewCounts,
      },
      clientId
    );

    res.json({
      ok: true,
      productViewCounts: storeEnvelope.data.productViewCounts,
      revision: storeEnvelope.revision,
      updatedAt: storeEnvelope.updatedAt,
    });
  });

  app.get('/api/dashboard/metrics', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      initialized: storeEnvelope.initialized,
      revision: storeEnvelope.revision,
      updatedAt: storeEnvelope.updatedAt,
      serverTime: new Date().toISOString(),
      activeConnections: getActiveConnections(),
      data: storeEnvelope.data,
    });
  });

  // ==========================================================================
  // FRONTEND SERVING (Vite middleware in dev, dist/ static bundle in prod)
  // ==========================================================================

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Vespera Atelier server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
