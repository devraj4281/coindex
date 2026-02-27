import { NextResponse } from 'next/server';
import { fetcher } from '@/lib/coingecko.actions';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const data = await fetcher<{ coins: any[] }>('search', {
      query,
    });

    return NextResponse.json(data.coins.slice(0, 10));
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
