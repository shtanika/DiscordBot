const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check-timer')
		.setDescription('Checks time left by timer ID'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};