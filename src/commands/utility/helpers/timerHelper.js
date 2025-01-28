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
        const startTime = Date.now();
        const totalDuration = timeInMs;

        timers.push({ id: timerId, user: interaction.user.username, timeInMs, startTime, duration: timeInMs }); // Store startTime and total duration

        const initialReply = await interaction.reply(`timer ${timerId} set for ${timeInput} by ${interaction.user.username} ^_^`);
        const messageID = initialReply.id;

        // Function to update the progress bar
        const interval = setInterval(async () => {
            const timeElapsed = Date.now() - startTime;
            const timeLeft = totalDuration - timeElapsed;

            // Ensure the progress is calculated correctly at zero
            const isComplete = timeLeft <= 0;
            const progressBarLength = 20; // Length of the progress bar
            const progress = isComplete ? progressBarLength : Math.floor((timeElapsed / totalDuration) * progressBarLength);

            // Update the progress bar
            const progressBar = `[${'█'.repeat(progress)}${'░'.repeat(progressBarLength - progress)}]`;

            // Convert milliseconds to hours, minutes, and seconds
            const hours = Math.floor(Math.max(timeLeft, 0) / (1000 * 60 * 60));
            const minutes = Math.floor((Math.max(timeLeft, 0) % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((Math.max(timeLeft, 0) % (1000 * 60)) / 1000);

            try {
                // Use message ID to edit the original message instead of interaction.editReply
                const channel = interaction.channel;
                const message = await channel.messages.fetch(messageID);
                await message.edit(`**timer ${timerId}** - time left: ${hours}h ${minutes}m ${seconds}s\nprogress: ${progressBar}`);

                if (isComplete) {
                    clearInterval(interval); // Stop updating the progress bar
                    interaction.channel.send(`${userTag}, timer ${timerId} set for ${timeInput} is complete! :D`);
                    
                    // Remove the completed timer from the timers array
                    const timerIndex = timers.findIndex(timer => timer.id === timerId);
                    if (timerIndex !== -1) timers.splice(timerIndex, 1);

                    // Reset nextTimerId to 1 if the array is empty
                    if (timers.length === 0) nextTimerId = 1;
                }
            } catch (error) {
                console.error('Error updating timer:', error);
                clearInterval(interval);
            }
        }, 1000); // Update every second
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