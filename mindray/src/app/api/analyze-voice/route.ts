import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();
    
    // Simulate API latency for audio processing mock
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lowerText = transcript.toLowerCase();
    
    let emotion = "Calm";
    let confidence = 85;

    if (lowerText.match(/(angry|mad|furious|hate|shout|yell)/)) {
      emotion = "Anger";
      confidence = 92;
    } else if (lowerText.match(/(sad|cry|depress|hopeless)/)) {
      emotion = "Sadness";
      confidence = 88;
    } else if (lowerText.match(/(happy|joy|great|awesome|love)/)) {
      emotion = "Joy";
      confidence = 95;
    } else if (lowerText.match(/(scared|fear|afraid|anxious|panic)/)) {
      emotion = "Fear";
      confidence = 79;
    }

    return NextResponse.json({
      success: true,
      analysis: {
        emotion,
        confidence,
        transcript_duration_seconds: Math.max(2, Math.floor(transcript.split(' ').length * 0.5)) // Faked duration
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze voice transcript' }, { status: 500 });
  }
}
