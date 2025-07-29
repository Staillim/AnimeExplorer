
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = body.idToken;
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    
    if (!adminApp) {
      console.error("Firebase Admin SDK is not initialized. Check your server environment variables.");
      return NextResponse.json({ status: 'error', message: 'Server configuration error.' }, { status: 500 });
    }

    const sessionCookie = await getAuth(adminApp).createSessionCookie(idToken, { expiresIn });
    
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session cookie creation failed:', error);
    return NextResponse.json({ status: 'error', message: `Failed to create session: ${error}` }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    cookies().delete('session');
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session cookie deletion failed:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to delete session' }, { status: 500 });
  }
}
