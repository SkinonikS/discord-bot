export default {
  slashCommands: {
    ping: {
      metadata: {
        name: 'пинг',
        description: 'Проверить задержку бота',
      },
      pinging: 'Пингование...',
      success: 'Понг! Задержка составляет {{latency}}мс.',
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
      validation: {
        amount: 'Пожалуйста, укажите число от 1 до 100.',
        guild: 'Эта команда может использоваться только на сервере.',
        textChannel: 'Эта команда может использоваться только в текстовых каналах.',
      },
      errors: {
        fetchMessages: 'Произошла ошибка при попытке получить сообщения в этом канале. Попробуйте еще раз.',
        bulkDelete: 'Произошла ошибка при попытке удалить сообщения в этом канале. Попробуйте еще раз.',
      },
      // Success messages
      success_zero: 'Удалено {{count}} сообщений.',
      success_one: 'Удалено {{count}} сообщение.',
      success_two: 'Удалено {{count}} сообщения.',
      success_few: 'Удалено {{count}} сообщений.',
      success_many: 'Удалено {{count}} сообщений.',
    },
    music: {

    },
  },
};
