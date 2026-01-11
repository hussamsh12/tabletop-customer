'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsKioskMode } from '@/hooks';
import type { MenuItemBrief } from '@/types';

interface ItemCardProps {
  item: MenuItemBrief;
  onSelect: (item: MenuItemBrief) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  const isKiosk = useIsKioskMode();
  const hasVariants = item.variantCount > 0;
  const hasModifiers = item.modifierGroupCount > 0;
  const needsCustomization = hasVariants || hasModifiers;

  // Calculate price display
  const priceDisplay = hasVariants
    ? `From ${formatCurrency(item.basePrice)}`
    : formatCurrency(item.basePrice);

  return (
    <Card
      role="button"
      tabIndex={item.isAvailable ? 0 : -1}
      aria-label={`${item.name}, ${priceDisplay}${!item.isAvailable ? ', unavailable' : ''}`}
      aria-disabled={!item.isAvailable}
      className={cn(
        'group cursor-pointer overflow-hidden transition-all hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        !item.isAvailable && 'opacity-60'
      )}
      onClick={() => item.isAvailable && onSelect(item)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && item.isAvailable) {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      {/* Image */}
      <div className={cn(
        'relative overflow-hidden bg-muted',
        isKiosk ? 'aspect-[4/3]' : 'aspect-square'
      )}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-muted-foreground/30">
              {item.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary">Unavailable</Badge>
          </div>
        )}

        {/* Quick add button (only for items without customization) */}
        {item.isAvailable && !needsCustomization && (
          <Button
            size="icon"
            aria-label={`Add ${item.name} to cart`}
            className={cn(
              'absolute bottom-2 right-2 rounded-full shadow-lg',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isKiosk && 'opacity-100' // Always visible on kiosk
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <CardContent className={cn('p-3', isKiosk && 'p-4')}>
        <h3 className={cn(
          'font-semibold line-clamp-2',
          isKiosk ? 'text-lg' : 'text-base'
        )}>
          {item.name}
        </h3>

        {item.description && (
          <p className={cn(
            'text-muted-foreground line-clamp-2 mt-1',
            isKiosk ? 'text-sm' : 'text-xs'
          )}>
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className={cn(
            'font-semibold text-primary',
            isKiosk ? 'text-lg' : 'text-base'
          )}>
            {priceDisplay}
          </span>

          {needsCustomization && item.isAvailable && (
            <Badge variant="outline" className="text-xs">
              Customize
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
