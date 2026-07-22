const DISCORD_API = 'https://discord.com/api/v10';

export async function sendDiscordDM(userId: string, content: string): Promise<boolean> {
  const token = process.env.TOKEN;
  if (!token) { console.error('TOKEN env var missing'); return false; }

  try {
    const chRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: 'POST',
      headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: userId }),
    });
    if (!chRes.ok) { console.error('DM channel create failed:', await chRes.text()); return false; }
    const { id: channelId } = await chRes.json();

    const msgRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return msgRes.ok;
  } catch (e) {
    console.error('Discord DM error:', e);
    return false;
  }
}

export function buildOTPMessage(otp: string, ip: string): string {
  return [
    '🔐 **MOSTAKIM Bot Dashboard — Login Verification**',
    '',
    `Your one-time verification code is:`,
    '```',
    `  ${otp}`,
    '```',
    `⏱️ This code expires in **5 minutes**.`,
    `🌐 Login attempt from IP: \`${ip}\``,
    '',
    '> If you did not request this, ignore this message and secure your account immediately.',
  ].join('\n');
}

export function buildLockMessage(ip: string): string {
  return [
    '⚠️ **MOSTAKIM Bot Dashboard — Security Alert**',
    '',
    '🔒 Your account has been **temporarily locked** for 15 minutes due to 5 failed OTP attempts.',
    `🌐 Attack IP: \`${ip}\``,
    '',
    '> If this was not you, change your credentials immediately.',
  ].join('\n');
}
