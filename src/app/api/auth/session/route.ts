
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    if (!adminApp) {
      console.error("Firebase Admin SDK is not initialized. Check your server environment variables.");
      return NextResponse.json({ status: 'error', message: 'Server configuration error: Admin SDK not initialized.' }, { status: 500 });
    }

    const body = await request.json();
    const idToken = body.idToken;
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await getAuth(adminApp).createSessionCookie(idToken, { expiresIn });
    
    const response = NextResponse.json({ status: 'success' });
    
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Session cookie creation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ status: 'error', message: `Failed to create session: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ status: 'success' });
    response.cookies.delete('session');
    return response;
  } catch (error) {
    console.error('Session cookie deletion failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ status: 'error', message: `Failed to delete session: ${errorMessage}` }, { status: 500 });
  }
}
