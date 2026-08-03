import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = { page: number; totalPages: number; total?: number; onPageChange: (page: number) => void };
export default function Pagination({ page, totalPages, onPageChange, total }: PaginationProps) {
  if (totalPages <= 1) return total ? <p className="text-xs text-muted">{total} items</p> : null;
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted">{total != null ? `${total} items · ` : ''}Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
