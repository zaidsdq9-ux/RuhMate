import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderPoller } from '@/components/buy/OrderPoller';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order success — RuhMate' };

export default async function BuySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  if (!order_id) {
    return (
      <Card className="p-10 text-center">
        <h1 className="font-display text-2xl text-ink">No order to show</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/buy">Back to packs</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Thanks — confirming your payment</h1>
      <OrderPoller orderId={order_id} />
      <div>
        <Button asChild variant="outline">
          <Link href="/wallet">View wallet</Link>
        </Button>
      </div>
    </div>
  );
}
