import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();
    
    // Very simple mock logic for MBTI
    // Just mapping the number of 'A' vs 'B' choices to an archetype
    const types = ["INFJ", "ENTP", "ISFJ", "ENFP", "ISTP", "ESFJ", "INTJ", "ENFJ"];
    
    // Fake a bit of calculation delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Arbitrary selection based on answer length to make it deterministic but varied
    const aCount = answers.filter((a: string) => a === 'A').length;
    let selectedType = types[aCount % types.length];

    const profiles: Record<string, { type: string, description: string }> = {
      INFJ: { type: "INFJ - The Advocate", description: "Quiet and mystical, yet very inspiring and tireless idealists." },
      ENTP: { type: "ENTP - The Debater", description: "Smart and curious thinkers who cannot resist an intellectual challenge." },
      ISFJ: { type: "ISFJ - The Defender", description: "Very dedicated and warm protectors, always ready to defend their loved ones." },
      ENFP: { type: "ENFP - The Campaigner", description: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile." },
      ISTP: { type: "ISTP - The Virtuoso", description: "Bold and practical experimenters, masters of all kinds of tools." },
      ESFJ: { type: "ESFJ - The Consul", description: "Extraordinarily caring, social and popular people, always eager to help." },
      INTJ: { type: "INTJ - The Architect", description: "Imaginative and strategic thinkers, with a plan for everything." },
      ENFJ: { type: "ENFJ - The Protagonist", description: "Charismatic and inspiring leaders, able to mesmerize their listeners." },
    };

    return NextResponse.json({
      success: true,
      result: profiles[selectedType]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process assessment' }, { status: 500 });
  }
}
