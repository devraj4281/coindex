import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import Link from 'next/link';

import DataTable from '@/components/ui/DataTable';
import CoinsPagination from '@/components/ui/CoinsPagination';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';

interface CoinsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CoinsPage({ searchParams }: CoinsPageProps) {
  const { page } = await searchParams;

  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = 10;

  const coins = await fetcher<CoinMarketData[]>('coins/markets', {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: perPage,
    page: currentPage,
    sparkline: false,
    price_change_percentage: '24h',
  },
60,);

  const hasMorePages = coins.length === perPage;

  const columns: DataTableColumn<CoinMarketData>[] = [
    {
      header: 'Rank',
      cell: (coin) => (
        <>
          {coin.market_cap_rank}
          <Link href={`/coins/${coin.id}`} className="absolute inset-0" />
        </>
      ),
    },
    {
      header: 'Token',
      cell: (coin) => (
        <div className="flex items-center gap-3">
          <Image src={coin.image} alt={coin.name} width={32} height={32} />
          <span>
            {coin.name} ({coin.symbol.toUpperCase()})
          </span>
        </div>
      ),
    },
    {
      header: 'Price',
      cell: (coin) => formatCurrency(coin.current_price),
    },
    {
      header: '24h Change',
      cell: (coin) => (
        <span
          className={cn(
            coin.price_change_percentage_24h > 0
              ? 'text-green-500'
              : 'text-red-500',
          )}
        >
          {formatPercentage(coin.price_change_percentage_24h)}
        </span>
      ),
    },
    {
      header: 'Market Cap',
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  return (
    <main id="coins-page">
      <h1 className="text-xl font-semibold mb-6">All Coins</h1>

      <DataTable
        columns={columns}
        data={coins}
        rowKey={(coin) => coin.id}
      />

      <CoinsPagination
        currentPage={currentPage}
        hasMorePages={hasMorePages}
      />
    </main>
  );
}
