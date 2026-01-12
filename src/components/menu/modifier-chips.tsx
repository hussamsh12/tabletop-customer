'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsKioskMode } from '@/hooks';
import { useCatalogTranslation, useTranslation } from '@/stores/translation-store';
import type { ModifierGroup, Modifier } from '@/types';

interface ModifierChipsProps {
  group: ModifierGroup;
  selectedModifierIds: Set<string>;
  onToggle: (modifier: Modifier) => void;
}

export function ModifierChips({
  group,
  selectedModifierIds,
  onToggle,
}: ModifierChipsProps) {
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

      <div className="flex flex-wrap gap-2">
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
                'px-4 py-2 rounded-full border-2 font-medium transition-all touch-target',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/30 hover:border-primary/50',
                isDisabled && 'opacity-50 cursor-not-allowed',
                isKiosk && 'px-6 py-3 text-lg'
              )}
              onClick={() => !isDisabled && onToggle(modifier)}
            >
              {modifierName}
              {modifier.price > 0 && (
                <span className="ms-1 opacity-80">
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
