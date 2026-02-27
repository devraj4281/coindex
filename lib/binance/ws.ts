

type LiveCandle = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function connectBinanceLiveCandles(
  symbol: string,
  interval: string,
  onUpdate: (candle: LiveCandle) => void,
) {
  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let closedManually = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const stream = `${symbol.toLowerCase()}@kline_${interval}`;
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);

      ws.onopen = () => {
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (!msg.k) return;
          const k = msg.k;

          onUpdate({
            openTime: Math.floor(k.t / 1000),
            open: +k.o,
            high: +k.h,
            low: +k.l,
            close: +k.c,
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        if (closedManually) return;

        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          reconnectAttempts++;
          reconnectTimer = setTimeout(connect, delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  connect();

  return () => {
    closedManually = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.onopen = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  };
}