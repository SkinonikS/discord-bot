export default {
  slashCommands: {
    ping: {
      metadata: {
        name: 'ping',
        description: 'Check the bot\'s latency',
      },
      success: 'Pong! Latency is {{latency}}ms.',
    },

    purge: {
      metadata: {
        name: 'purge',
        description: 'Delete a number of messages from the channel',
        options: {
          amount: {
            name: 'amount',
            description: 'Number of messages to delete (1-100)',
          },
        },
      },
      validation: {
        amount: 'Please provide a number between 1 and 100.',
        guild: 'This command can only be used in a server.',
        textChannel: 'This command can only be used in text channels.',
      },
      errors: {
        fetchMessages: 'There was an error trying to fetch messages in this channel. Try again.',
        bulkDelete: 'There was an error trying to delete messages in this channel. Try again.',
      },
      success_zero: 'Deleted {{count}} messages.',
      success_one: 'Deleted {{count}} message.',
      success_other: 'Deleted {{count}} messages.',
    },
  },
};
