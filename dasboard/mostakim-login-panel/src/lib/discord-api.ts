const DISCORD_API = 'https://discord.com/api/v10';

function getBotToken(): string {
  const token = process.env.TOKEN;
  if (!token) throw new Error('TOKEN env var is not set');
  return token;
}

export async function discordFetch<T = unknown>(
  path: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate = 0, ...fetchOptions } = options ?? {};
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...fetchOptions,
    headers: {
      Authorization: `Bot ${getBotToken()}`,
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    next: { revalidate },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Discord API ${res.status}: ${text}`);
  }
  return res.json();
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  description?: string | null;
  banner?: string | null;
  splash?: string | null;
}

export interface DiscordChannel {
  id: string;
  type: number;
  name: string;
  position?: number;
  parent_id?: string | null;
  topic?: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

export interface DiscordGuildDetail {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  splash: string | null;
  description: string | null;
  member_count: number;
  approximate_member_count?: number;
  owner_id: string;
  preferred_locale: string;
  premium_tier: number;
  premium_subscription_count?: number;
  verification_level: number;
  explicit_content_filter: number;
  channels: DiscordChannel[];
  roles: DiscordRole[];
}

export function guildIconUrl(guildId: string, icon: string | null, size = 128): string {
  if (!icon) return `https://cdn.discordapp.com/embed/avatars/0.png`;
  const ext = icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${ext}?size=${size}`;
}

export function guildBannerUrl(guildId: string, banner: string | null, size = 512): string | null {
  if (!banner) return null;
  const ext = banner.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/banners/${guildId}/${banner}.${ext}?size=${size}`;
}

export async function getBotGuilds(): Promise<DiscordGuild[]> {
  return discordFetch<DiscordGuild[]>('/users/@me/guilds?with_counts=true', { revalidate: 60 });
}

export async function getGuild(guildId: string): Promise<DiscordGuildDetail> {
  return discordFetch<DiscordGuildDetail>(`/guilds/${guildId}?with_counts=true`, { revalidate: 30 });
}

export async function getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  return discordFetch<DiscordChannel[]>(`/guilds/${guildId}/channels`, { revalidate: 30 });
}

export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  return discordFetch<DiscordRole[]>(`/guilds/${guildId}/roles`, { revalidate: 30 });
}

// Channel types
export const CH_TEXT = 0;
export const CH_VOICE = 2;
export const CH_CATEGORY = 4;
export const CH_ANNOUNCEMENT = 5;
export const CH_FORUM = 15;

export function textChannels(channels: DiscordChannel[]): DiscordChannel[] {
  return channels
    .filter(c => c.type === CH_TEXT || c.type === CH_ANNOUNCEMENT)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}
