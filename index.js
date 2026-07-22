/**
 * @author md mostakim islam sagor
 * @support discord.mostakim.org | youtobe.com/@MOSTAKIM-LABS
 * @donate https://www.buymeacoffee.com/mostakim.org
 * @note Dont take any type credit
 * @copyright discord.com/users/mostakim.org all rights reserved
 */

import dotenv from "dotenv";
dotenv.config();

import "colors";
import Client from "./src/client.mjs";
import clients from "./config.mjs";
import antiCrash from "./src/utils/antiCrash.mjs";
import mongoose from "mongoose";
import globalConfig from "./mostakim.mjs";
import logger from "./src/utils/logger.mjs";
import "./src/utils/Command.mjs";
import boxen from "boxen";
import { startInternalServer } from "./src/internal-server.mjs";

let aio = `Welcome to ${"Console".blue.bold} by ${
  "ALL IN ONE | Development".red
}`;

let aio_server = `\nSupport:- ${`https://discord.mostakim.org`.brightGreen}`;
let Uo = `\nCoded By ${`@mostakim`.brightCyan.bold}`;

console.log(
  boxen(aio + aio_server + Uo, {
    padding: 1,
    borderStyle: "round",
    textAlignment: "center",
  })
);

antiCrash(); //? anti crash handling

//? mongodb checking...
if (
  !globalConfig.API.MongoDB ||
  !globalConfig.API.MongoDB.startsWith("mongodb")
) {
  logger(
    "Please Provide a Valid MongoDB Connection String - Support: https://www.buymeacoffee.com/mostakim.org"
      .red.bold
  );
  process.exit(1);
}

let count = 0; //? counter for clients/bots

mongoose.set("strictQuery", true); //? mongoose strict mode (mongodb framework)

// ─── Load managed bots from dashboard DB ────────────────────────
async function loadManagedBots() {
  try {
    const schema = new mongoose.Schema(
      {
        token:     { type: String },
        clientId:  { type: String },
        name:      { type: String },
        isActive:  { type: Boolean, default: true },
      },
      { timestamps: true, collection: "managedbots" }
    );
    const ManagedBot =
      mongoose.models.ManagedBot || mongoose.model("ManagedBot", schema);

    const managed = await ManagedBot.find({ isActive: true }).lean();
    return managed.map((b) => ({ TOKEN: b.token, CLIENT_ID: b.clientId }));
  } catch (e) {
    logger(`Could not load managed bots from DB: ${e.message}`.yellow);
    return [];
  }
}

//? connecting to mongodb
mongoose
  .connect(globalConfig.API.MongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    logger(`Connected To MongoDB`.underline.blue.bold);

    // Start internal API server for real-time dashboard control
    startInternalServer();

    // Primary bots from env vars
    const primaryClients = clients.filter((c) => c.TOKEN && c.CLIENT_ID);

    // Additional bots from dashboard DB (exclude duplicates)
    const managedRaw = await loadManagedBots();
    const primaryIds = new Set(primaryClients.map((c) => c.CLIENT_ID));
    const managedClients = managedRaw.filter(
      (m) => !primaryIds.has(m.CLIENT_ID)
    );

    const allClients = [...primaryClients, ...managedClients];

    allClients.forEach(async (config) => {
      new Client(config).start(); //? connecting to client
      count++;
    });

    if (count)
      logger(
        `Loading ${count} Client(s) (${primaryClients.length} env + ${managedClients.length} managed)...`.magenta
      );
  })
  .catch((e) => logger(e, "error")); //? logging error if occurs
