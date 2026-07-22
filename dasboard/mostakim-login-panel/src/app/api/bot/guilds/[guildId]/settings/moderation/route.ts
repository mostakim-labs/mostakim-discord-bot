import { NextRequest, NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ModerationConfig from '@/models/ModerationConfig';

type Ctx = { params: Promise<{ guildId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  await connectDB();
  const config = await ModerationConfig.findOne({ guildId }).lean() ?? { guildId };
  return NextResponse.json(config);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  await connectDB();
  const body = await req.json();
  const config = await ModerationConfig.findOneAndUpdate(
    { guildId },
    { ...body, guildId },
    { upsert: true, new: true, runValidators: true }
  );
  return NextResponse.json(config);
}
