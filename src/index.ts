import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
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

const rest = new REST({ version: '14' }).setToken(botToken);

const registerCommands = async () => {
  await rest.put(Routes.applicationGuildCommands(clientId, serverId), { body: commands });
  console.log('명령어가 성공적으로 등록되었습니다.');
};

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

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
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

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
});

client.login(botToken);
