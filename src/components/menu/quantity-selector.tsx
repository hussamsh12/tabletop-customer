'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsKioskMode } from '@/hooks';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: 'default' | 'lg';
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  size: sizeProp,
}: QuantitySelectorProps) {
  const isKiosk = useIsKioskMode();
  const size = sizeProp || (isKiosk ? 'lg' : 'default');

  const decrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const increment = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div
      role="group"
      aria-label="Quantity selector"
      className={cn(
        'flex items-center gap-3',
        size === 'lg' && 'gap-4'
      )}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label="Decrease quantity"
        className={cn(
          'touch-target',
          size === 'lg' && 'h-12 w-12'
        )}
        onClick={decrement}
        disabled={quantity <= min}
      >
        <Minus className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      </Button>

      <span
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'font-semibold text-center min-w-[3ch]',
          size === 'lg' ? 'text-2xl' : 'text-lg'
        )}
      >
        {quantity}
      </span>

      <Button
        variant="outline"
        size="icon"
        aria-label="Increase quantity"
        className={cn(
          'touch-target',
          size === 'lg' && 'h-12 w-12'
        )}
        onClick={increment}
        disabled={quantity >= max}
      >
        <Plus className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      </Button>
    </div>
  );
}
