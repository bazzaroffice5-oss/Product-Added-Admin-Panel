import { NextResponse } from 'next/server';
import { getAdminSession, clearAdminCookie } from '@/lib/auth/adminSession';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session.isAuthenticated) {
      const response = NextResponse.json(
        { authenticated: false, error: 'No active or authorized administrative session' },
        { status: 401 }
      );
      clearAdminCookie(response);
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email,
        role: session.role,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { authenticated: false, error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
