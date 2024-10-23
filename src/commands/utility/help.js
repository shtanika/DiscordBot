const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Lists all available commands and their usage.'),
	async execute(interaction) {
        const helpMessage = `
**Available Commands:**
1. **/ping**: Replies with "Pong!".
2. **/timer <duration>**: Sets a timer for the specified duration (e.g. "/timer 1hr 20min 30s").
3. **/remind <time> <message>**: Sets reminder for specified date/time (e.g. "/remind 10/15 13:00 eat")
4. **/checktimer <id>**: Checks the remaining time of a specific timer by its ID.
5. **/help**: Lists all available commands and their usage.
    `;
		await interaction.reply(helpMessage);
	},
};