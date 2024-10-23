const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('Sets a reminder'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};