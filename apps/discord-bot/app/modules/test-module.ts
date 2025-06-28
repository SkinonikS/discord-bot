import type { Application, ModuleInterface } from '@framework/core';

export default class TestModule implements ModuleInterface {
  readonly id = 'test-module';
  readonly author = 'Your Name';
  readonly version = '1.0.0';

  public async boot(app: Application): Promise<void> {
    const discord = await app.container.make('discord.client');
  }
}
