import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { setupBeforeProjectSchedule } from './messages/botSchedule';

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

const commands = [new SlashCommandBuilder().setName('ping').setDescription('봇 생존 테스트')].map(
  (command) => command.toJSON(),
);

const rest = new REST({ version: '14' }).setToken(botToken);

const registerCommands = async () => {
  await rest.put(Routes.applicationGuildCommands(clientId, serverId), { body: commands });
  console.log('명령어가 성공적으로 등록되었습니다.');
};

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  await registerCommands();

  if (projectPhase === 'before') {
    setupBeforeProjectSchedule(client, targetChannelId);
    console.log('프로젝트 기간 전 스케줄 활성화 완료');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('봇 생존 테스트 완료');
  }
});

client.login(botToken);
