import type { Transaction, Holding, PortfolioSummary } from './types';

export function calculateAverageBuyPrice(transactions: Transaction[]): number {
    const buyTransactions = transactions.filter(t => t.type === 'buy');

    if (buyTransactions.length === 0) return 0;

    const totalCost = buyTransactions.reduce((sum, t) => sum + t.totalValue, 0);
    const totalQuantity = buyTransactions.reduce((sum, t) => sum + t.quantity, 0);

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
}

export function calculateTotalQuantity(transactions: Transaction[]): number {
    return transactions.reduce((total, t) => {
        return t.type === 'buy' ? total + t.quantity : total - t.quantity;
    }, 0);
}

export function calculateTotalInvested(transactions: Transaction[]): number {
    return transactions.reduce((total, t) => {
        return t.type === 'buy' ? total + t.totalValue : total - t.totalValue;
    }, 0);
}

export function calculateProfitLoss(
    currentValue: number,
    totalInvested: number
): { profitLoss: number; profitLossPercentage: number } {
    const profitLoss = currentValue - totalInvested;
    const profitLossPercentage = totalInvested > 0
        ? (profitLoss / totalInvested) * 100
        : 0;

    return { profitLoss, profitLossPercentage };
}

export function calculate24hChange(
    currentPrice: number,
    price24hAgo: number,
    quantity: number
): { change24h: number; change24hPercentage: number } {
    const currentValue = currentPrice * quantity;
    const value24hAgo = price24hAgo * quantity;
    const change24h = currentValue - value24hAgo;
    const change24hPercentage = value24hAgo > 0
        ? (change24h / value24hAgo) * 100
        : 0;

    return { change24h, change24hPercentage };
}

export function calculateHoldings(
    transactions: Transaction[],
    currentPrices: Map<string, { price: number; change24h: number }>
): Holding[] {
    const transactionsByCoin = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.coinId]) {
            acc[transaction.coinId] = [];
        }
        acc[transaction.coinId].push(transaction);
        return acc;
    }, {} as Record<string, Transaction[]>);

    const holdings: Holding[] = [];

    for (const [coinId, coinTransactions] of Object.entries(transactionsByCoin)) {
        const totalQuantity = calculateTotalQuantity(coinTransactions);

        if (totalQuantity <= 0) continue;

        const averageBuyPrice = calculateAverageBuyPrice(coinTransactions);
        const totalInvested = calculateTotalInvested(coinTransactions);

        const priceData = currentPrices.get(coinId);
        const currentPrice = priceData?.price ?? 0;
        const price24hAgo = currentPrice / (1 + (priceData?.change24h ?? 0) / 100);

        const currentValue = currentPrice * totalQuantity;
        const { profitLoss, profitLossPercentage } = calculateProfitLoss(currentValue, totalInvested);
        const { change24h, change24hPercentage } = calculate24hChange(currentPrice, price24hAgo, totalQuantity);

        const firstTransaction = coinTransactions[0];

        holdings.push({
            coinId,
            coinSymbol: firstTransaction.coinSymbol,
            coinName: firstTransaction.coinName,
            coinImage: firstTransaction.coinImage,
            totalQuantity,
            averageBuyPrice,
            totalInvested,
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercentage,
            change24h,
            change24hPercentage,
            allocation: 0,
            transactions: coinTransactions.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
        });
    }

    return holdings;
}

export function calculatePortfolioSummary(holdings: Holding[]): PortfolioSummary {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
    const totalProfitLoss = totalValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0
        ? (totalProfitLoss / totalInvested) * 100
        : 0;

    const change24h = holdings.reduce((sum, h) => sum + h.change24h, 0);
    const value24hAgo = totalValue - change24h;
    const change24hPercentage = value24hAgo > 0
        ? (change24h / value24hAgo) * 100
        : 0;

    holdings.forEach(holding => {
        holding.allocation = totalValue > 0
            ? (holding.currentValue / totalValue) * 100
            : 0;
    });

    const sortedByPerformance = [...holdings].sort(
        (a, b) => b.profitLossPercentage - a.profitLossPercentage
    );

    const transactionsCount = holdings.reduce(
        (sum, h) => sum + h.transactions.length,
        0
    );

    return {
        totalValue,
        totalInvested,
        totalProfitLoss,
        totalProfitLossPercentage,
        change24h,
        change24hPercentage,
        holdingsCount: holdings.length,
        transactionsCount,
        bestPerformer: sortedByPerformance[0] ?? null,
        worstPerformer: sortedByPerformance[sortedByPerformance.length - 1] ?? null,
        lastUpdated: new Date().toISOString(),
    };
}

export function sortHoldings(
    holdings: Holding[],
    field: 'name' | 'value' | 'profitLoss' | 'profitLossPercentage' | 'allocation',
    direction: 'asc' | 'desc'
): Holding[] {
    const sorted = [...holdings].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (field) {
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
            case 'profitLossPercentage':
                aValue = a.profitLossPercentage;
                bValue = b.profitLossPercentage;
                break;
            case 'allocation':
                aValue = a.allocation;
                bValue = b.allocation;
                break;
            default:
                return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return direction === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
    });

    return sorted;
}
