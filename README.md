<h1 align="center">MOSTAKIM DISCORD BOT</h1>

<p align="center">
  <b>Powerful multipurpose Discord bot + secure web-based admin dashboard</b><br/>
  Made by <a href="https://discord.mostakim.org">@MOSTAKIM</a>
</p>

<p align="center">
  <a href="https://discord.gg/qp6e4qw9RK"><img src="https://img.shields.io/badge/Support-Discord-5865F2?logo=discord&logoColor=white" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20.5+-339933?logo=node.js&logoColor=white" /></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white" /></a>
  <a href="https://discord.js.org"><img src="https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white" /></a>
</p>

---

## Table of Contents

- [Project Structure](#-project-structure)
- [Requirements](#-requirements)
- [Secret Values — What They Are & How to Get Them](#-secret-values--what-they-are--how-to-get-them)
- [Deploy on Replit](#-deploy-on-replit)
- [Deploy on VPS / Linux Server](#-deploy-on-vps--linux-server)
- [Deploy on Other Platforms](#-deploy-on-other-platforms)
- [Bot Configuration](#-bot-configuration)
- [Admin Login Panel](#-admin-login-panel)
- [Discord Webhook Logs](#-discord-webhook-logs)
- [Support](#-support)

---

## 📁 Project Structure

```
/
├── index.js                    # Bot entry point
├── mostakim.mjs                # Bot config (prefix, owners, webhooks)
├── config.mjs                  # Token & Client ID loader
├── .env.example                # Template — copy this to .env on VPS
│
├── cmd/                        # All bot commands
│   ├── Prefix/                 # Message (prefix) commands
│   └── Slash/                  # Slash (/) commands
│
├── src/                        # Bot core
│   ├── client.mjs              # Discord client
│   ├── events/                 # Event handlers
│   ├── Models/                 # Mongoose models
│   └── utils/                  # Helpers, loaders
│
└── dasboard/
    └── mostakim-login-panel/   # Admin dashboard (Next.js 14)
        ├── src/
        │   ├── app/            # Pages: login, OTP, dashboard
        │   ├── lib/            # MongoDB, JWT, Discord DM, rate limiter
        │   └── models/         # Admin, OTP, LoginLog schemas
        └── public/             # Logo, manifest
```

---

## ⚙️ Requirements

| Tool | Minimum Version | Install |
|---|---|---|
| [Node.js](https://nodejs.org) | v20.5.0 | [nodejs.org/download](https://nodejs.org/en/download) |
| [pnpm](https://pnpm.io) | v8.0 | `npm install -g pnpm` |
| [MongoDB Atlas](https://mongodb.com) | Free M0 tier | [mongodb.com](https://www.mongodb.com/cloud/atlas) |
| Discord Application | — | [discord.com/developers](https://discord.com/developers/applications) |

---

## 📄 Files You Need to Add to the Project

The repository already contains all source code. Depending on where you are running the project, you may need to **create one or two files yourself**. Here is the complete picture:

---

### If you are running on Replit

You do **not** need to create any files. All secrets go into the **Secrets panel** (🔒 lock icon in the left sidebar). The app reads them automatically as environment variables.

**No `.env` file is needed on Replit.**

---

### If you are running on a VPS, Linux server, or local machine

You need to create one file:

#### 📁 `.env` — in the **project root** (same folder as `index.js`)

```
your-project/
├── index.js          ← bot entry point
├── .env              ← ✅ CREATE THIS FILE  ← secrets go here
├── .env.example      ← already exists — copy this as a template
├── mostakim.mjs
├── config.mjs
└── dasboard/
```

**How to create it:**

```bash
cp .env.example .env
nano .env
```

Then fill it in like this:

```env
# Discord Bot
TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here

# Database
MONGO_DB=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Admin Dashboard
ADMIN_MOBILE=01712345678
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_DISCORD_ID=123456789012345678
JWT_SECRET=paste_64_byte_random_hex_here
SESSION_SECRET=paste_32_byte_random_hex_here
```

Save the file. The bot and dashboard both read from this single `.env` file automatically.

> ⚠️ **Never commit `.env` to GitHub.** It is already listed in `.gitignore` — do not remove it from there.

---

### Summary table

| File | Location | Replit | VPS / Local |
|---|---|---|---|
| `.env` | Project root (next to `index.js`) | ❌ Not needed | ✅ Must create |
| `dasboard/mostakim-login-panel/.env` | Inside dashboard folder | ❌ Not needed | ❌ Not needed (reads from root `.env`) |

That's it. **Only one file** needs to be created on VPS. Everything else is already in the repository.

---

## 🔑 Secret Values — What They Are & How to Get Them

This project needs **8 secret values**. Each one is explained below — what it is, where to find it, and exactly what format to use.

---

### 1. `TOKEN` — Discord Bot Token

> **What it is:** The password your bot uses to connect to Discord. Never share this.

**Steps:**
1. Go to **[discord.com/developers/applications](https://discord.com/developers/applications)**
2. Click **New Application** → enter any name → **Create**
3. In the left sidebar, click **Bot**
4. Click the **Reset Token** button → confirm → **Copy** the token that appears

```
Example value:
MTE4NzU2ODA2NzExxxxxxxxxxxxxxxxxxxxxxxxx.EXAMPLE.xxxxxxxxxxxxxxxxx
```

> ⚠️ If you ever expose this token publicly (GitHub, Discord, etc.), immediately go back and **Reset Token** again. The old one stops working instantly.

---

### 2. `CLIENT_ID` — Discord Application ID

> **What it is:** The unique ID number of your Discord application. Used to register slash commands.

**Steps:**
1. Go to **[discord.com/developers/applications](https://discord.com/developers/applications)**
2. Click your application
3. Go to **General Information** tab
4. Copy the **Application ID** (the long number under the app name)

```
Example value:
1187651969786568066
```

---

### 3. `MONGO_DB` — MongoDB Connection String

> **What it is:** The address of your database. All bot settings, user data, and login logs are stored here.

**Steps:**
1. Go to **[mongodb.com](https://www.mongodb.com)** → Sign up for free
2. Click **Create a New Project** → give it a name → **Next** → **Create Project**
3. Click **Build a Database** → choose **Free (M0)** → pick any region → click **Create**
4. **Create a database user:**
   - Username: `botadmin` (or anything you like)
   - Password: a strong password (save this — you will need it in step 7)
   - Click **Create User**
5. **Allow network access:**
   - Scroll down to **IP Access List**
   - Click **Add My Current IP Address** OR click **Allow Access from Anywhere** (`0.0.0.0/0`) for Replit/VPS
   - Click **Finish and Close**
6. Once the cluster is created, click **Connect** → **Drivers**
7. Copy the connection string shown. It looks like:

```
mongodb+srv://botadmin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

8. Replace `<password>` with the actual password you set in step 4:

```
Example final value:
mongodb+srv://botadmin:MyStr0ngPass@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

> ✅ Make sure **Allow Access from Anywhere** is enabled in Network Access, otherwise Replit and VPS connections will be blocked.

---

### 4. `JWT_SECRET` — Authentication Token Secret

> **What it is:** A long random string used to sign login sessions. Changing this will log everyone out.

**How to generate one** — run this in any terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use an online generator: **[generate-secret.vercel.app/64](https://generate-secret.vercel.app/64)**

```
Example value:
mostakim420xxxxxxxxxxxxxxxxxxxxxxxxx.EXAMPLE.xxxxxxxxxxxxxxxxx
```

---

### 5. `SESSION_SECRET` — Session Signing Secret

> **What it is:** A separate random string for signing session cookies. Must be different from `JWT_SECRET`.

Generate it the same way:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
Example value:
7d9f1a2b3c4e5f6a7b8NzExxxxxxxxxxxxxxxxxxxxxxxxx.EXAMPLE.xxxxxxxxxxxxxxxxx
```

---

### 6. `ADMIN_MOBILE` — Login Panel Username

> **What it is:** Your mobile number used as the username when logging into the admin dashboard. Optional — you can leave it blank and log in with just a password.

```
Example value:
01712345678
```

No `+`, no spaces, no dashes. Numbers only.

---

### 7. `ADMIN_PASSWORD` — Login Panel Password

> **What it is:** The password for the admin dashboard. This is hashed automatically with bcrypt when you first log in — the plain text is never stored in MongoDB.

```
Example value:
MyStr0ng@Pass2024!
```

> Use at least 8 characters. Mix letters, numbers, and symbols.

---

### 8. `ADMIN_DISCORD_ID` — Your Discord User ID

> **What it is:** Your personal Discord account ID. The bot sends the one-time login code (OTP) to this account via DM.

**Steps to find your Discord User ID:**
1. Open Discord (desktop or browser)
2. Click the gear icon ⚙️ → **User Settings**
3. Scroll down to **Advanced**
4. Turn on **Developer Mode**
5. Close settings
6. Right-click your own username anywhere in Discord (a message you sent, your sidebar avatar, etc.)
7. Click **Copy User ID**

```
Example value:
123456789012345678
```

> ⚠️ The bot must be able to DM you. Either share a mutual server with the bot, or DM the bot first to open a DM channel.

---

## 🚀 Deploy on Replit

Replit stores secrets securely — you never create a `.env` file. Everything goes in the **Secrets** panel.

### Step 1 — Open Secrets

In your Repl, look for the **lock icon 🔒** in the left sidebar. Click it to open the Secrets tab.

### Step 2 — Add All 8 Secrets

Click **New Secret** for each one:

| Secret Key | Where to get it |
|---|---|
| `TOKEN` | Discord Developer Portal → Bot → Reset Token |
| `CLIENT_ID` | Discord Developer Portal → General Information → Application ID |
| `MONGO_DB` | MongoDB Atlas → Connect → Drivers (full connection string) |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `SESSION_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_MOBILE` | Your mobile number (optional — used as login username) |
| `ADMIN_PASSWORD` | Any password you choose for the dashboard |
| `ADMIN_DISCORD_ID` | Your Discord User ID (Developer Mode → right-click → Copy User ID) |

### Step 3 — Install Dependencies

Open the **Shell** tab and run:

```bash
pnpm install
cd dasboard/mostakim-login-panel && pnpm install && cd ../..
```

### Step 4 — Start Workflows

- Click **Discord Bot** workflow → **Run** (starts the bot)
- Click **Start application** workflow → **Run** (starts the dashboard on port 5000)

### Step 5 — Invite the Bot to Your Server

Go to the Discord Developer Portal → your app → **OAuth2** → **URL Generator**:
- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Administrator` (or select specific permissions)
- Copy the generated URL and open it in a browser to invite the bot

---

## 🖥️ Deploy on VPS / Linux Server

On a VPS or Linux server, secrets go in a `.env` file in the project root.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/mostakim-discord-bot.git
cd mostakim-discord-bot
```

### Step 2 — Create the `.env` File

```bash
cp .env.example .env
nano .env
```

The `.env` file should look like this (fill in your actual values):

```env
# ─── Discord Bot ──────────────────────────────────────────
TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here

# ─── Database ─────────────────────────────────────────────
MONGO_DB=mongodb+srv://botadmin:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# ─── Admin Dashboard ──────────────────────────────────────
ADMIN_MOBILE=01712345678
ADMIN_PASSWORD=MyStr0ng@Pass2024!
ADMIN_DISCORD_ID=123456789012345678
JWT_SECRET=paste_64_byte_hex_here
SESSION_SECRET=paste_32_byte_hex_here
```

Save with `Ctrl+O` → Enter → `Ctrl+X`.

### Step 3 — Install Dependencies

```bash
# Bot dependencies
pnpm install

# Dashboard dependencies
cd dasboard/mostakim-login-panel
pnpm install
cd ../..
```

### Step 4 — Build the Dashboard

```bash
cd dasboard/mostakim-login-panel
pnpm run build
cd ../..
```

### Step 5 — Run Everything

**In separate terminal windows** (or use `tmux` / `screen`):

```bash
# Terminal 1 — Discord Bot
node index.js

# Terminal 2 — Admin Dashboard
cd dasboard/mostakim-login-panel && pnpm run start
```

### Step 6 — Keep Running with PM2 (Recommended)

PM2 keeps your processes alive after you disconnect from SSH and restarts them on crash.

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot
pm2 start index.js --name "mostakim-bot"

# Start the dashboard
pm2 start "pnpm run start" --name "mostakim-panel" --cwd "/path/to/dasboard/mostakim-login-panel"

# Save process list (survives reboots)
pm2 save

# Enable auto-start on server reboot
pm2 startup
# Copy and run the command it outputs
```

**Useful PM2 commands:**
```bash
pm2 list              # View all running processes
pm2 logs mostakim-bot # View bot logs
pm2 restart all       # Restart everything
pm2 stop all          # Stop everything
```

---

## 🌐 Deploy on Other Platforms

### Railway / Render / Fly.io

These platforms use environment variables set in their dashboard — no `.env` file needed.

1. Connect your GitHub repository in their dashboard
2. Go to **Environment Variables** (Railway), **Environment** (Render), or **Secrets** (Fly.io)
3. Add all 8 keys with their values (same as the table above)
4. Set the **Start Command**:
   - For the bot: `node index.js`
   - For the dashboard: `cd dasboard/mostakim-login-panel && pnpm run build && pnpm run start`

### Docker

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'
services:
  bot:
    build: .
    command: node index.js
    environment:
      TOKEN: your_token
      CLIENT_ID: your_client_id
      MONGO_DB: your_mongo_uri
    restart: unless-stopped

  dashboard:
    build: ./dasboard/mostakim-login-panel
    command: pnpm run start
    ports:
      - "5000:5000"
    environment:
      MONGO_DB: your_mongo_uri
      JWT_SECRET: your_jwt_secret
      SESSION_SECRET: your_session_secret
      ADMIN_MOBILE: your_mobile
      ADMIN_PASSWORD: your_password
      ADMIN_DISCORD_ID: your_discord_id
    restart: unless-stopped
```

> Better practice: put all env values in a `.env` file and use `env_file: .env` in the compose file instead of hardcoding them.

---

## 🤖 Bot Configuration — `config.mjs` and `mostakim.mjs`

There are two config files in the project root. They serve very different purposes. Here is exactly what to do with each one.

---

### `config.mjs` — Do NOT edit this file manually

```js
// config.mjs
import dotenv from 'dotenv'
dotenv.config()

const Tokens = process.env.TOKEN?.split(","),
    ClientIDs = process.env.CLIENT_ID.split(",");

export default Tokens.map((t, i) => ({ TOKEN: t, CLIENT_ID: ClientIDs[i] }));
```

This file **automatically reads** `TOKEN` and `CLIENT_ID` from your `.env` file (on VPS) or from Replit Secrets. You do not need to touch it at all.

| What you might want to do | How to actually do it |
|---|---|
| Set the bot token | Add `TOKEN=...` to `.env` or Replit Secrets |
| Set the client ID | Add `CLIENT_ID=...` to `.env` or Replit Secrets |
| Run multiple bots | Set `TOKEN=token1,token2` and `CLIENT_ID=id1,id2` (comma-separated) |

> ✅ Rule: **Never paste your token directly into `config.mjs`.** Always use `.env` or Replit Secrets.

---

### `mostakim.mjs` — Edit this file directly

This file controls the bot's behavior and settings. Unlike `config.mjs`, most values here are **meant to be edited by hand**. Open it in any text editor and change what you need.

Here is every field explained:

#### `API.MongoDB`

```js
API: {
  MongoDB: process.env.MONGO_DB || "",
}
```

Leave this line exactly as-is. It reads your MongoDB URI from `.env` or Replit Secrets automatically. Do not paste your connection string here.

---

#### `Default.Prefix`

```js
Default: {
  Prefix: ".",
```

The command prefix users type before commands (e.g. `.help`, `.ban`).
Change `"."` to whatever you want — for example `"!"` or `"?"`.

---

#### `Default.Owners`

```js
  Owners: ["1523571552270942318"],
```

**Replace the existing ID with your own Discord User ID.** This gives you access to owner-only commands.

To find your Discord User ID:
1. Open Discord → Settings → Advanced → enable **Developer Mode**
2. Right-click your username → **Copy User ID**

To add multiple owners:
```js
Owners: ["your_id_here", "second_owner_id", "third_owner_id"],
```

---

#### `Default.Status` and `Default.Activity`

```js
  Status: "online",
  Activity: {
    name: "Enjoy Every Moment :)",
    type: 4,
  },
```

- `Status`: the bot's online status. Options: `"online"`, `"idle"`, `"dnd"`, `"invisible"`
- `Activity.name`: the text shown under the bot's name (e.g. "Watching over 10 servers")
- `Activity.type`: the activity type number:
  - `0` = Playing
  - `1` = Streaming
  - `2` = Listening
  - `3` = Watching
  - `4` = Custom status (use this for any free text)
  - `5` = Competing

---

#### `Default.Theme`

```js
  Theme: "Blue",
```

Default embed color for bot responses. Options: `"Blue"`, `"Yellow"`, `"Red"`.

---

#### `Default.Links`

```js
  Links: {
    Discord: "https://discord.gg/___",
    Patreon: "https://patreon.com",
  },
```

Replace with your actual Discord server invite and Patreon link. These appear in bot responses like the `invite` command.

---

#### `Default.Commands.Enabled` and `Default.Commands.Disabled`

```js
  Commands: {
    Enabled: [],
    Disabled: [],
  },
```

Use these to turn entire command categories on or off.

Available categories: `General`, `Economy`, `Fun`, `Giveaway`, `Misc`, `Moderation`, `Rank`, `Setup`, `OwnerOnly`, `NSFW`

**To disable NSFW and Economy commands:**
```js
Disabled: ["NSFW", "Economy"],
```

**To only allow Moderation and General commands (disable all others):**
```js
Enabled: ["Moderation", "General"],
```

Leave both arrays empty `[]` to enable everything.

---

#### `Log.Ready`, `Log.Command`, `Log.Error`

```js
Log: {
  Ready:   "https://discord.com/api/webhooks/...",
  Command: "https://discord.com/api/webhooks/...",
  Error:   "https://discord.com/api/webhooks/...",
},
```

**Replace all three webhook URLs with your own.** The current URLs in the file are the original developer's — your logs will go to the wrong channel if you leave them unchanged.

How to create a webhook:
1. Open the Discord channel you want logs sent to
2. Click **Edit Channel** (gear ⚙️) → **Integrations** → **Webhooks** → **New Webhook**
3. Give it a name → click **Copy Webhook URL**
4. Paste it in place of the existing URLs above

You can use **one webhook URL for all three** fields, or create three separate webhooks for cleaner logs.

---

#### `Promotion.Messages`

```js
Promotion: {
  Messages: ["Join our [discord](https://discord.gg) "],
},
```

Promotional messages the bot occasionally shows. Replace the link with your Discord server invite.

---

### Quick reference — what to edit where

| What you want to change | Which file | How |
|---|---|---|
| Bot token | `.env` or Replit Secrets | `TOKEN=your_token` |
| Application / Client ID | `.env` or Replit Secrets | `CLIENT_ID=your_id` |
| MongoDB connection string | `.env` or Replit Secrets | `MONGO_DB=mongodb+srv://...` |
| Command prefix | `mostakim.mjs` | Change `Prefix: "."` |
| Bot owner Discord IDs | `mostakim.mjs` | Edit the `Owners: [...]` array |
| Bot status / activity text | `mostakim.mjs` | Edit `Status` and `Activity` |
| Embed color theme | `mostakim.mjs` | Change `Theme: "Blue"` |
| Discord server invite link | `mostakim.mjs` | Edit `Links.Discord` |
| Enable / disable command categories | `mostakim.mjs` | Edit `Commands.Enabled` / `Commands.Disabled` |
| Webhook log URLs | `mostakim.mjs` | Replace all three `Log` URLs |

---

## 🔐 Admin Login Panel

The dashboard runs at port **5000** (`http://your-server-ip:5000` on VPS, or via the Replit preview on Replit).

**Login flow:**
1. Enter your password on the login page (mobile number is optional)
2. A 4-digit OTP is sent to your Discord account via direct message from the bot
3. Enter the OTP to access the full dashboard

**Security features:**
- Passwords hashed with bcrypt — plain text is never stored
- OTP expires in 5 minutes
- 5 wrong OTP attempts → account locked for 15 minutes
- Auth stored in `httpOnly` + `sameSite: strict` JWT cookie
- Rate limiting on all auth endpoints (5 attempts / 15 min per IP)
- All login events logged to MongoDB

---

## 🔗 Discord Webhook Logs

Webhook URLs in `mostakim.mjs` let the bot send log messages to a Discord channel.

**Create a webhook:**
1. Open the Discord channel you want logs in
2. Click **Edit Channel** (gear icon) → **Integrations** → **Webhooks**
3. Click **New Webhook** → give it a name → **Copy Webhook URL**
4. Paste the URL into `mostakim.mjs`:

```js
Log: {
  Ready:   "https://discord.com/api/webhooks/000/xxxxx",
  Command: "https://discord.com/api/webhooks/000/xxxxx",
  Error:   "https://discord.com/api/webhooks/000/xxxxx",
}
```

> You can use the same webhook for all three, or create separate ones for cleaner logs.

---

## 💬 Support

- **Discord Server:** [discord.gg/qp6e4qw9RK](https://discord.gg/qp6e4qw9RK)
- **Contact:** [discord.mostakim.org](https://discord.mostakim.org)
- **YouTube:** [youtube.com/@MOSTAKIM-LABS](https://youtube.com/@MOSTAKIM-LABS)
- **Donate:** [buymeacoffee.com/mostakim.org](https://www.buymeacoffee.com/mostakim.org)

---

<p align="center">© 2026 MOSTAKIM · All rights reserved</p>
