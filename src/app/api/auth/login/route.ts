import { NextResponse } from 'next/server';
import {
  verifyAdminCredentials,
  signAdminToken,
  setAdminCookie,
  isAuthorizedAdminEmail,
} from '@/lib/auth/adminSession';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isAuthorizedAdminEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized. This account does not have administrative privileges.' },
        { status: 401 }
      );
    }

    const verification = await verifyAdminCredentials(cleanEmail, password);

    if (!verification.success || !verification.user) {
      return NextResponse.json(
        { error: verification.message || 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      email: verification.user.email,
      role: 'admin',
      userId: verification.user.userId,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Administrative session authenticated.',
      user: {
        email: verification.user.email,
        role: 'admin',
      },
    });

    setAdminCookie(response, token);
    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error processing authentication request' },
      { status: 500 }
    );
  }
}
