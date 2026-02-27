'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SearchInput from './SearchInput';

const Header = () => {
  const pathname = usePathname();

  return (
    <header>
      <div className="main-container inner">
        <Link href="/">
          <Image  src="/logo.png"
      alt="CoinDex logo"
      width={160}
      height={48}
      priority />
        </Link>

        <nav>
          <Link
            href="/"
            className={cn('nav-link', {
              'is-active': pathname === '/',
              'is-home': true,
            })}
          >
            Home
          </Link>

          <Link
            href="/portfolio"
            className={cn('nav-link', {
              'is-active': pathname === '/portfolio',
            })}
          >
            Portfolio
          </Link>

          <nav>
  <SearchInput />
</nav>

          <Link
            href="/coins"
            className={cn('nav-link', {
              'is-active': pathname === '/coins',
            })}
          >
            All Coins
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;