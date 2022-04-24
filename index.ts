import "reflect-metadata";

import { MongoClient } from "mongodb"; 

import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { Intents } from "discord.js";
import { Client } from "discordx";

import { readdir, readdirSync, readFileSync } from "fs";

import * as os from 'os';

var configText = readFileSync("./config.json", 'utf8');
const config = JSON.parse(configText);

const DB_LOG = config['DB']
const mongoClient = new MongoClient(DB_LOG);
const TOKEN = config['TOKEN']


export const bot = new Client({
  // To only use global commands (use @Guild for specific guild command), comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: config.PREFIX,
  },
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // Synchronize applications command permissions with Discord
  await bot.initApplicationPermissions();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
   await bot.clearApplicationCommands(
     ...bot.guilds.cache.map((g) => g.id)
   );

  console.log("Setting presence...")
  bot.user?.setPresence({
    "activities": [{
      "name": `AxeSay ❤️`,
      "type": "STREAMING",
      "url": "https://www.twitch.tv/night_idk"
    }],
    status: "dnd"
  });

  console.log(`${bot.user?.username}#${bot.user?.discriminator} is ready - discord.ts`);
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  bot.executeCommand(message, { caseSensitive: false });
});

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  const commands = readdirSync("./commands");
  for (var i = 0; i < commands.length; i++) {
    if (commands[i]?.endsWith(".js")) {
      await importx("./commands/" + commands[i] || "");
    }
  }

  const events = readdirSync("./events");
  for (var i = 0; i < events.length; i++) {
    if (events[i]?.endsWith(".js")) {
      await importx("./events/" + events[i] || "");
    }
  }
  
  
  

  // Log in with your bot token
  await bot.login(TOKEN);
}

run();
