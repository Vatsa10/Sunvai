import { NextResponse } from 'next/server';
import { getCase } from '@/lib/cases';
import { buildReceipt } from '@/lib/ledger/receipt';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const decoded = decodeURIComponent(ref);

  const c = await getCase(decoded);
  if (!c) return NextResponse.json({ error: 'no such case' }, { status: 404 });

  const receipt = await buildReceipt(c.id, c.ref);
  if (!receipt) return NextResponse.json({ error: 'no ledger events for this case' }, { status: 404 });

  const filename = `sunvai-receipt-${c.ref.replace(/[^A-Za-z0-9]+/g, '-')}.json`;
  return new NextResponse(JSON.stringify(receipt, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}
