'use client';

import { useEffect, useState } from 'react';
import type { UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '@/lib/exchanges';

type ChartCandle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function useCandles(symbol: string, interval: string) {
  const [candles, setCandles] = useState<ChartCandle[]>([]);

  useEffect(() => {
    fetch(`/api/binance/klines?symbol=${symbol}&interval=${interval}`)
      .then((res) => res.json())
      .then((data: Candle[]) => {
        if (!Array.isArray(data)) {
          console.error('[useCandles] expected Candle[], got:', data);
          return;
        }
        setCandles(
          data.map((c) => ({
            time: c.time as UTCTimestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          })),
        );
      })
      .catch(console.error);
  }, [symbol, interval]);

  return candles;
}
