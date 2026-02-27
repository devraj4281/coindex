import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json(
            { error: 'Missing required parameter: query' },
            { status: 400 }
        );
    }

    try {
        const headers: HeadersInit = {
            'Accept': 'application/json',
        };

        if (API_KEY) {
            headers['x-cg-demo-api-key'] = API_KEY;
        }

        const response = await fetch(
            `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`,
            { headers, next: { revalidate: 300 } }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error searching coins:', error);
        return NextResponse.json(
            { error: 'Failed to search coins' },
            { status: 500 }
        );
    }
}
