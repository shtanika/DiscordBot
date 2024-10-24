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

module.exports = { handleRemind };