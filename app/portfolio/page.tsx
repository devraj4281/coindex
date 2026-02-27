'use client';

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { usePortfolio } from '@/components/hooks/usePortfolio';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import PortfolioHoldings from '@/components/portfolio/PortfolioHoldings';
import AddTransactionModal from '@/components/portfolio/AddTransactionModal';

export default function PortfolioPage() {
  const { holdings, summary, isLoading, addTransaction, deleteTransaction, refreshPrices } = usePortfolio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPrices();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <main className="py-4 md:py-6 mx-auto px-4 sm:px-6 max-w-360 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Portfolio</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dark-500 rounded-xl p-5 border border-purple-600/20 animate-pulse">
              <div className="h-4 bg-dark-400 rounded w-20 mb-4"></div>
              <div className="h-8 bg-dark-400 rounded w-32 mb-2"></div>
              <div className="h-3 bg-dark-400 rounded w-24"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="py-4 md:py-6 mx-auto px-4 sm:px-6 max-w-360 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-sm text-purple-100/60 mt-1">
            Track your crypto investments and performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 bg-dark-500 hover:bg-purple-600/20 border border-purple-600/20 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh prices"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

     
      <PortfolioOverview summary={summary} />

     
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Holdings</h2>
        </div>
        <PortfolioHoldings holdings={holdings} onDeleteTransaction={deleteTransaction} />
      </div>

      
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(transaction) => {
          addTransaction(transaction);
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}
