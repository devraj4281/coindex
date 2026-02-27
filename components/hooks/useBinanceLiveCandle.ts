'use client';

import { useEffect, useRef } from 'react';
import { connectBinanceLiveCandles } from '@/lib/binance/ws';

export function useBinanceLiveCandle(
  symbol: string,
  interval: string,
  onUpdate: (candle: any) => void,
) {
  const onUpdateRef = useRef(onUpdate);

 
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const disconnect = connectBinanceLiveCandles(
      symbol,
      interval,
      (candle) => onUpdateRef.current(candle),
    );
    return () => disconnect();
  }, [symbol, interval]);
}
