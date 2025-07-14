# Discord Slash-Commands Module
A slash commands module which provides a structured way to create and manage slash commands for bot.

## Registering Module
To use the slash commands module, you need to register it in your application. You can do this by adding the module to your application's configuration file, typically located at `bootstrap/kernel.ts`. Here's how to register the module:

```ts
import { defineKernelConfig } from '@framework/core/config';

export default defineKernelConfig({
  config: [
    () => import('path/to/your/config/slash-commands'),
  ],
  modules: [
    () => import('@module/slash-commands/module'),
    // other modules...
  ],
});
```

Configuration also SHOULD be provided, otherwise application will rise an exception if it wont find an `slash-commands` configuration file.

If you do not want to use this module, you can simply remove it from the `modules` array in your configuration file, just make sure that other modules that depend on it are also removed.

## Registering Slash Commands
This module allows you to define and register slash commands easily, with support for autocomplete and dependency injection

There are two main ways to register slash commands:
* Manually, adding command import in your `config/slash-commands.ts` file.
* Programmatically, using the `SlashCommandManager` class.

### Programmatically
To register slash commands programmatically, you can create a custom module that implements the `ModuleInterface` and uses the `SlashCommandManager` to register commands. Here's an example of how to do this:
```ts
import { SlashCommandManager } from '@module/slash-commands';
import { Application } from '@framework/core/app';

export default class MyModule implements ModuleInterface {
  // We are registering the module in the `boot` method.
  // Its because the `boot` method is called after every module is registered.
  public async boot(app: Application): Promise<void> {
    const manager = await app.container.make('slash-commands');
    
    // Register your commands here
    await manager.register([
      () => import('path/to/your/command'),
      // ...
    ]);
  }
}
```

### Manual
To manually register slash commands, you can use the `registerSlashCommands` function in your `start/kernel.ts` file. Here's an example of how to do this:
```ts
import { defineSlashCommandConfig } from '@module/slash-commands/config';

export default defineSlashCommandConfig({
  commands: [
    () => import('path/to/your/command'),
    // ...
  ],
});
```

## Example Usage
This module allows you to define and register slash commands easily, with support for autocomplete and dependency injection

### Creating Slash-Commands
Creating a slash command is straightforward. You need to implement the `SlashCommandInterface` and define the command metadata using `SlashCommandBuilder`. Here's an example of a simple slash command:

```ts
import { SlashCommandInterface } from '@module/slash-commands';
import { SlashCommandBuilder, ChatInputCommandInteraction } from '@framework/core/vendors/discordjs';

export default class ExampleCommand implements SlashCommandInterface {
  public readonly name = 'example';
  
  public get metadata(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('An example command');
  }
  
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('This is an example command!');
  }
}
```

### Autocomplete
If you want to add autocomplete functionality to your command, you can implement the `autocomplete` method. Here's an example of a command with autocomplete:

```ts
import { SlashCommandInterface } from '@module/slash-commands';
import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  AutocompleteInteraction 
} from '@framework/core/vendors/discordjs';

export default class SearchCommand implements SlashCommandInterface {
  public readonly name = 'search';
  
  private readonly searchOptions = [
    'JavaScript tutorials',
    'TypeScript documentation',
    'Discord.js guide',
    'Node.js examples',
    'React components'
  ];
  
  public get metadata(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Search for something')
      .addStringOption((option) =>
        option
          .setName('query')
          .setDescription('What to search for')
          .setRequired(true)
          .setAutocomplete(true)
      );
  }
  
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    await interaction.reply(`Searching for: ${query}`);
  }
  
  public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    
    const filtered = this.searchOptions.filter(option =>
      option.toLowerCase().includes(focusedValue)
    );
    
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
    );
  }
}
```

### Dependency Injection
You can inject dependencies into your command classes using the `containerInjections` static property. Here's an example of a command that uses dependency injection to access the application instance:

```ts
import type { Application } from '@framework/core';
import { SlashCommandInterface } from '@module/slash-commands';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default class DatabaseCommand implements SlashCommandInterface {
  static containerInjections = {
    _constructor: {
      dependencies: ['app'],
    },
  };

  public readonly name = 'database';
  
  public constructor(
    protected readonly _app: Application,
  ) { }
  
  public get metadata(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Database statistics');
  }
  
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const database = await this._app.container.make('database');
    const stats = await database.getStats();
    
    await interaction.reply(`Database has ${stats.totalRecords} records`);
  }
}
```


### Helper Functions
You can use helper functions to get the slash command manager from the application without needing to inject them into your classes:
```ts
import { getSlashCommandManager } from '@module/slash-commands';

// Get default Redis client directly
// Same as resolving 'slash-commands'
const manager = await getSlashCommandManager();
await manager.register([
  () => import('path/to/your/command'),
]);
```

## API Reference

```ts
interface SlashCommandInterface {
  readonly name: string;
  get metadata(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export interface RateLimiterInterface {
  hit(userId: Snowflake): Promise<RateLimitResponse> | RateLimitResponse;
}

export type RateLimitMessage = (app: Application, expiredTimestamp: number, locale: string) => Promise<string> | string;

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}

export type SlashCommandResolver = BaseResolver<new (...args: unknown[]) => SlashCommandInterface>;

export interface SlashCommandConfig extends Record<string, unknown> {
  commands: SlashCommandResolver[];
  rateLimiter: {
    driver: RateLimiterDriverInterface;
    points: number;
    durationMs: number;
    message: (app: Application, expiredTimestamp: number, locale: string) => Promise<string> | string;
  };
}

export interface RateLimiterGlobalConfig {
  points: number;
  durationMs: number;
}

export interface RateLimiterDriverInterface {
  create(app: Application, config: RateLimiterGlobalConfig): Promise<RateLimiterInterface>;
}
```

## Container Bindings
```ts
declare module '@framework/core/app' {
  interface ContainerBindings {
    'slash-commands': Manager;
  }

  interface ConfigBindings {
    'slash-commands': SlashCommandConfig;
  }
}
```
