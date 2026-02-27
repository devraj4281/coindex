'use client';

import { useEffect, useState } from 'react';
import type { UTCTimestamp } from 'lightweight-charts';


type Candle = {
  time:UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function useBinanceCandles(
  symbol: string,
  interval: string,
) {
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    fetch(`/api/binance/klines?symbol=${symbol}&interval=${interval}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error('Expected array, got:', data);
          return;
        }

        const formatted= data.map((k) => ({
          time: (k[0] / 1000) as UTCTimestamp,
          open: +k[1],
          high: +k[2],
          low: +k[3],
          close: +k[4],
        }));

        setCandles(formatted);
      })
      .catch(console.error);
  }, [symbol, interval]);

  return candles;
}
