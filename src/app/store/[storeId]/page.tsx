import { redirect } from 'next/navigation';

interface StorePageProps {
  params: Promise<{ storeId: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeId } = await params;
  redirect(`/store/${storeId}/menu`);
}
