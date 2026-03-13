import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { sendEmergencyAlert } from '@/lib/sendAlert';

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

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text } = await req.json();
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerText = text.toLowerCase();
    
    let sentiment = "Neutral";
    let score = 50;
    let emotion = "Calm";
    let suggestions = [
      "Take a short walk to clear your mind.",
      "Try to maintain this balanced state with some light reading."
    ];

    let requiresEmergencyIntervention = false;

    if (lowerText.match(/(suicide|kill myself|end my life|want to die|self harm|hurt myself|dying)/)) {
      sentiment = "Critical Risk";
      score = 0;
      emotion = "Severe Distress";
      requiresEmergencyIntervention = true;
      suggestions = [
        "Please call 988 or your National Emergency number immediately.",
        "Your loved ones have been notified. Please stay safe and talk to someone."
      ];
      
      if (user.emergencyContact) {
        await sendEmergencyAlert(user.emergencyContact, text, "Text Analysis (Journal) Entry");
      }
    } else if (lowerText.match(/(sad|depress|cry|hopeless|lonely|empty|tired)/)) {
      sentiment = "Negative";
      score = 20;
      emotion = "Sadness";
      suggestions = [
        "Reach out to a close friend or family member just to chat.",
        "Consider doing a 5-minute guided breathing exercise.",
        "Be gentle with yourself today. It's okay to rest."
      ];
    } else if (lowerText.match(/(anxious|stress|worry|fear|panic|nervous)/)) {
      sentiment = "Negative";
      score = 30;
      emotion = "Anxiety";
      suggestions = [
        "Try the 'Box Breathing' technique in our Mind Relaxation section.",
        "Write down specific things you are worried about to get them out of your head.",
        "Limit caffeine intake for the rest of the day."
      ];
    } else if (lowerText.match(/(happy|great|good|joy|smile|love|excited|proud)/)) {
      sentiment = "Positive";
      score = 85;
      emotion = "Joy";
      suggestions = [
        "Write down three things you are grateful for while you feel good.",
        "Share this positive energy with someone you care about.",
        "Channel this motivation into a hobby or project you enjoy."
      ];
    }

    const db = await getDb();
    await db.run(
      'INSERT INTO journals (user_id, text, sentiment, score, emotion) VALUES (?, ?, ?, ?, ?)',
      [user.id, text, sentiment, score, emotion]
    );

    return NextResponse.json({
      success: true,
      requiresEmergencyIntervention,
      analysis: {
        sentiment,
        score, // 0 to 100
        emotion,
        suggestions
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
  }
}
