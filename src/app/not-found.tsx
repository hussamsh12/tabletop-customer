import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
