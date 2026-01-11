'use client';

import { Check, Square, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsKioskMode } from '@/hooks';
import type { ModifierGroup, Modifier } from '@/types';

interface ModifierGroupSelectorProps {
  group: ModifierGroup;
  selectedModifierIds: Set<string>;
  onToggle: (modifier: Modifier) => void;
}

export function ModifierGroupSelector({
  group,
  selectedModifierIds,
  onToggle,
}: ModifierGroupSelectorProps) {
  const isKiosk = useIsKioskMode();
  const selectedCount = group.modifiers.filter(m => selectedModifierIds.has(m.id)).length;

  // Derive isRequired from minSelections
  const isRequired = group.minSelections > 0;

  // Build requirement label
  let requirementLabel = '';
  if (isRequired) {
    if (group.minSelections === group.maxSelections) {
      requirementLabel = `Select ${group.minSelections}`;
    } else {
      requirementLabel = `Select ${group.minSelections}-${group.maxSelections}`;
    }
  } else {
    if (group.maxSelections === 1) {
      requirementLabel = 'Optional';
    } else {
      requirementLabel = `Select up to ${group.maxSelections}`;
    }
  }

  // Check if selection is valid
  const isValid = !isRequired || selectedCount >= group.minSelections;
  const canSelectMore = selectedCount < group.maxSelections;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className={cn(
          'font-semibold',
          isKiosk ? 'text-lg' : 'text-base'
        )}>
          {group.name}
        </h4>
        <Badge variant={isValid ? 'secondary' : 'destructive'} className="text-xs">
          {requirementLabel}
        </Badge>
      </div>

      <div className="grid gap-2">
        {group.modifiers.map((modifier) => {
          const isSelected = selectedModifierIds.has(modifier.id);
          const isDisabled = !modifier.isAvailable || (!isSelected && !canSelectMore);
          const isRadio = group.maxSelections === 1;

          return (
            <button
              key={modifier.id}
              type="button"
              disabled={isDisabled}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all touch-target',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50',
                isDisabled && 'opacity-50 cursor-not-allowed',
                isKiosk && 'p-4'
              )}
              onClick={() => !isDisabled && onToggle(modifier)}
            >
              <div className="flex items-center gap-3">
                {isRadio ? (
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                ) : (
                  isSelected ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground/30" />
                  )
                )}
                <span className={cn(
                  'font-medium',
                  isKiosk && 'text-lg'
                )}>
                  {modifier.name}
                </span>
                {!modifier.isAvailable && (
                  <span className="text-xs text-muted-foreground">(Unavailable)</span>
                )}
              </div>

              {modifier.price > 0 && (
                <span className={cn(
                  'font-medium text-muted-foreground',
                  isKiosk && 'text-lg'
                )}>
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
