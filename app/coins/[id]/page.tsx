import { notFound } from 'next/navigation';
import Image from 'next/image';

import { fetcher } from '@/lib/coingecko.actions';
import { cn, formatCurrency, formatPercentage, formatCompactNumber } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import CandlestickChart from '@/components/ui/CandlestickChart';
import CurrencyConverter from '@/components/ui/CurrencyConverter';

interface CoinPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoinPage({ params }: CoinPageProps) {
  const { id } = await params;
  if (!id) notFound();

  let coin: CoinDetailsData;
  try {
    coin = await fetcher<CoinDetailsData>(`coins/${id}`, {
      localization: false,
      tickers:      false,
      market_data:  true,
      community_data: false,
      developer_data: false,
      sparkline:    false,
    });
  } catch {
    notFound();
  }

  const change24h          = coin.market_data?.price_change_percentage_24h ?? 0;
  const up                 = change24h > 0;
  const high24h            = coin.market_data?.high_24h?.usd             ?? 0;
  const low24h             = coin.market_data?.low_24h?.usd              ?? 0;
  const currentPrice       = coin.market_data?.current_price?.usd         ?? 0;
  const priceChange24hValue= coin.market_data?.price_change_24h           ?? 0;
  const marketCap          = coin.market_data?.market_cap?.usd            ?? 0;
  const volume24h          = coin.market_data?.total_volume?.usd          ?? 0;
  const circulatingSupply  = coin.market_data?.circulating_supply          ?? 0;
  const ath                = coin.market_data?.ath?.usd                   ?? 0;
  const atl                = coin.market_data?.atl?.usd                   ?? 0;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-dark-700">

      <div className="flex-none flex items-center gap-4 px-4 sm:px-6 py-3 bg-dark-500/80 backdrop-blur-md border-b border-purple-600/15">
        <div className="flex items-center gap-3 shrink-0">
          <Image
            src={coin.image.large}
            alt={coin.name}
            width={36}
            height={36}
            priority
            className="rounded-full"
          />
          <div>
            <h1 className="text-base font-bold leading-tight flex items-center gap-1.5">
              {coin.name}
              <span className="text-purple-100/60 text-xs font-medium uppercase">{coin.symbol}</span>
            </h1>
            <p className="text-xs text-purple-100/40">#{coin.market_cap_rank}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-purple-600/20 shrink-0" />

        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-2xl font-bold">{formatCurrency(currentPrice)}</span>
          <span className="text-purple-100/50 text-sm">USD</span>
          <span className={cn(
            'flex items-center gap-1 text-sm font-semibold ml-1',
            up ? 'text-green-400' : 'text-red-400',
          )}>
            {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change24h.toFixed(2)}%
          </span>
          <span className={cn('text-sm font-medium', up ? 'text-green-400/70' : 'text-red-400/70')}>
            ({up ? '+' : ''}{formatCurrency(priceChange24hValue)})
          </span>
        </div>

        <div className="h-8 w-px bg-purple-600/20 shrink-0" />

        <div className="flex items-center gap-5 overflow-hidden">
          {[
            { label: 'High 24h',  value: formatCurrency(high24h) },
            { label: 'Low 24h',   value: formatCurrency(low24h) },
            { label: 'Market Cap',value: formatCompactNumber(marketCap) },
            { label: 'Volume',    value: formatCompactNumber(volume24h) },
            { label: 'ATH',       value: formatCurrency(ath) },
            { label: 'Supply',    value: formatCompactNumber(circulatingSupply) },
          ].map(({ label, value }) => (
            <div key={label} className="shrink-0 hidden sm:block">
              <p className="text-[10px] text-purple-100/50 uppercase tracking-wide leading-none mb-0.5">{label}</p>
              <p className="text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">

        <div className="flex-1 min-w-0 flex flex-col p-3 overflow-hidden">
          <div className="flex-1 min-h-0 bg-dark-500 rounded-xl overflow-hidden border border-purple-600/10">
            <CandlestickChart coinId={id} initialPeriod="daily" fillParent />
          </div>
        </div>

        <aside
          className="w-72 xl:w-80 shrink-0 flex flex-col overflow-y-auto border-l border-purple-600/15 bg-dark-500/40 backdrop-blur-sm custom-scrollbar"
        >
          <div className="p-4 space-y-4">

            <section className="bg-dark-500/80 rounded-xl p-4 border border-purple-600/15 hover:border-purple-600/30 transition-all">
              <h2 className="text-sm font-bold text-purple-100/70 uppercase tracking-wider mb-3">
                Currency Converter
              </h2>
              <CurrencyConverter
                basePrice={currentPrice}
                coinSymbol={coin.symbol.toUpperCase()}
              />
            </section>

            <section className="bg-dark-500/80 rounded-xl p-4 border border-purple-600/15">
              <h2 className="text-sm font-bold text-purple-100/70 uppercase tracking-wider mb-3">
                Market Stats
              </h2>
              <div className="space-y-2.5">
                {[
                  { label: 'Market Cap',          value: formatCompactNumber(marketCap) },
                  { label: 'Volume (24h)',         value: formatCompactNumber(volume24h) },
                  { label: 'Circulating Supply',  value: formatCompactNumber(circulatingSupply) },
                  { label: 'All-Time High',        value: formatCurrency(ath) },
                  { label: 'All-Time Low',         value: formatCurrency(atl) },
                  { label: '24h High',             value: formatCurrency(high24h) },
                  { label: '24h Low',              value: formatCurrency(low24h) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-purple-600/10 last:border-none">
                    <span className="text-xs text-purple-100/60">{label}</span>
                    <span className="text-sm font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </aside>

      </div>
    </div>
  );
}
