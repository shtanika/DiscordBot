require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// Designate prefix
const PREFIX = "!";

// Array to store active timers
const timers = [];

// Function to handle the 'ping' command
async function handlePing(message) {
  await message.channel.send('Pong!');
}

// Function to handle the 'timer' command
async function handleTimer(message, timeInput) {
  const timeInMs = parseTimeInput(timeInput);

  if (timeInMs > 0) {
      const timerId = timers.length + 1; // Increment timer ID
      timers.push({ id: timerId, user: message.author.username, timeInMs });
      await message.channel.send(`timer ${timerId} set for ${timeInput} by ${message.author.username} ^_^`);

      // Wait for the specified duration
      setTimeout(() => {
          message.channel.send(`timer ${timerId} set by ${message.author.username} complete o: time's up for ${timeInput} :D`);
          // Remove the completed timer from the timers array
          const timerIndex = timers.findIndex(timer => timer.id === timerId);
          if (timerIndex !== -1) {
              timers.splice(timerIndex, 1); // Remove the timer from the array
          }
      }, timeInMs);
  } else {
      await message.channel.send('invalid time format >:( pls use something like "1hr 20min 30s"');
  }
}

// Function to handle the 'help' command
async function handleHelp(message) {
  const helpMessage = `
**Available Commands:**
1. **!ping**: Replies with "Pong!".
2. **!timer <time>**: Sets a timer for the specified duration (e.g., "!timer 1hr 20min 30s").
3. **!help**: Lists all available commands and their usage.
  `;
  await message.channel.send(helpMessage);
}

// Message event listener
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check if the message starts with the designated prefix
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.trim().substring(PREFIX.length).split(/\s+/);
  const command = args[0].toLowerCase(); // Get the command

  // Parse and execute the command
  switch (command) {
      case 'ping':
          await handlePing(message);
          break;
      case 'timer':
          const timeInput = args.slice(1).join(' '); // Get the time input
          await handleTimer(message, timeInput);
          break;
      case 'help':
          await handleHelp(message);
          break;
      default:
          await message.channel.send(`Unknown command: ${command}`);
          break;
  }
});

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

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);

