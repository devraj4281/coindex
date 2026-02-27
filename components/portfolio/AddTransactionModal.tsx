'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/portfolio/types';

interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<SearchCoin | null>(null);

  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [pricePerCoin, setPricePerCoin] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchCoins = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/coingecko/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.coins?.slice(0, 10) || []);
      } catch (error) {
        console.error('Error searching coins:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchCoins, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const totalValue = (parseFloat(quantity) || 0) * (parseFloat(pricePerCoin) || 0);

  const handleSelectCoin = (coin: SearchCoin) => {
    setSelectedCoin(coin);
    setStep('details');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCoin || !quantity || !pricePerCoin) return;

    const transaction: Omit<Transaction, 'id' | 'createdAt'> = {
      coinId: selectedCoin.id,
      coinSymbol: selectedCoin.symbol,
      coinName: selectedCoin.name,
      coinImage: selectedCoin.thumb,
      type,
      quantity: parseFloat(quantity),
      pricePerCoin: parseFloat(pricePerCoin),
      totalValue,
      date,
      notes: notes.trim() || undefined,
    };

    onAdd(transaction);
    handleClose();
  };

  const handleClose = () => {
    setStep('search');
    setSelectedCoin(null);
    setSearchQuery('');
    setSearchResults([]);
    setType('buy');
    setQuantity('');
    setPricePerCoin('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-dark-500 rounded-2xl border border-purple-600/20 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-purple-600/10">
          <h2 className="text-2xl font-bold">Add Transaction</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-purple-600/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'search' ? (
            <div>
              <label className="block text-sm font-semibold mb-2">Select Coin</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-100/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a coin..."
                  className="w-full bg-dark-400 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                  autoFocus
                />
              </div>

              {isSearching && (
                <div className="mt-4 text-center text-purple-100/60">
                  Searching...
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleSelectCoin(coin)}
                      className="w-full flex items-center gap-3 p-3 bg-dark-400 hover:bg-purple-600/20 rounded-lg transition-colors"
                    >
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="text-left">
                        <p className="font-semibold">{coin.name}</p>
                        <p className="text-xs text-purple-100/60 uppercase">{coin.symbol}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="mt-4 text-center text-purple-100/60">
                  No coins found
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-dark-400 rounded-lg">
                <Image
                  src={selectedCoin!.thumb}
                  alt={selectedCoin!.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{selectedCoin!.name}</p>
                  <p className="text-xs text-purple-100/60 uppercase">{selectedCoin!.symbol}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="ml-auto text-sm text-purple-600 hover:text-purple-500"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType('buy')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg font-semibold transition-all",
                      type === 'buy'
                        ? "bg-green-500/20 text-green-500 ring-2 ring-green-500"
                        : "bg-dark-400 text-purple-100/60 hover:bg-purple-600/20"
                    )}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('sell')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg font-semibold transition-all",
                      type === 'sell'
                        ? "bg-red-500/20 text-red-500 ring-2 ring-red-500"
                        : "bg-dark-400 text-purple-100/60 hover:bg-purple-600/20"
                    )}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  step="any"
                  required
                  className="w-full bg-dark-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Price per Coin (USD)</label>
                <input
                  type="number"
                  value={pricePerCoin}
                  onChange={(e) => setPricePerCoin(e.target.value)}
                  placeholder="0.00"
                  step="any"
                  required
                  className="w-full bg-dark-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-dark-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full bg-dark-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none"
                />
              </div>

              <div className="p-4 bg-purple-600/10 rounded-lg border border-purple-600/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-100/60">Total Value</span>
                  <span className="text-2xl font-bold">${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {step === 'details' && (
          <div className="flex gap-3 p-6 border-t border-purple-600/10">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 bg-dark-400 hover:bg-purple-600/20 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!quantity || !pricePerCoin}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
