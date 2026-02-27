import type { PortfolioData, Transaction } from './types';

const STORAGE_KEY = 'coindex_portfolio';


export function getPortfolioData(): PortfolioData {
    if (typeof window === 'undefined') {
        return { transactions: [], lastUpdated: new Date().toISOString() };
    }

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return { transactions: [], lastUpdated: new Date().toISOString() };
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading portfolio data:', error);
        return { transactions: [], lastUpdated: new Date().toISOString() };
    }
}


export function savePortfolioData(data: PortfolioData): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const dataToSave = {
            ...data,
            lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        return true;
    } catch (error) {
        console.error('Error saving portfolio data:', error);
        return false;
    }
}


export function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const portfolioData = getPortfolioData();

    const newTransaction: Transaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };

    portfolioData.transactions.push(newTransaction);
    savePortfolioData(portfolioData);

    return newTransaction;
}


export function updateTransaction(id: string, updates: Partial<Transaction>): boolean {
    const portfolioData = getPortfolioData();
    const index = portfolioData.transactions.findIndex(t => t.id === id);

    if (index === -1) return false;

    portfolioData.transactions[index] = {
        ...portfolioData.transactions[index],
        ...updates,
    };

    return savePortfolioData(portfolioData);
}


export function deleteTransaction(id: string): boolean {
    const portfolioData = getPortfolioData();
    const filteredTransactions = portfolioData.transactions.filter(t => t.id !== id);

    if (filteredTransactions.length === portfolioData.transactions.length) {
        return false;
    }

    portfolioData.transactions = filteredTransactions;
    return savePortfolioData(portfolioData);
}


export function getTransactionsByCoin(coinId: string): Transaction[] {
    const portfolioData = getPortfolioData();
    return portfolioData.transactions.filter(t => t.coinId === coinId);
}


export function clearPortfolioData(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing portfolio data:', error);
        return false;
    }
}


export function exportPortfolioData(): string {
    const portfolioData = getPortfolioData();
    return JSON.stringify(portfolioData, null, 2);
}


export function importPortfolioData(jsonData: string): boolean {
    try {
        const data = JSON.parse(jsonData) as PortfolioData;

       
        if (!Array.isArray(data.transactions)) {
            throw new Error('Invalid data format');
        }

        return savePortfolioData(data);
    } catch (error) {
        console.error('Error importing portfolio data:', error);
        return false;
    }
}
