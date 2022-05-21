require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

/*
// Designate prefix
const PREFIX = "!"

client.on('message', (message) => {
	if (message.author.bot) return;
	if(message.content.startsWith(PREFIX)){
		const [CMD_NAME, ...args] = message.content.trim().substring(1)
		.split(/\s+/);

	console.log(CMD_NAME);
	console.log(args);	
	}

})
*/

// Register a slash command against the Discord API
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [{
  name: 'ping',
  description: 'Replies with Pong!'
}]; 

const rest = new REST({ version: '9' }).setToken('token');

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
  
	if (interaction.commandName === 'ping') {
	  await interaction.reply('Pong!');
	}
  });

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);