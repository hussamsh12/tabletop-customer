'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsKioskMode } from '@/hooks';

interface CheckoutFormProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function CheckoutForm({ notes, onNotesChange }: CheckoutFormProps) {
  const isKiosk = useIsKioskMode();

  return (
    <div className="space-y-4">
      <h3 className={cn(
        'font-semibold',
        isKiosk ? 'text-xl' : 'text-lg'
      )}>
        Order Details
      </h3>

      <div className="space-y-2">
        <Label
          htmlFor="order-notes"
          className={isKiosk ? 'text-base' : 'text-sm'}
        >
          Special Instructions (Optional)
        </Label>
        <Textarea
          id="order-notes"
          placeholder="Add any special instructions for your order..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          maxLength={500}
          rows={3}
          className={cn(
            'resize-none',
            isKiosk && 'text-base min-h-[100px]'
          )}
        />
        <p className="text-xs text-muted-foreground text-right">
          {notes.length}/500
        </p>
      </div>
    </div>
  );
}
