FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=@app/bot --prod /prod/bot

FROM base AS bot
RUN apk add ffmpeg
COPY --from=build /prod/bot /prod/bot
WORKDIR /prod/bot

CMD ["pnpm", "start"]