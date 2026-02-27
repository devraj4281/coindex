'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Transaction, Holding, PortfolioSummary } from '@/lib/portfolio/types';
import { getPortfolioData, addTransaction as addTransactionToStorage, deleteTransaction as deleteTransactionFromStorage } from '@/lib/portfolio/storage';
import { calculateHoldings, calculatePortfolioSummary } from '@/lib/portfolio/calculations';

interface UsePortfolioReturn {
    holdings: Holding[];
    summary: PortfolioSummary;
    transactions: Transaction[];
    isLoading: boolean;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    deleteTransaction: (id: string) => void;
    refreshPrices: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentPrices, setCurrentPrices] = useState<Map<string, { price: number; change24h: number }>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    // Load transactions from localStorage
    useEffect(() => {
        const portfolioData = getPortfolioData();
        setTransactions(portfolioData.transactions);
        setIsLoading(false);
    }, []);

    // Fetch current prices for all coins in portfolio
    const refreshPrices = useCallback(async () => {
        if (transactions.length === 0) return;

        const uniqueCoinIds = [...new Set(transactions.map(t => t.coinId))];

        try {
            const pricesMap = new Map<string, { price: number; change24h: number }>();

            // Fetch prices for each coin
            await Promise.all(
                uniqueCoinIds.map(async (coinId) => {
                    try {
                        const response = await fetch(`/api/coingecko/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
                        const data = await response.json();

                        if (data[coinId]) {
                            pricesMap.set(coinId, {
                                price: data[coinId].usd || 0,
                                change24h: data[coinId].usd_24h_change || 0,
                            });
                        }
                    } catch (error) {
                        console.error(`Error fetching price for ${coinId}:`, error);
                    }
                })
            );

            setCurrentPrices(pricesMap);
        } catch (error) {
            console.error('Error refreshing prices:', error);
        }
    }, [transactions]);

    // Refresh prices on mount and when transactions change
    useEffect(() => {
        refreshPrices();

        // Refresh prices every 30 seconds
        const interval = setInterval(refreshPrices, 30000);

        return () => clearInterval(interval);
    }, [refreshPrices]);

    // Calculate holdings from transactions
    const holdings = useMemo(() => {
        return calculateHoldings(transactions, currentPrices);
    }, [transactions, currentPrices]);

    // Calculate portfolio summary
    const summary = useMemo(() => {
        return calculatePortfolioSummary(holdings);
    }, [holdings]);

    // Add a new transaction
    const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
        const newTransaction = addTransactionToStorage(transaction);
        setTransactions(prev => [...prev, newTransaction]);
    }, []);

    // Delete a transaction
    const deleteTransaction = useCallback((id: string) => {
        const success = deleteTransactionFromStorage(id);
        if (success) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    }, []);

    return {
        holdings,
        summary,
        transactions,
        isLoading,
        addTransaction,
        deleteTransaction,
        refreshPrices,
    };
}
