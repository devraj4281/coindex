/**
 * OKX WebSocket adapter — BROWSER ONLY.
 * Do not import this file in server components or API routes.
 */

import type { ExchangeWsAdapter, LiveCandleUpdate } from '../types';

/** Channel name = "candle" + OKX interval suffix */
const CHANNEL_MAP: Record<string, string> = {
  '1m': 'candle1m',   '3m': 'candle3m',   '5m': 'candle5m',
  '15m': 'candle15m', '30m': 'candle30m',
  '1h': 'candle1H',   '2h': 'candle2H',   '4h': 'candle4H',
  '6h': 'candle6H',   '12h': 'candle12H',
  '1d': 'candle1D',   '1w': 'candle1W',   '1M': 'candle1M',
};

export class OkxWsAdapter implements ExchangeWsAdapter {
  private readonly url = 'wss://ws.okx.com:8443/ws/v5/public';

  connectLive(
    symbol: string,
    interval: string,
    onUpdate: (candle: LiveCandleUpdate) => void,
  ): () => void {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closedManually = false;
    let reconnectAttempts = 0;
    const maxAttempts = 5;

    const channel = CHANNEL_MAP[interval] ?? `candle${interval}`;

    const connect = () => {
      try {
        ws = new WebSocket(this.url);

        ws.onopen = () => {
          reconnectAttempts = 0;
          ws?.send(JSON.stringify({
            op: 'subscribe',
            args: [{ channel, instId: symbol }],
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string);
            // Skip subscription confirmation / pong frames
            if (!msg.data?.length) return;
            const k = msg.data[0] as string[];
            // k: [timestamp_ms, open, high, low, close, vol, volCcy, volCcyQuote, confirm]
            onUpdate({
              openTime: Math.floor(Number(k[0]) / 1000),
              open: +k[1],
              high: +k[2],
              low: +k[3],
              close: +k[4],
            });
          } catch (e) {
            console.error('[OkxWs] parse error:', e);
          }
        };

        ws.onerror = (e) => console.error('[OkxWs] error:', e);

        ws.onclose = () => {
          if (closedManually) return;
          if (reconnectAttempts < maxAttempts) {
            const delay = Math.min(1_000 * 2 ** reconnectAttempts, 10_000);
            reconnectAttempts++;
            reconnectTimer = setTimeout(connect, delay);
          } else {
            console.error('[OkxWs] max reconnect attempts reached');
          }
        };
      } catch (e) {
        console.error('[OkxWs] connect error:', e);
      }
    };

    connect();

    return () => {
      closedManually = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null;
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      }
    };
  }
}
