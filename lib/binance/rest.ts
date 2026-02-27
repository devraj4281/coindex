export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  limit = 500,
) {
  const res = await fetch(
    `/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error('Failed to fetch Binance klines');
  }

  return res.json();
}
