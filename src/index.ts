import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  DiscordAPIError,
} from 'discord.js';
import {
  setupBeforeProjectSchedule,
  setupSoftManagementSchedule,
  setupHardManagementSchedule,
  switchProjectMode,
} from './bot';

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
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(botToken);

const registerCommands = async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, serverId), { body: commands });
    console.log('명령어가 성공적으로 등록되었습니다.');
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      console.error(`Discord API 에러 발생: ${error.message}`);
      console.error(`에러 코드: ${error.code}`);
      console.error(`HTTP 상태: ${error.status}`);
    } else {
      console.error('명령어 등록 중 에러 발생:', error);
    }
    throw error;
  }
};

client.once('clientReady', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  try {
    await registerCommands();

    switch (projectPhase) {
      case 'before':
        setupBeforeProjectSchedule(client, targetChannelId);
        console.log('프로젝트 기간 전 스케줄 활성화 완료');
        break;
      case 'soft':
        setupSoftManagementSchedule(client, targetChannelId);
        console.log('프로젝트 기간 중 스케줄 활성화 완료');
        break;
      case 'hard':
        setupHardManagementSchedule(client, targetChannelId);
        console.log('프로젝트 기간 중 스케줄 활성화 완료');
        break;
      default:
        console.error('프로젝트 단계가 설정되지 않았습니다.');
        break;
    }
  } catch (error) {
    console.error('봇 초기화 중 에러 발생:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === 'ping') {
      await interaction.reply('봇 생존 테스트 완료');
    }

    if (interaction.commandName === 'mode') {
      const mode = interaction.options.getString('type') as 'before' | 'soft' | 'hard';

      if (!mode || !['before', 'soft', 'hard'].includes(mode)) {
        await interaction.reply({
          content: '❌ 잘못된 모드입니다. before, soft, hard 중 하나를 선택해주세요.',
          ephemeral: true,
        });
        return;
      }

      switchProjectMode(client, targetChannelId, mode);

      const modeNames = {
        before: '프로젝트 기간 전',
        soft: 'Soft 관리 모드',
        hard: 'Hard 관리 모드',
      };

      await interaction.reply({
        content: `✅ 모드가 **${modeNames[mode]}**로 전환되었습니다.`,
        ephemeral: true,
      });
    }
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      console.error(`Discord API 에러 발생: ${error.message}`);
      console.error(`에러 코드: ${error.code}, HTTP 상태: ${error.status}`);

      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: '❌ 명령어 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            ephemeral: true,
          });
        } catch (replyError) {
          console.error('에러 응답 전송 실패:', replyError);
        }
      }
    } else {
      console.error('인터랙션 처리 중 예상치 못한 에러:', error);
    }
  }
});

client.login(botToken).catch((error) => {
  if (error instanceof DiscordAPIError) {
    console.error(`Discord 로그인 실패: ${error.message}`);
    console.error(`에러 코드: ${error.code}, HTTP 상태: ${error.status}`);
  } else {
    console.error('봇 로그인 중 예상치 못한 에러:', error);
  }
  process.exit(1);
});
