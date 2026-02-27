// Portfolio TypeScript Types and Interfaces

export interface Transaction {
    id: string;
    coinId: string;
    coinSymbol: string;
    coinName: string;
    coinImage: string;
    type: 'buy' | 'sell';
    quantity: number;
    pricePerCoin: number;
    totalValue: number;
    date: string;
    notes?: string;
    createdAt: string;
}

export interface Holding {
    coinId: string;
    coinSymbol: string;
    coinName: string;
    coinImage: string;
    totalQuantity: number;
    averageBuyPrice: number;
    totalInvested: number;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercentage: number;
    change24h: number;
    change24hPercentage: number;
    allocation: number; // Percentage of total portfolio
    transactions: Transaction[];
}

export interface PortfolioSummary {
    totalValue: number;
    totalInvested: number;
    totalProfitLoss: number;
    totalProfitLossPercentage: number;
    change24h: number;
    change24hPercentage: number;
    holdingsCount: number;
    transactionsCount: number;
    bestPerformer: Holding | null;
    worstPerformer: Holding | null;
    lastUpdated: string;
}

export interface PortfolioData {
    transactions: Transaction[];
    lastUpdated: string;
}

export type SortField = 'name' | 'value' | 'profitLoss' | 'profitLossPercentage' | 'allocation';
export type SortDirection = 'asc' | 'desc';
