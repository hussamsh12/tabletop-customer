import { redirect } from 'next/navigation';

interface StorePageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/menu`);
}
