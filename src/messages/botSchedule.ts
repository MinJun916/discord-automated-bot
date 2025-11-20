import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { DAILY_MESSAGE, MORNING_MESSAGE, WEEKLY_MESSAGE } from './botMessages';

export const setupBeforeProjectSchedule = (client: Client, targetChannelId: string) => {
  cron.schedule(
    '0 9 * * 1-5',
    async () => {
      const channel = await client.channels.fetch(targetChannelId);
      if (!channel || !channel.isTextBased()) return;

      await (channel as TextChannel).send(MORNING_MESSAGE);
    },
    {
      timezone: 'Asia/Seoul',
    },
  );

  cron.schedule(
    '0 19 * * 1-4',
    async () => {
      const channel = await client.channels.fetch(targetChannelId);
      if (!channel || !channel.isTextBased()) return;

      await (channel as TextChannel).send(DAILY_MESSAGE);
    },
    {
      timezone: 'Asia/Seoul',
    },
  );

  cron.schedule(
    '0 19 * * 5',
    async () => {
      const channel = await client.channels.fetch(targetChannelId);
      if (!channel || !channel.isTextBased()) return;

      await (channel as TextChannel).send(WEEKLY_MESSAGE);
    },
    {
      timezone: 'Asia/Seoul',
    },
  );

  console.log('프로젝트 기간 전 스케줄 활성화 완료');
};

export const setupDuringProjectSchedule = (client: Client, targetChannelId: string) => {
  console.log('프로젝트 기간 중 스케줄 활성화 완료');
};
