/**
 * Exchange adapter registry.
 *
 * Set the EXCHANGE env variable to switch data providers at deploy time:
 *
 *   EXCHANGE=okx      → OKX   (default — no geo-restrictions)
 *   EXCHANGE=bybit    → Bybit (may be blocked on US cloud IPs)
 *
 * To add a new exchange:
 *   1. Create lib/exchanges/adapters/<name>.ts  implementing ExchangeRestAdapter
 *   2. Import it below and add to the ADAPTERS map
 *   3. Set EXCHANGE=<name> in your Vercel / .env.local
 *   4. Nothing else changes — route, hooks, chart are untouched
 */

import { BybitRestAdapter } from './adapters/bybit';
import { OkxRestAdapter }   from './adapters/okx';
import type { ExchangeRestAdapter } from './types';

export { type Candle, type LiveCandleUpdate, type ExchangeRestAdapter, type ExchangeWsAdapter } from './types';
export { SYMBOL_MAP } from './symbolMap';

// ─── Registry ─────────────────────────────────────────────────────────────────

type SupportedExchange = 'okx' | 'bybit';

const ADAPTERS: Record<SupportedExchange, () => ExchangeRestAdapter> = {
    okx:   () => new OkxRestAdapter(),
    bybit: () => new BybitRestAdapter(),
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function createRestAdapter(): ExchangeRestAdapter {
    const raw = (process.env.EXCHANGE ?? 'okx').toLowerCase();
    const exchange = raw as SupportedExchange;
    const factory = ADAPTERS[exchange];

    if (!factory) {
        const available = Object.keys(ADAPTERS).join(', ');
        console.warn(
            `[exchanges] Unknown exchange "${raw}". ` +
            `Available: ${available}. Falling back to "okx".`,
        );
        return new OkxRestAdapter();
    }

    const adapter = factory();
    console.log(`[exchanges] Active REST adapter → ${adapter.name}`);
    return adapter;
}

// ─── Singletons ───────────────────────────────────────────────────────────────
// Resolved once at module-load time (server start / cold start on Vercel).

export const restAdapter = createRestAdapter();
