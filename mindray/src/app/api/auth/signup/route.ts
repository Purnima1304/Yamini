import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { name, email, password, emergencyContact } = await req.json();

    if (!name || !email || !password || !emergencyContact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await db.run(
      'INSERT INTO users (name, email, password, emergency_contact) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, emergencyContact]
    );

    // Create a simple JWT token-like string
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ 
      id: result.lastID, 
      email, 
      name, 
      emergencyContact,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    })).toString('base64url');

    const secret = process.env.JWT_SECRET || 'fallback-secure-secret-key';
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    const token = `${header}.${payload}.${signature}`;

    // Create a response and set auth cookie
    const response = NextResponse.json({ success: true, message: 'Account created successfully' });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal server error while creating account' }, { status: 500 });
  }
}
