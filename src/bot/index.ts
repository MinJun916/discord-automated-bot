import { ScheduledTask } from 'node-cron';
import { Client } from 'discord.js';
import {
  DAILY_MORNING_MESSAGE,
  DAILY_NIGHT_MESSAGE,
  MANAGEMENT_MESSAGE,
  WEEKLY_NIGHT_MESSAGE,
} from './botMessages';
import { scheduleMessage } from './bot.service';
import {
  dailyHardManagement,
  dailyMorning,
  dailyNight,
  dailySoftManagement,
  weeklyNight,
} from './botSchedule';

let currentSchedules: ScheduledTask[] = [];

const stopAllSchedules = () => {
  currentSchedules.forEach((schedule) => schedule.stop());
  currentSchedules = [];
};

export const setupBeforeProjectSchedule = (client: Client, targetChannelId: string) => {
  stopAllSchedules();

  currentSchedules.push(
    scheduleMessage(client, targetChannelId, dailyMorning, DAILY_MORNING_MESSAGE),
  );
  currentSchedules.push(scheduleMessage(client, targetChannelId, dailyNight, DAILY_NIGHT_MESSAGE));
  currentSchedules.push(
    scheduleMessage(client, targetChannelId, weeklyNight, WEEKLY_NIGHT_MESSAGE),
  );

  console.log('[스케줄] 프로젝트 기간 전 모드 활성화 (3개 스케줄)');
};

export const setupSoftManagementSchedule = (client: Client, targetChannelId: string) => {
  stopAllSchedules();

  currentSchedules.push(
    scheduleMessage(client, targetChannelId, dailyMorning, DAILY_MORNING_MESSAGE),
  );
  currentSchedules.push(scheduleMessage(client, targetChannelId, dailyNight, DAILY_NIGHT_MESSAGE));
  currentSchedules.push(
    scheduleMessage(client, targetChannelId, weeklyNight, WEEKLY_NIGHT_MESSAGE),
  );
  currentSchedules.push(
    scheduleMessage(client, targetChannelId, dailySoftManagement, MANAGEMENT_MESSAGE),
  );

  console.log('[스케줄] Soft 관리 모드 활성화 (4개 스케줄)');
};

export const setupHardManagementSchedule = (client: Client, targetChannelId: string) => {
  stopAllSchedules();

  currentSchedules.push(
    scheduleMessage(client, targetChannelId, dailyMorning, DAILY_MORNING_MESSAGE),
  );
  currentSchedules.push(scheduleMessage(client, targetChannelId, dailyNight, DAILY_NIGHT_MESSAGE));
  currentSchedules.push(
    scheduleMessage(client, targetChannelId, weeklyNight, WEEKLY_NIGHT_MESSAGE),
  );
  currentSchedules.push(
    scheduleMessage(client, targetChannelId, dailyHardManagement, MANAGEMENT_MESSAGE),
  );

  console.log('[스케줄] Hard 관리 모드 활성화 (4개 스케줄)');
};

export const switchProjectMode = (
  client: Client,
  targetChannelId: string,
  mode: 'before' | 'soft' | 'hard',
) => {
  switch (mode) {
    case 'before':
      setupBeforeProjectSchedule(client, targetChannelId);
      break;
    case 'soft':
      setupSoftManagementSchedule(client, targetChannelId);
      break;
    case 'hard':
      setupHardManagementSchedule(client, targetChannelId);
      break;
  }
};
