import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  DiscordAPIError,
  MessageFlags,
} from 'discord.js';
import {
  setupBeforeProjectSchedule,
  setupSoftManagementSchedule,
  setupHardManagementSchedule,
  switchProjectMode,
} from './bot';
import { TEST_MESSAGE, createReminderMessage, createMeetingMessage } from './bot/botMessages';

type Token = string | undefined;

const botToken: Token = process.env.DISCORD_BOT_TOKEN;
const clientId: Token = process.env.CLIENT_ID;
const serverId: Token = process.env.SERVER_ID;
const targetChannelId: Token = process.env.TARGET_CHANNEL_ID;
const projectPhase: Token = process.env.PROJECT_PHASE;

if (!botToken || !clientId || !serverId || !targetChannelId || !projectPhase) {
  throw new Error('환경 변수가 설정되지 않았습니다.');
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('봇 생존 테스트'),
  new SlashCommandBuilder().setName('test').setDescription('테스트 메시지 출력'),
  new SlashCommandBuilder()
    .setName('mode')
    .setDescription('프로젝트 모드 전환')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('모드 선택')
        .setRequired(true)
        .addChoices(
          { name: 'before', value: 'before' },
          { name: 'soft', value: 'soft' },
          { name: 'hard', value: 'hard' },
        ),
    ),
  new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('리마인더 메시지를 전송합니다')
    .addStringOption((option) =>
      option.setName('time').setDescription('시간 (예: 15:00, 오후 3시)').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('message').setDescription('리마인더 메시지').setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('meeting')
    .setDescription('회의 일정 알림 메시지를 전송합니다')
    .addStringOption((option) =>
      option.setName('time').setDescription('회의 시간 (예: 15:00, 오후 3시)').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('회의 제목').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('description').setDescription('회의 설명 (선택사항)').setRequired(false),
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(botToken);

const registerCommands = async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, serverId), { body: commands });
    console.log('[명령어] 등록 완료');
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      console.error(
        `[에러] Discord API: ${error.message} (코드: ${error.code}, 상태: ${error.status})`,
      );
    } else {
      console.error('[에러] 명령어 등록 실패:', error);
    }
    throw error;
  }
};

