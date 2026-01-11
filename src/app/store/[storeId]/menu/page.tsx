'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/hooks';
import { useUIStore } from '@/stores/ui-store';
import { getMenu, getItemDetails } from '@/lib/api';
import { CategoryList, ItemGrid, ItemDetailModal } from '@/components/menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Category, MenuItem, MenuItemBrief } from '@/types';

export default function MenuPage() {
  const { store, isInitialized } = useSession();
  const selectedCategoryId = useUIStore((state) => state.selectedCategoryId);
  const setSelectedCategory = useUIStore((state) => state.setSelectedCategory);

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Fetch menu
  useEffect(() => {
    if (!isInitialized || !store) return;

    const fetchMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMenu();
        setCategories(data);

        // Auto-select first category
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategory(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err);
        setError('Failed to load menu. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [isInitialized, store, selectedCategoryId, setSelectedCategory]);

  // Get items for selected category
  const currentItems = useMemo(() => {
    if (!selectedCategoryId) return [];
    const category = categories.find((c) => c.id === selectedCategoryId);
    return category?.items || [];
  }, [categories, selectedCategoryId]);

  // Get current category name
  const currentCategoryName = useMemo(() => {
    const category = categories.find((c) => c.id === selectedCategoryId);
    return category?.name || '';
  }, [categories, selectedCategoryId]);

  // Handle item selection - fetch full details for modal
  const handleSelectItem = async (briefItem: MenuItemBrief) => {
    try {
      // Fetch full item details with variants and modifiers
      const fullItem = await getItemDetails(briefItem.id);
      setSelectedItem(fullItem);
      setIsItemModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch item details:', err);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsItemModalOpen(false);
    // Delay clearing item to allow animation
    setTimeout(() => setSelectedItem(null), 200);
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        {/* Category bar skeleton */}
        <div className="sticky top-16 z-40 bg-background border-b">
          <div className="flex gap-2 p-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Items grid skeleton */}
        <div className="container px-4 py-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border bg-card overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="container px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No menu items available at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-bottom">
      {/* Category navigation */}
      <CategoryList
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategory}
      />

      {/* Items */}
      <div className="container px-4 py-6">
        {currentCategoryName && (
          <h2 className="text-xl font-semibold mb-4">{currentCategoryName}</h2>
        )}

        <ItemGrid
          items={currentItems}
          onSelectItem={handleSelectItem}
        />
      </div>

      {/* Item detail modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isItemModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
