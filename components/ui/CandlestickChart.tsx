'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CandlestickSeries,
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';
import {
  getCandlestickConfig,
  getChartConfig,
  PERIOD_BUTTONS,
} from '@/constants';
import { BINANCE_SYMBOL_MAP } from '@/lib/binance/symbolMap';

import { useBinanceCandles } from '@/components/hooks/useBinanceCandles';
import { useBinanceLiveCandle } from '@/components/hooks/useBinanceLiveCandle';

interface CandlestickChartProps {
  children?: React.ReactNode;
  coinId: string;
  height?: number;
  fillParent?: boolean;
  initialPeriod?: Period;
}

const PERIOD_TO_INTERVAL: Record<Period, string> = {
  daily: '1m',
  weekly: '1h',
  monthly: '4h',
  '3months': '1d',
  '6months': '1d',
  yearly: '1d',
  max: '1d',
};

const PERIOD_TO_BAR_SPACING: Record<Period, { barSpacing: number; minBarSpacing: number }> = {
  daily: { barSpacing: 12, minBarSpacing: 6 },
  weekly: { barSpacing: 10, minBarSpacing: 5 },
  monthly: { barSpacing: 8, minBarSpacing: 4 },
  '3months': { barSpacing: 8, minBarSpacing: 4 },
  '6months': { barSpacing: 8, minBarSpacing: 4 },
  yearly: { barSpacing: 8, minBarSpacing: 4 },
  max: { barSpacing: 8, minBarSpacing: 4 },
};

const CandlestickChart = ({
  children,
  coinId,
  height = 360,
  fillParent = false,
  initialPeriod = 'daily',
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  const [period, setPeriod] = useState<Period>(initialPeriod);

  const interval = PERIOD_TO_INTERVAL[period];
  const symbol = BINANCE_SYMBOL_MAP[coinId] ?? 'BTCUSDT';
  
  const candles = useBinanceCandles(symbol, interval);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const initH = fillParent ? container.clientHeight : height;

    const chart = createChart(container, {
      ...getChartConfig(initH, true),
      width:  container.clientWidth,
      height: initH,
    });

    const spacingConfig = PERIOD_TO_BAR_SPACING[period];
    chart.timeScale().applyOptions({
      barSpacing: spacingConfig.barSpacing,
      minBarSpacing: spacingConfig.minBarSpacing,
      rightBarStaysOnScroll: true,
    });

    const series = chart.addSeries(
      CandlestickSeries,
      getCandlestickConfig()
    );

    chartRef.current = chart;
    candleSeriesRef.current = series;
    setIsChartReady(true);

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width, height: h } = entries[0].contentRect;
      if (fillParent) {
        chart.applyOptions({ width, height: Math.floor(h) });
      } else {
        chart.applyOptions({ width });
      }
    });

    observer.observe(container);

    return () => {
      setIsChartReady(false);
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, fillParent, period]);

  useEffect(() => {
    if (!candleSeriesRef.current || !candles.length || !isChartReady) return;

    try {
      candleSeriesRef.current.setData(candles);
      const timeScale = chartRef.current?.timeScale();
      if (timeScale) {
        const visibleRange = period === 'daily' ? 60 : 100;
        timeScale.setVisibleLogicalRange({
          from: Math.max(0, candles.length - visibleRange),
          to: candles.length,
        });
      }
    } catch (error) {
      console.error('Error loading candle data:', error);
    }
  }, [candles, isChartReady, period]);

  useBinanceLiveCandle(symbol, interval, (live) => {
    if (!candleSeriesRef.current || !candles.length || !isChartReady) return;

    try {
      const liveTime = live.openTime as UTCTimestamp;
      const lastHistoricalTime = candles[candles.length - 1].time as number;

      if (liveTime >= lastHistoricalTime) {
        candleSeriesRef.current.update({
          time: liveTime,
          open: live.open,
          high: live.high,
          low: live.low,
          close: live.close,
        });
      }
    } catch (error) {
      console.error('Error updating live candle:', error);
    }
  });

  return (
    <div
      id="candlestick-chart"
      className={fillParent ? 'flex flex-col h-full' : ''}
    >
      <div className={`chart-header ${fillParent ? 'flex-none' : ''}`}>
        <div className="flex-1">{children}</div>

        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50">
            Period:
          </span>

          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={
                period === value
                  ? 'config-button-active'
                  : 'config-button'
              }
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={chartContainerRef}
        style={fillParent ? undefined : { height: `${height}px` }}
        className={`w-full ${fillParent ? 'flex-1 min-h-0' : ''}`}
      />
    </div>
  );
};

export default CandlestickChart;