client.once('clientReady', async () => {
  console.log(`[봇] 로그인 완료: ${client.user?.tag}`);

  try {
    await registerCommands();

    switch (projectPhase) {
      case 'before':
        setupBeforeProjectSchedule(client, targetChannelId);
        break;
      case 'soft':
        setupSoftManagementSchedule(client, targetChannelId);
        break;
      case 'hard':
        setupHardManagementSchedule(client, targetChannelId);
        break;
      default:
        console.error('[에러] 프로젝트 단계가 설정되지 않았습니다.');
        break;
    }
  } catch (error) {
    console.error('[에러] 봇 초기화 중 에러 발생:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const userTag = interaction.user.tag;
  const commandName = interaction.commandName;

  try {
    if (interaction.commandName === 'ping') {
      console.log(`[명령어] /ping 실행 - 사용자: ${userTag}`);
      await interaction.reply('봇 생존 테스트 완료');
      console.log(`[명령어] /ping 완료 - 사용자: ${userTag}`);
    }

    if (interaction.commandName === 'test') {
      console.log(`[명령어] /test 실행 - 사용자: ${userTag}`);
      await interaction.reply(TEST_MESSAGE);
      console.log(`[명령어] /test 완료 - 사용자: ${userTag}`);
    }

    if (interaction.commandName === 'mode') {
      const mode = interaction.options.getString('type') as 'before' | 'soft' | 'hard';

      if (!mode || !['before', 'soft', 'hard'].includes(mode)) {
        console.log(`[명령어] /mode 실행 실패 - 사용자: ${userTag}, 이유: 잘못된 모드`);
        await interaction.reply({
          content: '❌ 잘못된 모드입니다. before, soft, hard 중 하나를 선택해주세요.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      console.log(`[명령어] /mode 실행 - 사용자: ${userTag}, 모드: ${mode}`);
      switchProjectMode(client, targetChannelId, mode);

      const modeNames = {
        before: '프로젝트 기간 전',
        soft: 'Soft 관리 모드',
        hard: 'Hard 관리 모드',
      };

      await interaction.reply({
        content: `✅ 모드가 **${modeNames[mode]}**(으)로 전환되었습니다.`,
        flags: MessageFlags.Ephemeral,
      });
      console.log(`[명령어] /mode 완료 - 사용자: ${userTag}, 모드: ${mode}`);
    }

    if (interaction.commandName === 'reminder') {
      const time = interaction.options.getString('time');
      const message = interaction.options.getString('message');

      if (!time || !message) {
        console.log(`[명령어] /reminder 실행 실패 - 사용자: ${userTag}, 이유: 필수 옵션 누락`);
        await interaction.reply({
          content: '❌ 시간과 메시지를 모두 입력해주세요.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      console.log(`[명령어] /reminder 실행 - 사용자: ${userTag}, 시간: ${time}`);

      try {
        const reminderMessage = createReminderMessage(time, message);

        if (
          interaction.channel &&
          interaction.channel.isTextBased() &&
          'send' in interaction.channel
        ) {
          await interaction.channel.send(reminderMessage);
        }

        await interaction.reply({
          content: '✅ 리마인더 메시지가 전송되었습니다.',
          flags: MessageFlags.Ephemeral,
        });
        console.log(`[명령어] /reminder 완료 - 사용자: ${userTag}`);
      } catch (error) {
        console.error(`[에러] /reminder 메시지 전송 실패 - 사용자: ${userTag}:`, error);
        await interaction.reply({
          content: '❌ 메시지 전송 중 오류가 발생했습니다.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    if (interaction.commandName === 'meeting') {
      const time = interaction.options.getString('time');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');

      if (!time || !title) {
        console.log(`[명령어] /meeting 실행 실패 - 사용자: ${userTag}, 이유: 필수 옵션 누락`);
        await interaction.reply({
          content: '❌ 시간과 제목을 모두 입력해주세요.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      console.log(`[명령어] /meeting 실행 - 사용자: ${userTag}, 시간: ${time}, 제목: ${title}`);

      try {
        const meetingMessage = createMeetingMessage({
          time,
          title,
          description: description || undefined,
        });

        if (
          interaction.channel &&
          interaction.channel.isTextBased() &&
          'send' in interaction.channel
        ) {
          await interaction.channel.send(meetingMessage);
        }

        await interaction.reply({
          content: '✅ 회의 일정 알림 메시지가 전송되었습니다.',
          flags: MessageFlags.Ephemeral,
        });
        console.log(`[명령어] /meeting 완료 - 사용자: ${userTag}`);
      } catch (error) {
        console.error(`[에러] /meeting 메시지 전송 실패 - 사용자: ${userTag}:`, error);
        await interaction.reply({
          content: '❌ 메시지 전송 중 오류가 발생했습니다.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      console.error(
        `[에러] Discord API: ${error.message} (코드: ${error.code}, 상태: ${error.status}) - 명령어: /${commandName}, 사용자: ${userTag}`,
      );

      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: '❌ 명령어 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            flags: MessageFlags.Ephemeral,
          });
        } catch (replyError) {
          console.error('[에러] 에러 응답 전송 실패:', replyError);
        }
      }
    } else {
      console.error(
        `[에러] 인터랙션 처리 실패 - 명령어: /${commandName}, 사용자: ${userTag}:`,
        error,
      );
    }
  }
});

client.login(botToken).catch((error) => {
  if (error instanceof DiscordAPIError) {
    console.error(
      `[에러] Discord 로그인 실패: ${error.message} (코드: ${error.code}, 상태: ${error.status})`,
    );
  } else {
    console.error('[에러] 봇 로그인 실패:', error);
  }
  process.exit(1);
});
