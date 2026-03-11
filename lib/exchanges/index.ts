/**
 * Exchange adapter registry.
 *
 * Set the EXCHANGE env variable to switch data providers at deploy time:
 *
 *   EXCHANGE=bybit    → Bybit (default, no geo-restrictions)
 *
 * To add a new exchange:
 *   1. Create lib/exchanges/adapters/<name>.ts  implementing ExchangeRestAdapter
 *   2. Import it below and add to the ADAPTERS map
 *   3. Set EXCHANGE=<name> in your Vercel / .env.local
 *   4. Nothing else changes — route, hooks, chart are untouched
 */

import { BybitRestAdapter } from './adapters/bybit';
import type { ExchangeRestAdapter } from './types';

export { type Candle, type LiveCandleUpdate, type ExchangeRestAdapter, type ExchangeWsAdapter } from './types';
export { SYMBOL_MAP } from './symbolMap';

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add new exchanges here.  The value is a factory fn so adapters are only
// instantiated when actually selected (no unnecessary network calls / init work).

type SupportedExchange = 'bybit'; // extend union as you add adapters

const ADAPTERS: Record<SupportedExchange, () => ExchangeRestAdapter> = {
    bybit: () => new BybitRestAdapter(),
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function createRestAdapter(): ExchangeRestAdapter {
    const raw = (process.env.EXCHANGE ?? 'bybit').toLowerCase();
    const exchange = raw as SupportedExchange;
    const factory = ADAPTERS[exchange];

    if (!factory) {
        const available = Object.keys(ADAPTERS).join(', ');
        console.warn(
            `[exchanges] Unknown exchange "${raw}". ` +
            `Available: ${available}. Falling back to "bybit".`,
        );
        return new BybitRestAdapter();
    }

    const adapter = factory();
    console.log(`[exchanges] Active adapter → ${adapter.name}`);
    return adapter;
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Resolved once at module-load time (server start / cold start on Vercel).

export const restAdapter = createRestAdapter();
