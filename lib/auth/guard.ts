import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import type { UserDoc } from '@/types';

export interface AuthedRequest {
  uid: string;
  email: string;
  email_verified: boolean;
  user: UserDoc;
}

export async function requireAuth(req: NextRequest): Promise<AuthedRequest | NextResponse> {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userSnap = await adminDb.collection(COLLECTIONS.USERS).doc(decoded.uid).get();

    if (!userSnap.exists) {
      return NextResponse.json({ success: false, error: 'User record missing' }, { status: 401 });
    }

    const user = userSnap.data() as UserDoc;

    if (user.status === 'disabled') {
      return NextResponse.json({ success: false, error: 'Account disabled' }, { status: 403 });
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? user.email,
      email_verified: decoded.email_verified ?? false,
      user,
    };
  } catch (err) {
    logger.warn({ err }, 'token verification failed');
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}

export function requireVerified(ctx: AuthedRequest): NextResponse | null {
  if (!ctx.email_verified) {
    return NextResponse.json(
      { success: false, error: 'Email verification required' },
      { status: 403 },
    );
  }
  return null;
}
