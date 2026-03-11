'use client';

import { useEffect, useRef } from 'react';
import { BybitWsAdapter } from '@/lib/exchanges/adapters/bybit-ws';
import type { LiveCandleUpdate } from '@/lib/exchanges';

const wsAdapter = new BybitWsAdapter();

export function useLiveCandle(
  symbol: string,
  interval: string,
  onUpdate: (candle: LiveCandleUpdate) => void,
) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const disconnect = wsAdapter.connectLive(
      symbol,
      interval,
      (candle) => onUpdateRef.current(candle),
    );
    return () => disconnect();
  }, [symbol, interval]);
}
