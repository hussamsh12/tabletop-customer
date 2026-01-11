'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StoreError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    console.error('Store error:', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Failed to load store</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t load the store data. Please check your connection and try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-left bg-muted p-3 rounded-md overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Store
            </Button>
            <Button onClick={reset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
