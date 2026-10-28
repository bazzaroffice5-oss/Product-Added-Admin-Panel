import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/adminSession';
import { getBrands, createBrand } from '@/lib/db/adminStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json({ success: true, brands });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error retrieving brands' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, logoUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const brand = await createBrand({ name: name.trim(), description: description?.trim(), logoUrl });
    return NextResponse.json({ success: true, brand });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error creating brand' },
      { status: 500 }
    );
  }
}
