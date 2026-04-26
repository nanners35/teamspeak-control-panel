const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

// Replace this with your ACTUAL bot token from Discord Developer Portal
client.login('MTQ5NjI1MDU0MjI3NDM3OTgxNg.G_eQ5M.OasF9C7mkXko4hAeWLq16L0c8MBZ8Ms8ud9zAs');