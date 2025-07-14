export default {
  slashCommands: {
    // Commands
    ping: {
      metadata: {
        name: 'пинг',
        description: 'Проверить задержку бота',
      },
      responses: {
        pinging: 'Пингование...',
        pingMs: 'Понг! Задержка составляет {{latency}}мс.',
      },
    },

    purge: {
      metadata: {
        name: 'отчистить',
        description: 'Удалить определенное количество сообщений из канала',
        options:  {
          amount: {
            name: 'количество',
            description: 'Количество сообщений для удаления (1-100)',
          },
        },
      },
      responses: {
        noMessages: 'В этом канале нет сообщений для удаления. Имейте в виду, что сообщения старше 14 дней не могут быть удалены.',
        onlyInGuild: 'Эта команда может использоваться только на сервере.',
        onlyInTextChannel: 'Эта команда может использоваться только в текстовых каналах.',
        fetchMessagesError: 'Произошла ошибка при попытке получить сообщения в этом канале. Попробуйте еще раз.',
        bulkDeleteError: 'Произошла ошибка при попытке удалить сообщения в этом канале. Попробуйте еще раз.',
        deleted_zero: 'Удалено {{count}} сообщений.',
        deleted_one: 'Удалено {{count}} сообщение.',
        deleted_two: 'Удалено {{count}} сообщения.',
        deleted_few: 'Удалено {{count}} сообщений.',
        deleted_many: 'Удалено {{count}} сообщений.',
      },
    },

    // Not a command, used for rate limiting
    rateLimit: 'Воу-воу, вы слшком часто отправляете команды. Вы сможете использовать команды снова <t:{{timestamp}}:R>',
  },
};
