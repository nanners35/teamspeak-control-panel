// Discord bot setup
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}!`);
  console.log('Ready to help manage your servers!');
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.reply('Pong! 🏓');
  }
});

// Replace 'YOUR_BOT_TOKEN_HERE' with your actual bot token
client.login('MTQ5NjI1MDU0MjI3NDM3OTgxNg.G4cA2d.dTQlPeFxdAmXVjGg77ZjKbk3D3_915QBmLEL6g');
