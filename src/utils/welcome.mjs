import { AttachmentBuilder, EmbedBuilder as DjsEmbed } from "discord.js";
import { cache } from "./index.mjs";
import { welcomeCard } from "greetify";

/* ─────────────────────────────────────────────
   Variable parser
   Supports: {guild:name} {guild:membercount}
             {user:mention} {user:name} {user:tag}
             {user:nick} {user:avatar} {user:accountcreated}
             {inviter:username} {inviter:mention}
───────────────────────────────────────────── */
const parse = (content = "", member, inviteData = {}) =>
  content
    .replace(/\\n/g, "\n")
    .replace(/{guild:name}/g, member.guild.name)
    .replace(/{guild:membercount}/g, member.guild.memberCount)
    .replace(/{user:accountcreated}/g, `<t:${parseInt(member.user.createdTimestamp / 1000)}:R>`)
    .replace(/{user:nick}/g, member.displayName)
    .replace(/{user:name}/g, member.user.username)
    .replace(/{user:dis}/g, member.user.discriminator ?? "0")
    .replace(/{user:tag}/g, member.user.tag ?? member.user.username)
    .replace(/{user:mention}/g, member.toString())
    .replace(/{user:avatar}/g, member.displayAvatarURL())
    .replace(/{inviter:username}/g, inviteData?.inviter?.username ?? "unknown")
    .replace(/{inviter:mention}/g, inviteData?.inviter?.toString() ?? "unknown");

/* ─────────────────────────────────────────────
   Build welcome/leave image card
───────────────────────────────────────────── */
const buildCard = async (member, data, type) => {
  try {
    const cardData = type === "FAREWELL" ? data?.FarewellCard : data?.WelcomeCard;
    const welcard = await new welcomeCard()
      .setName(member.user.username)
      .setAvatar(member.user.displayAvatarURL({ format: "png", size: 256 }))
      .setMessage(cardData?.Message ?? `Members: ${member.guild.memberCount}`)
      .setBackground(cardData?.Background ?? null)
      .setColor(cardData?.Color ?? null)
      .setTitle(type === "FAREWELL" ? "GoodBye" : "Welcome")
      .build();

    return new AttachmentBuilder(welcard, { name: `card-${member.user.id}.png` });
  } catch {
    return null;
  }
};

/* ─────────────────────────────────────────────
   Build the rich embed (Welcome)
───────────────────────────────────────────── */
const buildWelcomeEmbed = (member, config, inviteData = {}) => {
  const guild = member.guild;
  const avatarURL = member.displayAvatarURL({ size: 256 });
  const guildIcon = guild.iconURL({ size: 128 }) ?? null;

  const title   = parse(config?.embedTitle   ?? "✨ Welcome to {guild:name}!", member, inviteData);
  const desc    = parse(config?.embedDescription ??
    "Hey {user:mention}, welcome to **{guild:name}**! 🎉\nYou are member **#{guild:membercount}**.", member, inviteData);
  const footer  = parse(config?.embedFooter  ?? "Member #{guild:membercount}", member, inviteData);
  const color   = config?.embedColor ?? "#7c3aed";

  const embed = new DjsEmbed()
    .setColor(color)
    .setAuthor({ name: guild.name, iconURL: guildIcon })
    .setTitle(title)
    .setDescription(desc)
    .setThumbnail(config?.embedThumbnail !== false ? avatarURL : null)
    .setFooter({ text: footer, iconURL: guildIcon })
    .setTimestamp()
    .addFields(
      {
        name: "📅 Account Created",
        value: `<t:${parseInt(member.user.createdTimestamp / 1000)}:R>`,
        inline: true,
      },
      {
        name: "👥 Total Members",
        value: `**${guild.memberCount}**`,
        inline: true,
      }
    );

  if (inviteData?.inviter) {
    embed.addFields({
      name: "📨 Invited By",
      value: inviteData.inviter.toString(),
      inline: true,
    });
  }

  if (config?.embedBanner) embed.setImage(config.embedBanner);

  return embed;
};

