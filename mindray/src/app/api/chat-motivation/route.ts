import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
    const { message } = await req.json();
    
    // Simulate AI latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic heuristic responses to simulate an AI motivational coach
    const msg = message.toLowerCase();
    
    let isEmergency = false;
    let reply = "I hear you, and it's completely normal to feel this way. Remember that progress isn't linear. Take a deep breath and give yourself some grace today.";

    // Critical Emergency Check
    if (msg.match(/(suicide|kill myself|end my life|want to die|self harm|hurt myself|dying)/)) {
      isEmergency = true;
      reply = "🚨 URGENT: I am so sorry you are in such deep pain right now. Please know that your life has immense value and people want to help you. I have securely pinged the emergency contact you provided during registration with an alert. While they respond, PLEASE call the National Distress helpline at 988 immediately.";
      const user = getUserFromToken(req);
      if (user?.emergencyContact) {
         await sendEmergencyAlert(user.emergencyContact, message, "AI Chat Support Bot");
      }
    } else if (msg.match(/(imposter|fraud|not good enough|fake)/)) {
      reply = "Imposter syndrome is incredibly common, especially among high achievers. Your accomplishments are real, and you earned your place. Try to focus on the facts of what you've done rather than the feelings of doubt.";
    } else if (msg.match(/(fail|failed|mistake|ruined)/)) {
      reply = "Every master was once a beginner who failed over and over. A mistake is just data—it tells you what doesn't work so you can adjust. What's one small lesson you can take from this?";
    } else if (msg.match(/(overwhelmed|too much|stressed|anxious)/)) {
      reply = "When everything feels like too much, the best thing to do is focus only on the very next step. Don't look at the whole mountain. What is one tiny thing you can do right now to move forward?";
    } else if (msg.match(/(give up|quit|cant do|hard)/)) {
      reply = "It's okay to feel tired. Rest if you must, but don't quit. You have survived 100% of your hardest days so far. You are much stronger than your current doubts are making you feel.";
    }

    return NextResponse.json({
      success: true,
      requiresEmergencyIntervention: isEmergency,
      reply
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
