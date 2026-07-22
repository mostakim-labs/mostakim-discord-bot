import { NextRequest, NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ManagedBot from '@/models/ManagedBot';

type Ctx = { params: Promise<{ botId: string }> };

/* ─── PATCH: toggle active / rename ─── */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  const { botId } = await params;
  const body = await req.json();

  await connectDB();
  const bot = await ManagedBot.findByIdAndUpdate(botId, body, { new: true });
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });

  return NextResponse.json({ bot });
}

/* ─── DELETE: remove a managed bot ─── */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  const { botId } = await params;
  await connectDB();
  await ManagedBot.findByIdAndDelete(botId);

  return NextResponse.json({ success: true });
}
