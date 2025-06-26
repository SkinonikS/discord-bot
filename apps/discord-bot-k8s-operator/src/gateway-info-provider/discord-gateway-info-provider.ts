import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { GatwayInfoProviderInterface, GatewayInfo } from '#/types';

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

export default class DiscordGatewayInfoProvider implements GatwayInfoProviderInterface {
  public static readonly GATEWAY_URL = 'https://discord.com/api/v10/gateway/bot';

  public async fetchInfo(discordToken: string): Promise<Result<GatewayInfo, Error>> {
    try {
      const response = await fetch(DiscordGatewayInfoProvider.GATEWAY_URL, {
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
