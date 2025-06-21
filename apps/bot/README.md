# Discord Bot Application
The main Discord bot application built on the Discord Bot Framework. This is a complete bot implementation showcasing the framework's capabilities with slash commands, music functionality, and monitoring features.

## Quick Start
```bash
# Install dependencies (from repository root)
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Build and start
pnpm build
pnpm start
```

## Configuration
### Environment Variables
```env
DISCORD_TOKEN=your_discord_bot_token_here
HTTP_API_PORT=3000
HTTP_API_HOST=localhost
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
NODE_ENV=production
# ... Other environment variables as needed
```

### Module Configuration
Configuration files are located in the `config/` directory:
- `config/discord.ts` - Discord client settings
- `config/slash-commands.ts` - Command registration
- `config/logger.ts` - Logging configuration
- `config/http-api.ts` - HTTP API settings
- `config/distube.ts` - Music bot configuration
- `config/prometheus.ts` - Metrics configuration
- `config/redis-commands.ts` - Redis queue settings

## Project Structure
```
apps/bot/
├── commands/           # Slash commands
│   ├── ping.ts        # Basic ping command
│   └── ...            # Additional commands
├── config/            # Module configurations
│   ├── discord.ts     # Discord client config
│   ├── slash-commands.ts
│   └── ...            # Other module configs
├── bootstrap/         # Application bootstrapping
│   └── kernel.ts      # Kernel configuration
├── bin/              # Entry points
│   └── start.ts      # Main application entry
└── .env.example      # Environment template
```

# License
This project is licensed under the MIT License. See the `LICENSE` file for details.
