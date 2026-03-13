import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple validation
    if (!data.name || !data.email || !data.doctor || !data.date) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      appointment: {
         id: 'apt_' + Date.now(),
         ...data,
         status: 'confirmed'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
  }
}
