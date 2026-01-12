'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsKioskMode } from '@/hooks';
import { useTranslation } from '@/stores/translation-store';

interface CheckoutFormProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function CheckoutForm({ notes, onNotesChange }: CheckoutFormProps) {
  const isKiosk = useIsKioskMode();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className={cn(
        'font-semibold',
        isKiosk ? 'text-xl' : 'text-lg'
      )}>
        {t('checkout.order_notes', 'Order Notes')}
      </h3>

      <div className="space-y-2">
        <Label
          htmlFor="order-notes"
          className={isKiosk ? 'text-base' : 'text-sm'}
        >
          {t('item.special_instructions', 'Special Instructions')} ({t('item.optional', 'Optional')})
        </Label>
        <Textarea
          id="order-notes"
          placeholder={t('checkout.order_notes_placeholder', 'Any special requests for your order?')}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          maxLength={500}
          rows={3}
          className={cn(
            'resize-none',
            isKiosk && 'text-base min-h-[100px]'
          )}
        />
        <p className="text-xs text-muted-foreground text-end">
          {notes.length}/500
        </p>
      </div>
    </div>
  );
}
