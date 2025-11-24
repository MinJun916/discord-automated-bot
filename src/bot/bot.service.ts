import cron, { ScheduledTask } from 'node-cron';
import { Client, DiscordAPIError } from 'discord.js';

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
      try {
        const channel = await client.channels.fetch(targetChannelId);
        if (!channel || !channel.isTextBased() || !('send' in channel)) {
          console.warn(`채널을 찾을 수 없거나 텍스트 채널이 아닙니다: ${targetChannelId}`);
          return;
        }

        await channel.send(message);
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          console.error(`스케줄된 메시지 전송 실패: ${error.message}`);
          console.error(`에러 코드: ${error.code}, HTTP 상태: ${error.status}`);
        } else {
          console.error('스케줄된 메시지 전송 중 예상치 못한 에러:', error);
        }
      }
    },
    {
      timezone: options.timezone || 'Asia/Seoul',
    },
  );
};
