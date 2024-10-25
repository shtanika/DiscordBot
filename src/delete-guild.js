require('dotenv').config({ path: './src/../.env' });

const { REST, Routes } = require('discord.js');
// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Removing all guild commands...');
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: [] } // Clear all guild commands
    );
    console.log('Guild commands cleared!');
  } catch (error) {
    console.error(error);
  }
})();