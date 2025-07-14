export default {
  slashCommands: {
    // Commands
    ping: {
      metadata: {
        name: 'ping',
        description: 'Check the bot\'s latency',
      },
      responses: {
        pinging: 'Pinging...',
        pingMs: 'Pong! Latency is {{latency}}ms.',
      },
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
      responses: {
        noMessages: 'There are no messages to delete in this channel. Keep in mind that messages older than 14 days cannot be deleted.',
        onlyInGuild: 'This command can only be used in a server.',
        onlyInTextChannel: 'This command can only be used in text channels.',
        fetchMessagesError: 'There was an error trying to fetch messages in this channel. Try again.',
        bulkDeleteError: 'There was an error trying to delete messages in this channel. Try again.',
        deleted_zero: 'Deleted {{count}} messages.',
        deleted_one: 'Deleted {{count}} message.',
        deleted_other: 'Deleted {{count}} messages.',
      },
    },

    // Not a command, used for rate limiting
    rateLimit: 'Whoa there, you\'re sending commands too fast. You can use commands again <t:{{timestamp}}:R>',
  },
};
