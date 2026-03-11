import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids');
    const vsCurrencies = searchParams.get('vs_currencies') || 'usd';
    const include24hrChange = searchParams.get('include_24hr_change') === 'true';

    if (!ids) {
        return NextResponse.json(
            { error: 'Missing required parameter: ids' },
            { status: 400 }
        );
    }

    try {
        const params = new URLSearchParams({
            ids,
            vs_currencies: vsCurrencies,
            ...(include24hrChange && { include_24hr_change: 'true' }),
        });

        const headers: HeadersInit = {
            'Accept': 'application/json',
        };

        if (API_KEY) {
            headers['x-cg-demo-api-key'] = API_KEY;
        }

        const response = await fetch(
            `${COINGECKO_BASE_URL}/simple/price?${params}`,
            { headers, next: { revalidate: 30 } }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=5',
          },
        });
    } catch (error) {
        console.error('Error fetching simple price:', error);
        return NextResponse.json(
            { error: 'Failed to fetch price data' },
            { status: 500 }
        );
    }
}
