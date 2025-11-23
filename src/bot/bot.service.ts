import cron, { ScheduledTask } from 'node-cron';
import { Client } from 'discord.js';

interface ScheduleOptions {
  timezone?: string;
}

export const scheduleMessage = (
  client: Client,
  targetChannelId: string,
  cronExpression: string,
  message: string,
  options: ScheduleOptions = {},
): ScheduledTask => {
  return cron.schedule(
    cronExpression,
    async () => {
      const channel = await client.channels.fetch(targetChannelId);
      if (!channel || !channel.isTextBased() || !('send' in channel)) return;

      await channel.send(message);
    },
    {
      timezone: options.timezone || 'Asia/Seoul',
    },
  );
};
