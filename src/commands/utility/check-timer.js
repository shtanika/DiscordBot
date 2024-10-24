const { SlashCommandBuilder } = require('discord.js');
const { handleCheckTimer } = require('./helpers/timerHelper'); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check-timer')
		.setDescription('Checks time left by timer ID')
		.addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID of timer')
                .setRequired(true)
        ),

	async execute(interaction) {
		await handleCheckTimer(interaction);
	},
};