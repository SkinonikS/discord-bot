import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { DiscordGatewayBotResponse, DiscordGatewayInterface } from '#/types';

export interface DiscordGatewayBotRawResponse {
  url: string;
  shards: number;
  session_start_limit: {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
  };
}

// For testing purposes
export class ManualDiscordGateway implements DiscordGatewayInterface {
  public constructor(
    protected _shards: number = 1,
    protected _maxConcurrency: number = 1,
  ) { }

  public async getBotInfo(discordToken: string): Promise<Result<DiscordGatewayBotResponse, Error>> {
    return ok({
      shards: this._shards,
      sessionStartLimit: {
        total: 1000,
        remaining: 999,
        resetAfter: 3600000,
        maxConcurrency: this._maxConcurrency,
      },
    });
  }
}

export default class DiscordGateway implements DiscordGatewayInterface {
  public static readonly GATEWAY_URL = 'https://discord.com/api/v10/gateway/bot';

  public async getBotInfo(discordToken: string): Promise<Result<DiscordGatewayBotResponse, Error>> {
    try {
      const response = await fetch(DiscordGateway.GATEWAY_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bot ${discordToken}`,
        },
      });

      const json = await response.json() as DiscordGatewayBotRawResponse;
      return ok({
        shards: json.shards,
        sessionStartLimit: {
          total: json.session_start_limit.total,
          remaining: json.session_start_limit.remaining,
          resetAfter: json.session_start_limit.reset_after,
          maxConcurrency: json.session_start_limit.max_concurrency,
        },
      });
    } catch {
      return err(new Error('Unable to fetch Discord Gateway bot info.'));
    }
  }
}
