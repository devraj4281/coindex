'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useInteractions,
  useClick,
  FloatingPortal,
} from '@floating-ui/react';
import { ArrowUpDown, ChevronDown, Check, Zap } from 'lucide-react';

interface CurrencyConverterProps {
  basePrice:     number;
  baseCurrency?: string;
  coinSymbol?:   string;
  coinIcon?:     string;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',         symbol: '$',   flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',              symbol: '€',   flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',     symbol: '£',   flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen',      symbol: '¥',   flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$',  flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar',   symbol: 'C$',  flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc',       symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan',      symbol: '¥',   flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee',      symbol: '₹',   flag: '🇮🇳' },
  { code: 'KRW', name: 'South Korean Won',  symbol: '₩',   flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar',  symbol: 'S$',  flag: '🇸🇬' },
  { code: 'BRL', name: 'Brazilian Real',    symbol: 'R$',  flag: '🇧🇷' },
] as const;

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,      EUR: 0.92,   GBP: 0.79,   JPY: 149.5,
  AUD: 1.53,   CAD: 1.36,   CHF: 0.88,   CNY: 7.24,
  INR: 83.12,  KRW: 1337.5, SGD: 1.34,   BRL: 4.97,
};

const decimalsFor = (code: string) => (['JPY', 'KRW'].includes(code) ? 0 : 2);

const toFiat = (crypto: number, basePrice: number, rate: number, code: string) =>
  (crypto * basePrice * rate).toFixed(decimalsFor(code));

const CurrencyConverter = ({
  basePrice,
  baseCurrency = 'USD',
  coinSymbol   = 'BTC',
}: CurrencyConverterProps) => {

  const [cryptoAmount,     setCryptoAmount]     = useState<string>('1');
  const [fiatAmount,       setFiatAmount]       = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isOpen,           setIsOpen]           = useState(false);
  const [activeField,      setActiveField]      = useState<'crypto' | 'fiat'>('crypto');

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click   = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  useEffect(() => {
    const rate = EXCHANGE_RATES[selectedCurrency] ?? 1;
    const num  = parseFloat(cryptoAmount) || 0;
    setFiatAmount(toFiat(num, basePrice, rate, selectedCurrency));
  }, [basePrice, selectedCurrency]);

  const rate        = EXCHANGE_RATES[selectedCurrency] ?? 1;
  const selectedObj = CURRENCIES.find(c => c.code === selectedCurrency);

  const handleCryptoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setCryptoAmount(val);
      setActiveField('crypto');
      setFiatAmount(toFiat(parseFloat(val) || 0, basePrice, rate, selectedCurrency));
    },
    [basePrice, rate, selectedCurrency],
  );

  const handleFiatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFiatAmount(val);
      setActiveField('fiat');
      const num       = parseFloat(val) || 0;
      const cryptoVal = basePrice * rate > 0 ? num / (basePrice * rate) : 0;
      setCryptoAmount(cryptoVal.toFixed(8).replace(/\.?0+$/, '') || '0');
    },
    [basePrice, rate],
  );

  const handleCurrencySelect = useCallback(
    (code: string) => {
      const newRate = EXCHANGE_RATES[code] ?? 1;
      const num     = parseFloat(cryptoAmount) || 0;
      setSelectedCurrency(code);
      setFiatAmount(toFiat(num, basePrice, newRate, code));
      setIsOpen(false);
    },
    [cryptoAmount, basePrice],
  );

  const rateDisplay = useMemo(() => {
    const d = decimalsFor(selectedCurrency);
    return `1 ${coinSymbol} = ${selectedObj?.symbol}${(basePrice * rate).toLocaleString('en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    })}`;
  }, [basePrice, rate, selectedCurrency, coinSymbol, selectedObj]);

  return (
    <div id="currency-converter" className="w-full">

      <div className="conv-rate-badge">
        <Zap className="w-3 h-3 text-green-400" />
        <span>{rateDisplay}</span>
      </div>

      <div className="conv-panel">

        <div className="conv-field">
          <div className="conv-field-label">You Pay</div>
          <div className={`conv-field-box ${activeField === 'crypto' ? 'is-active' : ''}`}>
            <div className="conv-field-left">
              <input
                type="number"
                value={cryptoAmount}
                onChange={handleCryptoChange}
                onFocus={() => setActiveField('crypto')}
                className="conv-input"
                placeholder="0"
                min="0"
              />
              <div className="conv-equiv">
                ≈ {selectedObj?.symbol}
                {(parseFloat(cryptoAmount) * basePrice * rate || 0).toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="conv-token-badge">
              <span className="conv-token-icon">₿</span>
              <span className="conv-token-name">{coinSymbol}</span>
            </div>
          </div>
        </div>

        <div className="conv-swap-row">
          <div className="conv-swap-line" />
          <button type="button" className="conv-swap-btn" aria-label="Swap currencies">
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <div className="conv-swap-line" />
        </div>

        <div className="conv-field">
          <div className="conv-field-label">You Receive</div>
          <div className={`conv-field-box ${activeField === 'fiat' ? 'is-active' : ''}`}>
            <div className="conv-field-left">
              <input
                type="number"
                value={fiatAmount}
                onChange={handleFiatChange}
                onFocus={() => setActiveField('fiat')}
                className="conv-input"
                placeholder="0"
                min="0"
              />
              <div className="conv-equiv">
                ≈ {(parseFloat(fiatAmount) / (basePrice * rate) || 0).toFixed(6)} {coinSymbol}
              </div>
            </div>

            <button
              ref={refs.setReference}
              type="button"
              className="conv-currency-btn"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              {...getReferenceProps()}
            >
              <span className="text-base leading-none">{selectedObj?.flag}</span>
              <span className="conv-currency-code">{selectedCurrency}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex:          9999,
              width:           '260px',
              display:         'flex',
              flexDirection:   'column',
              maxHeight:       '320px',
              overflowY:       'auto',
              background:      '#1e2833',
              border:          '1px solid rgba(107,70,193,0.3)',
              borderRadius:    '12px',
              boxShadow:       '0 25px 50px rgba(0,0,0,0.8)',
              animation:       'dropIn 0.15s ease',
            }}
            role="listbox"
            aria-label="Select currency"
            {...getFloatingProps()}
          >
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                role="option"
                aria-selected={selectedCurrency === c.code}
                onClick={() => handleCurrencySelect(c.code)}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  width:        '100%',
                  flexShrink:   0,
                  padding:      '10px 16px',
                  textAlign:    'left',
                  fontSize:     '14px',
                  borderBottom: '1px solid rgba(107,70,193,0.1)',
                  background:   selectedCurrency === c.code ? 'rgba(15,19,22,0.5)' : 'transparent',
                  color:        selectedCurrency === c.code ? '#2ebe7b' : 'inherit',
                  cursor:       'pointer',
                  transition:   'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (selectedCurrency !== c.code)
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,19,22,0.35)';
                }}
                onMouseLeave={e => {
                  if (selectedCurrency !== c.code)
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '16px', marginRight: '8px' }}>{c.flag}</span>
                <span style={{ fontWeight: 600 }}>{c.symbol}</span>
                <span style={{ marginLeft: '6px', fontWeight: 500 }}>{c.code}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.6, maxWidth: '96px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </span>
                {selectedCurrency === c.code && (
                  <Check style={{ width: '14px', height: '14px', marginLeft: '8px', color: '#2ebe7b', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </FloatingPortal>
      )}

    </div>
  );
};

export default CurrencyConverter;
