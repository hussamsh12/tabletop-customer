'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useIsKioskMode } from '@/hooks';
import { useCatalogTranslation, useTranslation } from '@/stores/translation-store';
import type { ItemVariant } from '@/types';

interface VariantChipsProps {
  variants: ItemVariant[];
  selectedVariantId: string | null;
  onSelect: (variant: ItemVariant) => void;
  basePrice: number;
}

export function VariantChips({
  variants,
  selectedVariantId,
  onSelect,
  basePrice,
}: VariantChipsProps) {
  const isKiosk = useIsKioskMode();
  const { ct } = useCatalogTranslation();
  const { t } = useTranslation();

  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className={cn('font-semibold', isKiosk ? 'text-lg' : 'text-base')}>
          {t('item.size', 'Size')}
        </h4>
        <span className="text-sm text-muted-foreground">{t('item.required', 'Required')}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const variantName = ct(variant.translations, 'name', variant.name);

          return (
            <button
              key={variant.id}
              type="button"
              disabled={!variant.isAvailable}
              className={cn(
                'px-4 py-2 rounded-full border-2 font-medium transition-all touch-target',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/30 hover:border-primary/50',
                !variant.isAvailable && 'opacity-50 cursor-not-allowed',
                isKiosk && 'px-6 py-3 text-lg'
              )}
              onClick={() => variant.isAvailable && onSelect(variant)}
            >
              {variantName}
              {variant.priceAdjustment !== 0 && (
                <span className="ms-1 opacity-80 text-sm">
                  {variant.priceAdjustment > 0 ? '+' : ''}{formatCurrency(variant.priceAdjustment)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