/* ─────────────────────────────────────────────
   Build the rich embed (Farewell / Leave)
───────────────────────────────────────────── */
const buildLeaveEmbed = (member, config) => {
  const guild = member.guild;
  const avatarURL = member.displayAvatarURL({ size: 256 });
  const guildIcon = guild.iconURL({ size: 128 }) ?? null;

  const title = parse(
    config?.embedTitle ?? "👋 {user:name} left the server",
    member
  );
  const desc = parse(
    config?.embedDescription ??
      "**{user:name}** has left **{guild:name}**.\nWe now have **{guild:membercount}** members.",
    member
  );
  const footer = parse(config?.embedFooter ?? "Goodbye • {guild:name}", member);
  const color  = config?.embedColor ?? "#ef4444";

  const embed = new DjsEmbed()
    .setColor(color)
    .setAuthor({ name: guild.name, iconURL: guildIcon })
    .setTitle(title)
    .setDescription(desc)
    .setThumbnail(config?.embedThumbnail !== false ? avatarURL : null)
    .setFooter({ text: footer, iconURL: guildIcon })
    .setTimestamp()
    .addFields({
      name: "👥 Members Left",
      value: `**${guild.memberCount}**`,
      inline: true,
    });

  if (config?.embedBanner) embed.setImage(config.embedBanner);

  return embed;
};

/* ─────────────────────────────────────────────
   Track invite usage for invite leaderboard
───────────────────────────────────────────── */
const trackInvite = async (client, member, inviterData, type) => {
  try {
    if (!inviterData?.inviter) return;
    await client.db.UpdateOne(
      "GuildMember",
      { Guild: member.guild.id, User: member.id },
      { $set: { InvitedBy: inviterData?.inviter?.id ?? null } },
      { upsert: true }
    );
    await client.db.UpdateOne(
      "GuildMember",
      { Guild: member.guild.id, User: inviterData.inviterId },
      { $inc: { "Invites.Count": type === "WELCOME" ? 1 : -1 } }
    );
  } catch { /* non-critical */ }
};

/* ─────────────────────────────────────────────
   sendWelcome  — called on guildMemberAdd
   Sends: embed  +  card image (both always)
───────────────────────────────────────────── */
async function sendWelcome(member, inviterData = {}, data = {}) {
  const { guild } = member;
  if (!guild || !member) return;
  if (!data?.Welcome?.Enable) return;

  const channel = guild.channels.cache.get(data?.Welcome?.Channel);
  if (!channel) return;

  const client = member.client;

  // Track invite stats (non-blocking)
  trackInvite(client, member, inviterData, "WELCOME");

  // Dashboard config (richer settings) — stored in WelcomeConfig collection
  // Merged on top of GuildConfig.Welcome fields
  const cfg = data?.Welcome ?? {};

  // Build embed
  const embed = buildWelcomeEmbed(member, cfg, inviterData);

  // Build card image (always on)
  const card = await buildCard(member, data, "WELCOME");

  const payload = {
    embeds: [embed],
    files: card ? [card] : [],
  };

  // Plain content mention ping (optional)
  if (cfg?.Content) {
    payload.content = parse(cfg.Content, member, inviterData);
  } else {
    payload.content = member.toString(); // ping the new member
  }

  await channel.send(payload).catch(console.error);

  // DM welcome (if enabled via dashboard WelcomeConfig)
  if (cfg?.dmEnabled && cfg?.dmMessage) {
    const dmMsg = parse(cfg.dmMessage, member, inviterData);
    member.send(dmMsg).catch(() => {});
  }
}

/* ─────────────────────────────────────────────
   sendFarewell  — called on guildMemberRemove
   Sends: embed  +  card image (both always)
───────────────────────────────────────────── */
async function sendFarewell(member, inviterData = {}, data = {}) {
  const { guild } = member;
  if (!guild || !member) return;
  if (!data?.Farewell?.Enable) return;

  const channel = guild.channels.cache.get(data?.Farewell?.Channel);
  if (!channel) return;

  const client = member.client;

  // Track invite stats (non-blocking)
  trackInvite(client, member, inviterData, "FAREWELL");

  const cfg = data?.Farewell ?? {};

  // Build embed
  const embed = buildLeaveEmbed(member, cfg);

  // Build card image (always on)
  const card = await buildCard(member, data, "FAREWELL");

  await channel.send({
    embeds: [embed],
    files: card ? [card] : [],
  }).catch(console.error);
}

export { buildCard, buildWelcomeEmbed, buildLeaveEmbed, sendWelcome, sendFarewell };
