'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsKioskMode } from '@/hooks';
import { useCatalogTranslation, useTranslation } from '@/stores/translation-store';
import type { ModifierGroup, Modifier } from '@/types';

interface ModifierCardsProps {
  group: ModifierGroup;
  selectedModifierIds: Set<string>;
  onToggle: (modifier: Modifier) => void;
}

export function ModifierCards({
  group,
  selectedModifierIds,
  onToggle,
}: ModifierCardsProps) {
  const isKiosk = useIsKioskMode();
  const { ct } = useCatalogTranslation();
  const { t } = useTranslation();
  const selectedCount = group.modifiers.filter(m => selectedModifierIds.has(m.id)).length;

  const isRequired = group.minSelections > 0;
  const isValid = !isRequired || selectedCount >= group.minSelections;
  const canSelectMore = selectedCount < group.maxSelections;
  const isRadio = group.maxSelections === 1;
  const groupName = ct(group.translations, 'name', group.name);

  let requirementLabel = '';
  if (isRequired) {
    requirementLabel = group.minSelections === group.maxSelections
      ? `${t('item.select', 'Select')} ${group.minSelections}`
      : `${t('item.select', 'Select')} ${group.minSelections}-${group.maxSelections}`;
  } else {
    requirementLabel = group.maxSelections === 1 ? t('item.optional', 'Optional') : `${t('item.up_to', 'Up to')} ${group.maxSelections}`;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className={cn('font-semibold', isKiosk ? 'text-lg' : 'text-base')}>
          {groupName}
        </h4>
        <Badge variant={isValid ? 'secondary' : 'destructive'} className="text-xs">
          {requirementLabel}
        </Badge>
      </div>

      <div className={cn(
        'grid gap-3',
        isKiosk ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'
      )}>
        {group.modifiers.map((modifier) => {
          const isSelected = selectedModifierIds.has(modifier.id);
          const isDisabled = !modifier.isAvailable || (!isRadio && !isSelected && !canSelectMore);
          const modifierName = ct(modifier.translations, 'name', modifier.name);

          return (
            <button
              key={modifier.id}
              type="button"
              disabled={isDisabled}
              className={cn(
                'relative flex flex-col items-center p-3 rounded-xl border-2 transition-all touch-target',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50',
                isDisabled && 'opacity-50 cursor-not-allowed',
                isKiosk && 'p-4'
              )}
              onClick={() => !isDisabled && onToggle(modifier)}
            >
              {/* Placeholder icon - in a real app, modifiers could have imageUrl */}
              <div className={cn(
                'w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2',
                isKiosk && 'w-16 h-16'
              )}>
                <span className="text-xl font-bold text-muted-foreground">
                  {modifierName.charAt(0)}
                </span>
              </div>

              <span className={cn(
                'font-medium text-center',
                isKiosk && 'text-lg'
              )}>
                {modifierName}
              </span>

              {modifier.price > 0 && (
                <span className="text-sm text-muted-foreground">
                  +{formatCurrency(modifier.price)}
                </span>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
