/**
 * Bybit WebSocket adapter — BROWSER ONLY.
 * Do not import this file in server components or API routes.
 */

import type { ExchangeWsAdapter, LiveCandleUpdate } from '../types';

const INTERVAL_MAP: Record<string, string> = {
    '1m': '1', '3m': '3', '5m': '5',
    '15m': '15', '30m': '30',
    '1h': '60', '2h': '120', '4h': '240',
    '6h': '360', '12h': '720',
    '1d': 'D', '1w': 'W', '1M': 'M',
};

export class BybitWsAdapter implements ExchangeWsAdapter {
    private readonly url = 'wss://stream.bybit.com/v5/public/linear';

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

        const bybitInterval = INTERVAL_MAP[interval] ?? interval;
        const topic = `kline.${bybitInterval}.${symbol}`;

        const connect = () => {
            try {
                ws = new WebSocket(this.url);

                ws.onopen = () => {
                    reconnectAttempts = 0;
                    ws?.send(JSON.stringify({ op: 'subscribe', args: [topic] }));
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data as string);
                        // Skip confirmation/pong frames
                        if (!msg.data?.length) return;
                        const k = msg.data[0];
                        onUpdate({
                            openTime: Math.floor(k.start / 1000),
                            open: +k.open,
                            high: +k.high,
                            low: +k.low,
                            close: +k.close,
                        });
                    } catch (e) {
                        console.error('[BybitWs] parse error:', e);
                    }
                };

                ws.onerror = (e) => console.error('[BybitWs] error:', e);

                ws.onclose = () => {
                    if (closedManually) return;
                    if (reconnectAttempts < maxAttempts) {
                        const delay = Math.min(1_000 * 2 ** reconnectAttempts, 10_000);
                        reconnectAttempts++;
                        reconnectTimer = setTimeout(connect, delay);
                    } else {
                        console.error('[BybitWs] max reconnect attempts reached');
                    }
                };
            } catch (e) {
                console.error('[BybitWs] connect error:', e);
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
