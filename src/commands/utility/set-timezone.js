const { SlashCommandBuilder } = require('discord.js');
const { handleSetTimezone } = require('./helpers/remindHelper'); // Path to remindHelper.js

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-timezone')
		.setDescription('Sets the timezone of the user.')
		.addStringOption(option =>
            option.setName('timezone')
                .setDescription('The timezone abbreviation (e.g., EST, CET)')
                .setRequired(true)),
    
	async execute(interaction) {
        await handleSetTimezone(interaction); 
	},
};
