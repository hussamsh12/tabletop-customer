'use client';

import { cn } from '@/lib/utils';
import { ItemCard } from './item-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsKioskMode } from '@/hooks';
import type { MenuItemBrief } from '@/types';

interface ItemGridProps {
  items: MenuItemBrief[];
  onSelectItem: (item: MenuItemBrief) => void;
  isLoading?: boolean;
}

export function ItemGrid({ items, onSelectItem, isLoading }: ItemGridProps) {
  const isKiosk = useIsKioskMode();

  if (isLoading) {
    return (
      <div className={cn(
        'grid gap-4',
        isKiosk
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3'
      )}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No items in this category</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid gap-4',
      isKiosk
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3'
    )}>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onSelect={onSelectItem}
        />
      ))}
    </div>
  );
}

function ItemCardSkeleton() {
  const isKiosk = useIsKioskMode();

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className={cn(
        'w-full',
        isKiosk ? 'aspect-[4/3]' : 'aspect-square'
      )} />
      <div className={cn('p-3 space-y-2', isKiosk && 'p-4')}>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}
