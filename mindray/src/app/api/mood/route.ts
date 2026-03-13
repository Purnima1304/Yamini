import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  } catch(e) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const history = await db.all('SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
  
  const formattedHistory = history.map(h => ({
    id: h.id,
    date: h.created_at,
    mood: h.mood,
    intensity: h.intensity,
    note: h.note
  }));

  return NextResponse.json({ success: true, history: formattedHistory });
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { mood, intensity, note } = await req.json();
    
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO moods (user_id, mood, intensity, note) VALUES (?, ?, ?, ?)',
      [user.id, mood, intensity, note || '']
    );

    const newEntry = {
      id: result.lastID,
      date: new Date().toISOString(),
      mood,
      intensity,
      note
    };
    
    const history = await db.all('SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
    const formattedHistory = history.map(h => ({
      id: h.id,
      date: h.created_at,
      mood: h.mood,
      intensity: h.intensity,
      note: h.note
    }));
    
    return NextResponse.json({ success: true, entry: newEntry, history: formattedHistory });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to log mood' }, { status: 500 });
  }
}
