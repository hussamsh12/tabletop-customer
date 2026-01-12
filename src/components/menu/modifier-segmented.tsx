'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsKioskMode } from '@/hooks';
import { useCatalogTranslation, useTranslation } from '@/stores/translation-store';
import type { ModifierGroup, Modifier } from '@/types';

interface ModifierSegmentedProps {
  group: ModifierGroup;
  selectedModifierIds: Set<string>;
  onToggle: (modifier: Modifier) => void;
}

export function ModifierSegmented({
  group,
  selectedModifierIds,
  onToggle,
}: ModifierSegmentedProps) {
  const isKiosk = useIsKioskMode();
  const { ct } = useCatalogTranslation();
  const { t } = useTranslation();
  const selectedCount = group.modifiers.filter(m => selectedModifierIds.has(m.id)).length;

  const isRequired = group.minSelections > 0;
  const isValid = !isRequired || selectedCount >= group.minSelections;
  const groupName = ct(group.translations, 'name', group.name);

  let requirementLabel = '';
  if (isRequired) {
    requirementLabel = group.minSelections === group.maxSelections
      ? `${t('item.select', 'Select')} ${group.minSelections}`
      : `${t('item.select', 'Select')} ${group.minSelections}-${group.maxSelections}`;
  } else {
    requirementLabel = t('item.optional', 'Optional');
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

      <div className="inline-flex rounded-lg border border-input bg-muted p-1">
        {group.modifiers.map((modifier) => {
          const isSelected = selectedModifierIds.has(modifier.id);
          const isDisabled = !modifier.isAvailable;
          const modifierName = ct(modifier.translations, 'name', modifier.name);

          return (
            <button
              key={modifier.id}
              type="button"
              disabled={isDisabled}
              className={cn(
                'px-4 py-2 font-medium transition-all touch-target whitespace-nowrap',
                'first:rounded-s-md last:rounded-e-md',
                isSelected
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
                isDisabled && 'opacity-50 cursor-not-allowed',
                isKiosk && 'px-6 py-3 text-lg'
              )}
              onClick={() => !isDisabled && onToggle(modifier)}
            >
              {modifierName}
              {modifier.price > 0 && (
                <span className="ms-1 text-xs opacity-70">
                  +{formatCurrency(modifier.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
