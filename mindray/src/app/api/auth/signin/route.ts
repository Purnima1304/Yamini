import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required credentials' }, { status: 400 });
    }

    const db = await getDb();

    // 1. Validate user credentials properly by looking up the user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      // 4. Handle invalid credentials with appropriate error messages (generic to prevent enumeration)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password against the securely hashed stored password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 2. Create a secure JWT token session (using native crypto)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ 
      id: user.id, 
      name: user.name,
      email: user.email, 
      emergencyContact: user.emergency_contact,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 1 day expiration
    })).toString('base64url');
    
    // Sign the token with a secret key
    const secret = process.env.JWT_SECRET || 'fallback-secure-secret-key';
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    const token = `${header}.${payload}.${signature}`;

    // 3. Return a proper response with the token
    const response = NextResponse.json({ 
      success: true, 
      token 
    });
    
    // Also securely inject standard an HTTP-only auth cookie for middleware navigation
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Signin Error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
