import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken, AuthPayload } from './jwt';

export async function getAuth(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload || payload.type !== 'auth') return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuthResponse(): Promise<AuthPayload | NextResponse> {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return auth;
}
