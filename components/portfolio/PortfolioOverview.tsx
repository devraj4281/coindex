'use client';

import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import type { PortfolioSummary } from '@/lib/portfolio/types';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';

interface PortfolioOverviewProps {
  summary: PortfolioSummary;
}

export default function PortfolioOverview({ summary }: PortfolioOverviewProps) {
  const profitUp = summary.totalProfitLoss >= 0;
  const change24hUp = summary.change24h >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Portfolio Value */}
      <div className="bg-dark-500 rounded-xl p-5 border border-purple-600/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-100/60">Total Value</span>
          <Wallet className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-3xl font-bold mb-1">
          {formatCurrency(summary.totalValue)}
        </p>
        <p className="text-xs text-purple-100/50">
          Invested: {formatCurrency(summary.totalInvested)}
        </p>
      </div>

      {/* Total Profit/Loss */}
      <div className={cn(
        "bg-dark-500 rounded-xl p-5 border",
        profitUp ? "border-green-500/20" : "border-red-500/20"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-100/60">Total P&L</span>
          {profitUp ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
        </div>
        <p className={cn(
          "text-3xl font-bold mb-1",
          profitUp ? "text-green-500" : "text-red-500"
        )}>
          {profitUp && '+'}{formatCurrency(summary.totalProfitLoss)}
        </p>
        <p className={cn(
          "text-xs font-semibold",
          profitUp ? "text-green-500" : "text-red-500"
        )}>
          {profitUp && '+'}{formatPercentage(summary.totalProfitLossPercentage)}
        </p>
      </div>

      {/* 24h Change */}
      <div className={cn(
        "bg-dark-500 rounded-xl p-5 border",
        change24hUp ? "border-green-500/10" : "border-red-500/10"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-100/60">24h Change</span>
          {change24hUp ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
        </div>
        <p className={cn(
          "text-3xl font-bold mb-1",
          change24hUp ? "text-green-500" : "text-red-500"
        )}>
          {change24hUp && '+'}{formatCurrency(summary.change24h)}
        </p>
        <p className={cn(
          "text-xs font-semibold",
          change24hUp ? "text-green-500" : "text-red-500"
        )}>
          {change24hUp && '+'}{formatPercentage(summary.change24hPercentage)}
        </p>
      </div>

      {/* Holdings Count */}
      <div className="bg-dark-500 rounded-xl p-5 border border-purple-600/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-100/60">Holdings</span>
          <PieChart className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-3xl font-bold mb-1">
          {summary.holdingsCount}
        </p>
        <p className="text-xs text-purple-100/50">
          {summary.transactionsCount} {summary.transactionsCount === 1 ? 'transaction' : 'transactions'}
        </p>
      </div>
    </div>
  );
}
