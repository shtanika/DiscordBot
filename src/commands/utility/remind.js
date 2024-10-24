const { SlashCommandBuilder } = require('discord.js');
const { handleRemind } = require('./helpers/remindHelper'); // Adjust this path if needed

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('Sets a reminder')
		.addStringOption(option =>
            option.setName('time')
                .setDescription('Time or date for the reminder (e.g., 13:31 or 10/16)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to be reminded about')
                .setRequired(true)),
    
	async execute(interaction) {
        await handleRemind(interaction); 
	},
};