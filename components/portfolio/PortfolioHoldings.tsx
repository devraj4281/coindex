'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import type { Holding } from '@/lib/portfolio/types';
import { ArrowUpDown, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

interface PortfolioHoldingsProps {
  holdings: Holding[];
  onDeleteTransaction?: (transactionId: string) => void;
}

type SortField = 'name' | 'value' | 'profitLoss' | 'allocation';

export default function PortfolioHoldings({ holdings, onDeleteTransaction }: PortfolioHoldingsProps) {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'name':
        aValue = a.coinName.toLowerCase();
        bValue = b.coinName.toLowerCase();
        break;
      case 'value':
        aValue = a.currentValue;
        bValue = b.currentValue;
        break;
      case 'profitLoss':
        aValue = a.profitLoss;
        bValue = b.profitLoss;
        break;
      case 'allocation':
        aValue = a.allocation;
        bValue = b.allocation;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  if (holdings.length === 0) {
    return (
      <div className="bg-dark-500 rounded-xl p-12 border border-purple-600/10 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Holdings Yet</h3>
          <p className="text-purple-100/60 mb-6">
            Start building your portfolio by adding your first transaction
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-500 rounded-xl border border-purple-600/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-purple-600/10">
              <th className="text-left p-4 text-sm font-semibold text-purple-100/70">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-purple-100 transition-colors"
                >
                  Coin
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right p-4 text-sm font-semibold text-purple-100/70">
                Holdings
              </th>
              <th className="text-right p-4 text-sm font-semibold text-purple-100/70">
                Avg. Price
              </th>
              <th className="text-right p-4 text-sm font-semibold text-purple-100/70">
                Current Price
              </th>
              <th className="text-right p-4 text-sm font-semibold text-purple-100/70">
                <button
                  onClick={() => handleSort('value')}
                  className="flex items-center gap-1 hover:text-purple-100 transition-colors ml-auto"
                >
                  Value
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right p-4 text-sm font-semibold text-purple-100/70">
                <button
                  onClick={() => handleSort('profitLoss')}
                  className="flex items-center gap-1 hover:text-purple-100 transition-colors ml-auto"
                >
                  P&L
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right p-4 text-sm font-semibold text-purple-100/70">
                <button
                  onClick={() => handleSort('allocation')}
                  className="flex items-center gap-1 hover:text-purple-100 transition-colors ml-auto"
                >
                  Allocation
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((holding) => {
              const profitUp = holding.profitLoss >= 0;
              const isExpanded = expandedRow === holding.coinId;

              return (
                <React.Fragment key={holding.coinId}>
                  <tr
                    className="border-b border-purple-600/5 hover:bg-purple-600/5 transition-colors cursor-pointer"
                    onClick={() => setExpandedRow(isExpanded ? null : holding.coinId)}
                  >
                    <td className="p-4">
                      <Link 
                        href={`/coins/${holding.coinId}`}
                        className="flex items-center gap-3 hover:text-purple-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Image
                          src={holding.coinImage}
                          alt={holding.coinName}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-semibold">{holding.coinName}</p>
                          <p className="text-xs text-purple-100/60 uppercase">{holding.coinSymbol}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-semibold">{holding.totalQuantity.toFixed(8)}</p>
                      <p className="text-xs text-purple-100/60 uppercase">{holding.coinSymbol}</p>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatCurrency(holding.averageBuyPrice)}
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold">{formatCurrency(holding.currentValue)}</p>
                      <p className="text-xs text-purple-100/60">
                        Invested: {formatCurrency(holding.totalInvested)}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <p className={cn(
                        "font-bold flex items-center gap-1 justify-end",
                        profitUp ? "text-green-500" : "text-red-500"
                      )}>
                        {profitUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {profitUp && '+'}{formatCurrency(holding.profitLoss)}
                      </p>
                      <p className={cn(
                        "text-xs font-semibold",
                        profitUp ? "text-green-500" : "text-red-500"
                      )}>
                        {profitUp && '+'}{formatPercentage(holding.profitLossPercentage)}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="flex-1 max-w-[100px]">
                          <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${Math.min(holding.allocation, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-semibold text-sm w-12">
                          {holding.allocation.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-dark-400">
                      <td colSpan={7} className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">Transactions ({holding.transactions.length})</h4>
                          {holding.transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 bg-dark-500 rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <span className={cn(
                                  "px-2 py-1 rounded text-xs font-semibold uppercase",
                                  transaction.type === 'buy' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                )}>
                                  {transaction.type}
                                </span>
                                <div>
                                  <p className="text-sm font-semibold">
                                    {transaction.quantity} {transaction.coinSymbol.toUpperCase()} @ {formatCurrency(transaction.pricePerCoin)}
                                  </p>
                                  <p className="text-xs text-purple-100/60">
                                    {new Date(transaction.date).toLocaleDateString()} • Total: {formatCurrency(transaction.totalValue)}
                                  </p>
                                  {transaction.notes && (
                                    <p className="text-xs text-purple-100/50 mt-1">{transaction.notes}</p>
                                  )}
                                </div>
                              </div>
                              {onDeleteTransaction && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this transaction?')) {
                                      onDeleteTransaction(transaction.id);
                                    }
                                  }}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
