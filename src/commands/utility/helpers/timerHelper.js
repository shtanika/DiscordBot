const timers = []; // Array to track active timers
let nextTimerId = 1; // Variable to keep track of the next available timer ID

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

// Function to handle the 'timer' command
async function handleTimer(interaction) {
    const timeInput = interaction.options.getString('duration'); // Get the duration from the interaction
    const timeInMs = parseTimeInput(timeInput.toLowerCase());

    if (timeInMs > 0) {
        const timerId = nextTimerId++; // Assign the next available timer ID and increment nextTimerId
        const userTag = `<@${interaction.user.id}>`; // Tag the user
        timers.push({ id: timerId, user: interaction.user.username, timeInMs, startTime: Date.now(), duration: timeInMs }); // Store startTime and total duration

        await interaction.reply(`timer ${timerId} set for ${timeInput} by ${interaction.user.username} ^_^`);

        // Wait for the specified duration
        setTimeout(() => {
            interaction.channel.send(`${userTag}, timer ${timerId} set for ${timeInput} is complete! :D`);
            // Remove the completed timer from the timers array
            const timerIndex = timers.findIndex(timer => timer.id === timerId);
            if (timerIndex !== -1) {
                timers.splice(timerIndex, 1); // Remove the timer from the array
            }

            // Reset nextTimerId to 1 if the array is empty
            if (timers.length === 0) {
                nextTimerId = 1; // Reset the ID counter
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

    await interaction.reply(`**timer ${timerId}** - time left: ${hours}h ${minutes}m ${seconds}s \nprogress: ${progressBar}`);
}

// Export the functions so they can be used in other modules
module.exports = { handleTimer, handleCheckTimer, parseTimeInput, timers };