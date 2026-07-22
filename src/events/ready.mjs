import { Events } from "discord.js";
import logger, { webhookLog } from "../utils/logger.mjs";
import {
  EmbedBuilder,
  XCounter,
  instaCounter,
  onlineCounter,
  postReddit,
  redditFeed,
  totalCounter,
} from "../utils/index.mjs";
import { invite } from "../utils/invite.mjs";
import Bot from "../client.mjs";
import {
  AutoAnnounceHandler,
  BirthdayHandler,
  SocialMediaHandler,
} from "../utils/handlers/index.mjs";
import mongoose from "mongoose";
import { registerClient } from "../internal-server.mjs";

// ─── Presence polling from dashboard DB ───────────────────────────
let BotPresenceModel = null;

async function applyPresenceFromDB(client) {
  try {
    if (!BotPresenceModel) {
      const schema = new mongoose.Schema(
        {
          status:       { type: String, default: "online" },
          activityType: { type: Number, default: 4 },
          activityName: { type: String, default: "Enjoy Every Moment :)" },
          streamingUrl: { type: String, default: "" },
        },
        { timestamps: true, collection: "botpresences" }
      );
      BotPresenceModel =
        mongoose.models.BotPresence ||
        mongoose.model("BotPresence", schema);
    }

    const doc = await BotPresenceModel.findOne({}).lean();
    if (!doc) return;

    const activity = {
      name: doc.activityName || "Enjoy Every Moment :)",
      type: doc.activityType ?? 4,
      ...(doc.activityType === 1 && doc.streamingUrl ? { url: doc.streamingUrl } : {}),
    };

    client.user.setPresence({
      activities: [activity],
      status: doc.status || "online",
    });

    logger(`Presence synced from DB: ${doc.status} — ${doc.activityName}`.cyan);
  } catch (e) {
    logger(`Presence sync error: ${e.message}`.yellow);
  }
}

export default {
  name: Events.ClientReady,
  runOnce: true,

  /**
   * @param {Bot} client
   */
  run: async (client) => {
    logger(`Logged in as ${client.user.tag}!`.cyan.bold);

    // Register this client so internal-server can push presence instantly
    registerClient(client);

    // Apply initial presence from config
    client.user.setPresence({
      activities: [client.config.Activity],
      status: client.config.Status,
    });

    // Immediately sync from dashboard DB (overrides config if admin changed it)
    await applyPresenceFromDB(client);

    // Poll every 30 seconds — keeps presence in sync even if HTTP push fails
    setInterval(() => applyPresenceFromDB(client), 30 * 1000);

    const process2 = async () => {
      const data = await client.db.Find("GuildConfig");
      await SocialMediaHandler(client, data);
      await BirthdayHandler(client, data);

      client.guilds.cache.forEach((guild) => {
        invite.updateInvites(guild);
        postReddit(guild);
      });
    };

    await Promise.all([process2()]);

    setInterval(async () => await Promise.all([process2()]), 15 * 60 * 1000);

    webhookLog(
      {
        embeds: [
          new EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({
              name: client.user.tag,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `${client.user.username} is Online Since <t:${~~(
                Date.now() / 1000
              )}:R>`
            ),
        ],
      },
      "Ready"
    );
  },
};
