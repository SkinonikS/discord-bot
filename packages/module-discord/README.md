# Discord Module
A Discord.js integration module for the Discord Bot Framework, providing automated client management, lifecycle hooks, and structured event handling.

## Using the Discord Client
```typescript
import { getDiscordClient } from '@module/discord';
import type { Client } from 'discord.js';

// Get the Discord client from helper function
const discord1 = await getDiscordClient();

// Or resolve from container
// Both methods return the same Discord client instance
const discord2: Client = await app.container.make('discord.client');
```

### Configuration
```ts
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

### Custom Event Handling
You can listen for Discord events in your module by implementing the `boot` method of the `ModuleInterface`. Here's an example of how to handle message creation and interaction events:

```ts
import { ModuleInterface, Application } from '@framework/core';
import { Events } from '@framework/core/vendors/discordjs';

export default class MyCustomModule implements ModuleInterface {
  public async boot(app: Application): Promise<void> {
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

# API Reference
## Container Bindings
```ts
declare module '@framework/core' {
  interface ContainerBindings {
    'discord.client': Client; // Main Discord.js client
  }

  interface ConfigBindings {
    'discord': DiscordConfig; // Discord configuration
  }
}
```
