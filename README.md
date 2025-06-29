# Discord Bot Framework
A TypeScript-first Discord bot framework with dependency injection and modular architecture.

## Project Structure
This project is structured into packages and applications, allowing for modular development and easy integration of various functionalities.
```
discord-bot/
├── packages/
│   ├── framework-core/             # Core framework & DI
│   ├── module-discord/             # Discord.js integration
│   ├── module-slash-commands/      # Slash commands system
│   ├── module-logger/              # Logging infrastructure
│   ├── module-http-api/            # HTTP API & health checks
│   ├── module-prometheus/          # Metrics collection
│   ├── module-distube/             # Music bot functionality
└── apps/
    ├── discord-bot/                # Main Discord bot application
    └── discord-bot-k8s-operator/   # Kubernetes operator
```

## License
Licensed under the MIT License. See `LICENSE` for details.
