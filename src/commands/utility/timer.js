const { SlashCommandBuilder } = require('discord.js');
const { handleTimer } = require('./helpers/timerHelper'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Sets a timer for the specified duration.')
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration for the timer (e.g., "1hr 20min 30s").')
                .setRequired(true)
        ),

    async execute(interaction) {
        await handleTimer(interaction); 
    },
};