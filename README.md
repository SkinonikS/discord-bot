# About this Project
A TypeScript-first Discord bot framework with dependency injection and modular architecture.
The architecture of this project is higly inspired by the [Laravel](https://laravel.com/) framework and how it extends its functionality through 'Service Providers'.
In this project instead of 'Service Providers' we use 'Modules' to extend the functionality of the core framework.

> [!WARNING]
> This is a hobby project, so bugs are to be expected.

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
│   ├── module-cron/                # Cron jobs scheduler
│   ├── module-redis/               # Redis integration
└── apps/
    ├── discord-bot/                # Main Discord bot application
    └── discord-bot-k8s-operator/   # Kubernetes operator
```

## License
Licensed under the MIT License. See [LICENSE](LICENSE) for details.
