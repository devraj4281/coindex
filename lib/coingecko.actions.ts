'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;

if (!BASE_URL) throw new Error('Could not get base url');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  

  const response = await fetch(url, {
   
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      `API Error: ${response.status}: ${JSON.stringify(errorBody)}`,
    );
  }

  return response.json();
}
