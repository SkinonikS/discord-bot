# Discord Bot Framework
A TypeScript-first Discord bot framework with dependency injection and modular architecture.

## Quick Start
```bash
git clone https://github.com/your-username/discord-bot.git
cd discord-bot
pnpm install
cp apps/bot/.env.example apps/bot/.env
# Edit .env with your Discord token
pnpm build
pnpm start
```

## Architecture
```
discord-bot/
├── packages/                    # Framework modules
│   ├── framework-core/          # Core framework & DI
│   ├── module-discord/          # Discord.js integration
│   ├── module-slash-commands/   # Slash commands system
│   ├── module-logger/           # Logging infrastructure
│   ├── module-http-api/         # HTTP API & health checks
│   ├── module-prometheus/       # Metrics collection
│   ├── module-distube/          # Music bot functionality
│   └── module-redis-commands/   # Redis command queue
└── apps/bot/                    # Main bot application
```

## 🛠️ Development
```bash
pnpm dev          # Start with hot reload
pnpm build        # Build all packages
```

## Docker
```bash
docker build . --target bot --tag app/bot:latest --no-cache
cd apps/bot
docker-compose up -d
```

## 📚 Documentation
Detailed documentation is available in each module's README file:
- Framework Core: `packages/framework-core/README.md`
- Discord Module: `packages/module-discord/README.md`  
- Slash Commands: `packages/module-slash-commands/README.md`

## License
Licensed under the MIT License. See `LICENSE` for details.
