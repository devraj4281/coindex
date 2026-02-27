import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency, formatInternationalNumber } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/ui/CandlestickChart';
import CurrencyConverter from '@/components/ui/CurrencyConverter';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CoinOverview = async () => {
  try {
    const coin = await fetcher<CoinDetailsData>('coins/bitcoin', {
      dex_pair_format: 'symbol',
    });

    const priceChange24h = coin.market_data.price_change_percentage_24h;
    const isPositive = priceChange24h >= 0;

    return (
      <div id="coin-overview">
        <CandlestickChart coinId="bitcoin" initialPeriod="daily">
          <div className="coin-overview-header">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={56}
              height={56}
              className="coin-overview-image"
            />
            <div className="coin-overview-info">
              <p className="coin-overview-name">
                {coin.name} <span className="coin-overview-symbol">/ {coin.symbol.toUpperCase()}</span>
              </p>
              <div className="coin-overview-price-row">
                <h1 className="coin-overview-price">{formatCurrency(coin.market_data.current_price.usd)}</h1>
                <div className={`coin-overview-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {Math.abs(priceChange24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CandlestickChart>

        {/* Stats Grid */}
        <div className="coin-overview-stats-grid">
          <div className="coin-overview-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">24h High</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="stat-card-value">
              {formatCurrency(coin.market_data.high_24h.usd)}
            </p>
          </div>

          <div className="coin-overview-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">24h Low</span>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="stat-card-value">
              {formatCurrency(coin.market_data.low_24h.usd)}
            </p>
          </div>

          <div className="coin-overview-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Market Cap</span>
            </div>
            <p className="stat-card-value">
              {formatInternationalNumber(coin.market_data.market_cap.usd)}
            </p>
          </div>

          <div className="coin-overview-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">24h Volume</span>
            </div>
            <p className="stat-card-value">
              {formatInternationalNumber(coin.market_data.total_volume.usd)}
            </p>
          </div>
        </div>

        {/* Currency Converter */}
        <div className="coin-overview-converter-section">
          <h3 className="converter-section-title">Currency Converter</h3>
          <CurrencyConverter basePrice={coin.market_data.current_price.usd} coinSymbol={coin.symbol.toUpperCase()} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching coin overview:', error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
