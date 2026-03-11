'use client';

import dynamic from 'next/dynamic';

const CandlestickChart = dynamic(
  () => import('@/components/ui/CandlestickChart'),
  { ssr: false },
);

export default CandlestickChart;
