require('dotenv').config({ path: './src/../.env' });

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Register slash commands
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },

    {
        name: 'timer',
        description: 'Sets a timer for the specified duration.',
        options: [
            {
                type: 3, // STRING type
                name: 'duration',
                description: 'The duration for the timer (e.g., "1hr 20min 30s").',
                required: true,
            },
        ],
    },

    {
        name: 'remind',
        description: 'Sets a reminder',
        options: [
            {
                name: 'time',
                type: 3, // STRING type
                description: 'Time or date for the reminder (e.g., 13:31 or 10/16)',
                required: true
            },
            {
                name: 'message',
                type: 3, // STRING type
                description: 'The message to be reminded about',
                required: true
            }
        ],
    },

    {
        name: 'check-timer',
        description: 'Checks time left by timer ID',
        options: [
            {
                name: 'id',
                type: 4, //INT type
                description: 'ID of timer',
                required: true
            }
        ],
    },


    {
        name: 'help',
        description: 'Lists all available commands and their usage.',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// Array to store active timers
const timers = [];

// Function to handle the 'ping' command
async function handlePing(interaction) {
    await interaction.reply('Pong!');
}

// Function to handle the 'timer' command
async function handleTimer(interaction) {
    const timeInput = interaction.options.getString('duration'); // Get the duration from the interaction
    const timeInMs = parseTimeInput(timeInput.toLowerCase());

    if (timeInMs > 0) {
        const timerId = timers.length + 1; // Increment timer ID
        const userTag = `<@${interaction.user.id}>`; // Tag the user
        timers.push({ id: timerId, user: interaction.user.username, timeInMs, startTime: Date.now(), duration: timeInMs }); // Store startTime and total duration

        await interaction.reply(`timer ${timerId} set for ${timeInput} by ${interaction.user.username} ^_^`);

        // Wait for the specified duration
        setTimeout(() => {
            interaction.channel.send(`${userTag}, your timer ${timerId} set for ${timeInput} is complete! :D`);
            // Remove the completed timer from the timers array
            const timerIndex = timers.findIndex(timer => timer.id === timerId);
            if (timerIndex !== -1) {
                timers.splice(timerIndex, 1); // Remove the timer from the array
            }
        }, timeInMs);
    } else {
        await interaction.reply('invalid time format >:( pls use smth like "1hr 20min 30s"');
    }
}

// Function to handle the 'checktimer' command
async function handleCheckTimer(interaction) {
    const timerId = interaction.options.getInteger('id'); // Get the timer ID as integer
    const timer = timers.find(timer => timer.id === timerId);

    if (!timer) {
        await interaction.reply(`timer with ID ${timerId} not found :o`);
        return;
    }

    // Calculate time left
    const timeElapsed = Date.now() - timer.startTime;
    const timeLeft = timer.duration - timeElapsed;

    if (timeLeft <= 0) {
        await interaction.reply(`timer ${timerId} has alr finished :o`);
        return;
    }

    // Convert milliseconds to hours, minutes, and seconds
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Create a simple progress bar
    const progressBarLength = 20; // Length of the progress bar
    const progress = Math.min((timeElapsed / timer.duration) * progressBarLength, progressBarLength);
    const progressBar = `[${'█'.repeat(progress)}${'░'.repeat(progressBarLength - progress)}]`;

    await interaction.reply(`**timer ${timerId}** - time left: ${hours}:${minutes}:${seconds}\nprogress: ${progressBar}`);
}

// Function to handle the 'remind' command
async function handleRemind(interaction) {
    const timeInput = interaction.options.getString('time'); // e.g. "13:31" or "10/16 13:00"
    const reminderMessage = interaction.options.getString('message'); // The reminder message

    const reminderTime = parseReminderTime(timeInput);

    if (!reminderTime) {
        await interaction.reply('invalid time format >:( use "H:MM", "HH:MM", "MM/DD", or "MM/DD HH:MM"');
        return;
    }

    const now = new Date();
    const timeDifference = reminderTime - now;

    if (timeDifference <= 0) {
        await interaction.reply('the time you provided has already passed :o');
        return;
    }

    // Reply that reminder is set
    await interaction.reply(`reminder set for ${reminderTime} with the message: "${reminderMessage}" ^_^`);

    // Schedule the reminder
    const userTag = `<@${interaction.user.id}>`; // Tag the user
    setTimeout(() => {
        interaction.channel.send(`${userTag}, reminder: ${reminderMessage}`);
    }, timeDifference);
}

// Function to handle the 'help' command
async function handleHelp(interaction) {
    const helpMessage = `
**Available Commands:**
1. **/ping**: Replies with "Pong!".
2. **/timer <duration>**: Sets a timer for the specified duration (e.g. "/timer 1hr 20min 30s").
3. **/remind <time> <message>**: Sets reminder for specified date/time (e.g. "/remind 10/15 13:00 eat")
4. **/checktimer <id>**: Checks the remaining time of a specific timer by its ID.
5. **/help**: Lists all available commands and their usage.
    `;
    await interaction.reply(helpMessage);
}

// Helper function to convert the time string into milliseconds
function parseTimeInput(input) {
    const timeRegex = /(\d+)\s*(s|sec|seconds?|m|min|minutes?|h|hr|hours?)/g;
    let totalMilliseconds = 0;
    let match;

    while ((match = timeRegex.exec(input)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];

        if (unit.startsWith('s')) {
            totalMilliseconds += value * 1000; // seconds to milliseconds
        } else if (unit.startsWith('m')) {
            totalMilliseconds += value * 60 * 1000; // minutes to milliseconds
        } else if (unit.startsWith('h')) {
            totalMilliseconds += value * 60 * 60 * 1000; // hours to milliseconds
        }
    }

    return totalMilliseconds;
}

// Helper function to parse the time and date input
function parseReminderTime(input) {
    const now = new Date();

    // Case 1: Time only (e.g., "13:31" or "9:55")
    if (/^\d{1,2}:\d{2}$/.test(input)) { // <--- Modified regex to allow 1 or 2 digits for hours
        const [hours, minutes] = input.split(':').map(Number);

        // Ensure valid 24-hour time (hours must be between 0-23, minutes between 0-59)
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null; // Invalid time input
        }

        const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1); // Move to next day if time has passed today
        }
        return reminderTime;
    }

    // Case 2: Date only (e.g., "10/16")
    if (/^\d{2}\/\d{2}$/.test(input)) {
        const [month, day] = input.split('/').map(Number);
        return new Date(now.getFullYear(), month - 1, day); // Remind at midnight
    }

    // Case 3: Date and time (e.g., "10/15 13:00" or "10/15 9:55")
    if (/^\d{2}\/\d{2} \d{1,2}:\d{2}$/.test(input)) { // <--- Modified regex to allow 1 or 2 digits for hours
        const [datePart, timePart] = input.split(' ');
        const [month, day] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);

        // Ensure valid 24-hour time (hours must be between 0-23, minutes between 0-59)
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null; // Invalid time input
        }

        return new Date(now.getFullYear(), month - 1, day, hours, minutes);
    }

    return null; // Invalid format
}

// Interaction event listener
client.on('interactionCreate', async (interaction) => {
    console.log(`Received interaction: ${interaction.commandName}`);
    if (!interaction.isCommand()) return;

    // Parse and execute the command
    switch (interaction.commandName) {
        case 'ping':
            await handlePing(interaction);
            break;
        case 'timer':
            await handleTimer(interaction);
            break;
        case 'help':
            await handleHelp(interaction);
            break;
        case 'check-timer':
            await handleCheckTimer(interaction);
            break;
        case 'remind':
            await handleRemind(interaction);
            break;
        default:
            await interaction.reply(`Unknown command: ${interaction.commandName}`);
            break;
    }
});


// Login to Discord with client's token
client.login(process.env.BOT_TOKEN);