'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useIsKioskMode } from '@/hooks';
import type { ItemVariant } from '@/types';

interface VariantSelectorProps {
  variants: ItemVariant[];
  selectedVariantId: string | null;
  onSelect: (variant: ItemVariant) => void;
  basePrice: number;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  basePrice,
}: VariantSelectorProps) {
  const isKiosk = useIsKioskMode();

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className={cn(
          'font-semibold',
          isKiosk ? 'text-lg' : 'text-base'
        )}>
          Size
        </h4>
        <span className="text-sm text-muted-foreground">Required</span>
      </div>

      <div className="grid gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const totalPrice = basePrice + variant.priceAdjustment;
          const priceLabel = variant.priceAdjustment > 0
            ? `+${formatCurrency(variant.priceAdjustment)}`
            : variant.priceAdjustment < 0
              ? formatCurrency(variant.priceAdjustment)
              : '';

          return (
            <button
              key={variant.id}
              type="button"
              disabled={!variant.isAvailable}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all touch-target',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-input hover:border-primary/50',
                !variant.isAvailable && 'opacity-50 cursor-not-allowed',
                isKiosk && 'p-4'
              )}
              onClick={() => variant.isAvailable && onSelect(variant)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                )}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className={cn(
                  'font-medium',
                  isKiosk && 'text-lg'
                )}>
                  {variant.name}
                </span>
                {!variant.isAvailable && (
                  <span className="text-xs text-muted-foreground">(Unavailable)</span>
                )}
              </div>

              <div className="text-right">
                <span className={cn(
                  'font-semibold',
                  isKiosk && 'text-lg'
                )}>
                  {formatCurrency(totalPrice)}
                </span>
                {priceLabel && (
                  <span className="block text-xs text-muted-foreground">
                    {priceLabel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
