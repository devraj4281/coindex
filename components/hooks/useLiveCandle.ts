'use client';

import { useEffect, useRef } from 'react';
import { OkxWsAdapter } from '@/lib/exchanges/adapters/okx-ws';
import type { LiveCandleUpdate } from '@/lib/exchanges';

const wsAdapter = new OkxWsAdapter();

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
