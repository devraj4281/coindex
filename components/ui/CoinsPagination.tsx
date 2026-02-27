'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

import { useRouter } from 'next/navigation';
import { buildPageNumbers, cn, ELLIPSIS } from '@/lib/utils';

interface CoinsPaginationProps {
  currentPage: number;
  hasMorePages: boolean;
}

export default function CoinsPagination({
  currentPage,
  hasMorePages,
}: CoinsPaginationProps) {
  const router = useRouter();

  const totalPages = Math.max(currentPage + (hasMorePages ? 1 : 0), 1);
  const pages = buildPageNumbers(currentPage, totalPages);

  const goToPage = (page: number) => {
    router.push(`/coins?page=${page}`);
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>

        
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>

        
        {pages.map((page, i) => (
          <PaginationItem key={i}>
            {page === ELLIPSIS ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => goToPage(page)}
                className={cn({
                  '#76DA44': page === currentPage,
                })}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

    
        <PaginationItem>
          <PaginationNext
            onClick={() => hasMorePages && goToPage(currentPage + 1)}
            aria-disabled={!hasMorePages}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}
