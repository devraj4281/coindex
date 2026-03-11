/**
 * A single normalised OHLC candle returned by any exchange adapter.
 * `time` is always Unix seconds (compatible with lightweight-charts UTCTimestamp).
 */
export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

/**
 * A live candle update pushed from a WebSocket stream.
 */
export interface LiveCandleUpdate {
    openTime: number; // Unix seconds
    open: number;
    high: number;
    low: number;
    close: number;
}

/**
 * Server-side REST adapter — fetches historical OHLC data.
 * Only implement this interface in server-safe code (no browser APIs).
 */
export interface ExchangeRestAdapter {
    /** Human-readable exchange name, used in logs and error messages. */
    readonly name: string;

    /**
     * Fetch historical candles.
     * @param symbol   Exchange trading pair, e.g. "BTCUSDT"
     * @param interval Standardised interval string, e.g. "1m" | "1h" | "1d"
     * @param limit    Max number of candles to return
     */
    fetchKlines(symbol: string, interval: string, limit: number): Promise<Candle[]>;
}

/**
 * Client-side WebSocket adapter — streams live candle updates.
 * Only instantiate in browser environments.
 */
export interface ExchangeWsAdapter {
    /**
     * Open a live candlestick stream.
     * @returns A `disconnect` function — call it to close the WebSocket.
     */
    connectLive(
        symbol: string,
        interval: string,
        onUpdate: (candle: LiveCandleUpdate) => void,
    ): () => void;
}
