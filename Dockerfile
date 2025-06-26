FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=@app/discord-bot --prod /prod/discord-bot
RUN pnpm deploy --filter=@app/discord-bot-k8s-operator --prod /prod/discord-bot-k8s-operator

FROM base AS discord-bot
RUN apk add ffmpeg
COPY --from=build /prod/discord-bot /prod/discord-bot
WORKDIR /prod/discord-bot
CMD ["pnpm", "start"]

FROM base AS discord-bot-k8s-operator
COPY --from=build /prod/discord-bot-k8s-operator /prod/discord-bot-k8s-operator
WORKDIR /prod/discord-bot-k8s-operator
CMD ["pnpm", "start"]
