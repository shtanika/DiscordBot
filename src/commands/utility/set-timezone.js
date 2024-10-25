const { SlashCommandBuilder } = require('discord.js');
const { handleSetTimezone } = require('./helpers/remindHelper'); // Path to remindHelper.js

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-timezone')
		.setDescription('Sets the timezone of the user.')
		.addStringOption(option =>
            option.setName('timezone')
                .setDescription('The timezone abbreviation (e.g., EST, CET)')
                .setRequired(true)
                .addChoices(
                    { name: 'Eastern Standard Time (EST)', value: 'EST' },
                    { name: 'Central European Time (CET)', value: 'CET' },
                    { name: 'Central European Summer Time (CEST)', value: 'CEST' },
                    { name: 'Eastern Daylight Time (EDT)', value: 'EDT' },
                    { name: 'Coordinated Universal Time (UTC)', value: 'UTC' },
                )),
    
	async execute(interaction) {
        await handleSetTimezone(interaction); 
	},
};
