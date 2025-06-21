# Discord Module
A comprehensive Discord.js integration module for the Discord Bot Framework, providing automated client management, lifecycle hooks, and structured event handling.

## Quick Start
### Basic Setup
```typescript
import { defineDiscordConfig } from '@module/discord';
import { GatewayIntentBits } from 'discord.js';

// Define Discord configuration
export default defineDiscordConfig({
  token: process.env.DISCORD_TOKEN!,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  richPresence: {
    status: 'online',
    activities: [{
      name: 'with the Discord API',
      type: 0, // Playing
    }]
  }
});
```

### Module Registration
```typescript
import { defineKernelConfig } from '@framework/core';

export default defineKernelConfig({
  configFiles: [
    () => import('/path/to/your/discord/config.ts') // Should return the `DiscordConfig` object,
  ],
  modules: [
    () => import('@module/discord/module'),
  ],
});
```

### Using the Discord Client
```typescript
import { getDiscordClient } from '@module/discord';
import type { Client } from 'discord.js';

// Get the Discord client from helper function
const discord1 = await getDiscordClient();

// Or resolve from container
// Both methods return the same Discord client instance
const discord2: Client = await app.container.make('discord.client');
```

## Configuration
### Discord Configuration Interface
```typescript
interface DiscordConfig {
  token: string;                    // Bot token from Discord Developer Portal
  intents: IntentsBitField;        // Gateway intents for the bot
  richPresence?: PresenceData;     // Bot presence
}
```

### Configuration Examples
#### Basic Bot Configuration
```typescript
import { defineDiscordConfig } from '@module/discord';
import { GatewayIntentBits } from 'discord.js';

export default defineDiscordConfig({
  token: process.env.DISCORD_TOKEN!,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});
```

#### Advanced Configuration with Rich Presence
```typescript
import { defineDiscordConfig } from '@module/discord';
import { GatewayIntentBits, ActivityType } from 'discord.js';

export default defineDiscordConfig({
  token: process.env.DISCORD_TOKEN!,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  richPresence: {
    status: 'dnd',
    activities: [{
      name: 'Custom Activity',
      type: ActivityType.Watching,
      url: 'https://example.com'
    }]
  },
});
```

#### Environment-based Configuration
```typescript
import { defineDiscordConfig } from '@module/discord';
import { GatewayIntentBits } from 'discord.js';

const isProduction = process.env.NODE_ENV === 'production';

export default defineDiscordConfig({
  token: process.env.DISCORD_TOKEN!,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  richPresence: {
    status: isProduction ? 'online' : 'idle',
    activities: [{
      name: isProduction ? 'Serving users' : 'In development',
      type: 0,
    }]
  }
});
```

### Custom Event Handling
To add custom event handlers, register them after the module boots:

```typescript
import { ModuleInterface, Application } from '@framework/core';
import { Events } from 'discord.js';

export default class MyCustomModule implements ModuleInterface {
  public async start(app: Application): Promise<void> {
    const discord = await app.container.make('discord.client');
    
    discord.on(Events.MessageCreate, (message) => {
      console.log(`New message: ${message.content}`);
    });
    
    discord.on(Events.InteractionCreate, (interaction) => {
      if (interaction.isChatInputCommand()) {
        console.log(`Command used: ${interaction.commandName}`);
      }
    });
  }
}
```

## Container Bindings
The module registers the following container bindings:

```typescript
declare module '@framework/core' {
  interface ContainerBindings {
    'discord.client': Client; // Main Discord.js client
    'discord.logger': LoggerInterface; // Module-specific logger. Should not be used outside of the `discord` module
  }

  interface ConfigBindings {
    'discord': DiscordConfig; // Discord configuration
  }
}
```

## API Reference
### Helper Functions
* `getDiscordClient(app?: Application): Promise<Client>` - Retrieves the Discord client from the container.
* `defineDiscordConfig(config: Partial<DiscordConfig>): BaseConfig<DiscordConfig>` - Creates a type-safe Discord configuration object.

# License
This module is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
