# Discord Slash Commands Module

A comprehensive Discord slash commands module for the Discord Bot Framework, providing command registration, execution, cooldown management, and autocomplete functionality.

## Quick Start
### Basic Setup
```typescript
import { defineSlashCommandsConfig } from '@module/slash-commands';

export default defineSlashCommandsConfig({
  commands: [
    () => import('./commands/ping'),
    () => import('./commands/stats'),
    () => import('./commands/help'),
  ],
});
```

### Module Registration
```typescript
import { defineKernelConfig, LazyModuleLoader } from '@framework/core';

export default defineKernelConfig({
  configFiles: [
    () => import('/path/to/your/slash-commands/config.ts'), // Should return the `SlashCommandConfig` object
  ],
  modules: new LazyModuleLoader([
    () => import('@module/slash-commands/module'),
  ]),
});
```

### Creating Commands
Create slash commands by implementing the `SlashCommandInterface`:

```typescript
import { SlashCommandInterface } from '@module/slash-commands';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default class PingCommand implements SlashCommandInterface {
  public readonly name = 'ping';
  public readonly cooldown = 5; // 5 seconds cooldown
  
  public get metadata(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Replies with Pong!');
  }
  
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Pong!');
  }
}
```

## Configuration
### Slash Commands Configuration Interface
```typescript
interface SlashCommandConfig {
  commands: SlashCommandResolver[];  // Array of command resolvers
}
```

### Registering Commands
```typescript
import { defineSlashCommandsConfig } from '@module/slash-commands';

export default defineSlashCommandsConfig({
  commands: [
    () => import('./commands/ping'),
    () => import('./commands/userinfo'),
    () => import('./commands/serverinfo'),
  ],
});
```

## Creating Commands
### Simple
```typescript
import { SlashCommandInterface } from '@module/slash-commands';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default class ExampleCommand implements SlashCommandInterface {
  public readonly name = 'example';
  public readonly cooldown = 3; // seconds
  
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

### Custom Options
```typescript
import { SlashCommandInterface } from '@module/slash-commands';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default class UserInfoCommand implements SlashCommandInterface {
  public readonly name = 'userinfo';
  public readonly cooldown = 10;
  
  public get metadata(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Get information about a user')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('The user to get info about')
          .setRequired(false)
      );
  }
  
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') ?? interaction.user;
    
    await interaction.reply({
      content: `User: ${user.tag}\nID: ${user.id}\nCreated: ${user.createdAt.toDateString()}`,
      ephemeral: true
    });
  }
}
```

### Autocomplete
```typescript
import { SlashCommandInterface } from '@module/slash-commands';
import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  AutocompleteInteraction 
} from 'discord.js';

export default class SearchCommand implements SlashCommandInterface {
  public readonly name = 'search';
  public readonly cooldown = 5;
  
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
      .addStringOption(option =>
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
```typescript
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
  public readonly cooldown = 15;
  
  public constructor(protected readonly _app: Application) {}
  
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

### Cooldown Management
Built-in cooldown system prevents command spam:

```typescript
export default class MyCommand implements SlashCommandInterface {
  public readonly cooldown = 30; // 30 second cooldown
  
  // When a user tries to use the command before cooldown expires,
  // they get an automatic error message
}
```

## Container Bindings
The module registers the following container bindings:

```typescript
declare module '@framework/core' {
  interface ContainerBindings {
    'slash-commands': SlashCommandManager; // Main command manager
    'slash-commands.logger': LoggerInterface; // Module-specific logger
  }

  interface ConfigBindings {
    'slash-commands': SlashCommandConfig; // Commands configuration
  }
}
```

## API Reference
### SlashCommandInterface

```typescript
interface SlashCommandInterface {
  readonly name: string; // Command name
  readonly cooldown: number; // Cooldown in seconds
  get metadata(): SlashCommandBuilder; // Command metadata
  execute(interaction: ChatInputCommandInteraction): Promise<void>; // Execute handler
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>; // Optional autocomplete
}
```

### SlashCommandManager
The main manager class that handles command registration and execution:

#### Methods

* `register(commands: SlashCommandResolver[]): Promise<void>` - Register commands
* `execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>>` - Execute command
* `autocomplete(interaction: AutocompleteInteraction): Promise<Result<void, Error>>` - Handle autocomplete
* `deployToGuilds(guilds: Guild[]): Promise<Result<void, Error>>` - Deploy commands to guilds

### Helper Functions
* `defineSlashCommandsConfig(config: Partial<SlashCommandConfig>): SlashCommandConfig` - Creates a type-safe slash commands configuration:
* `getSlashCommandManager(app?: Application): Promise<SlashCommandManager>` - Retrieves the command manager from the container.

# License
This module is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
