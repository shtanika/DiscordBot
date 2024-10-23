const timers = []; // Array to track active timers

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

module.exports = { handleTimer };