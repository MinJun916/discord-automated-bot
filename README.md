# Discord Automated Bot

Discord 서버에서 자동으로 메시지를 전송하는 봇입니다. 프로젝트 진행 단계에 따라 스케줄된 메시지를 전송하여 팀원들과 소통을 돕습니다.

## 기능

- **슬래시 명령어**: `/ping` 명령어로 봇 생존 테스트
- **자동 메시지 전송**: 프로젝트 기간 전(`before`) 단계에서 자동으로 메시지 전송
  - **아침 메시지**: 평일 오전 9시 (월~금)
  - **일일 마무리 메시지**: 평일 오후 7시 (월~목)
  - **주간 마무리 메시지**: 금요일 오후 7시

## 기술 스택

- **TypeScript**: 타입 안정성을 위한 언어
- **Discord.js v14**: Discord API 클라이언트
- **node-cron**: 스케줄링을 위한 크론 작업
- **dotenv**: 환경 변수 관리

## 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/MinJun916/discord-automated-bot.git
cd discord-automated-bot
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
DISCORD_BOT_TOKEN=your_bot_token
CLIENT_ID=your_client_id
SERVER_ID=your_server_id
TARGET_CHANNEL_ID=your_target_channel_id
PROJECT_PHASE=before
```

### 환경 변수 설명

- `DISCORD_BOT_TOKEN`: Discord 봇 토큰 (Discord Developer Portal에서 발급)
- `CLIENT_ID`: Discord 애플리케이션 클라이언트 ID
- `SERVER_ID`: 메시지를 전송할 Discord 서버 ID
- `TARGET_CHANNEL_ID`: 메시지를 전송할 채널 ID
- `PROJECT_PHASE`: 프로젝트 단계 (`before` 또는 `during`)

## 실행 방법

### 개발 모드

```bash
npm run dev
```

### 프로덕션 모드

1. 빌드

```bash
npm run build
```

2. 실행

```bash
npm start
```

## 스케줄 정보

프로젝트 단계가 `before`로 설정된 경우, 다음 스케줄로 메시지가 전송됩니다:

- **아침 메시지**: 매주 월~금 오전 9시 (KST)
- **일일 마무리 메시지**: 매주 월~목 오후 7시 (KST)
- **주간 마무리 메시지**: 매주 금요일 오후 7시 (KST)

모든 스케줄은 `Asia/Seoul` 타임존을 기준으로 실행됩니다.

## 프로젝트 구조

```
discord-automated-bot/
├── src/
│   ├── index.ts              # 메인 진입점
│   └── messages/
│       ├── botSchedule.ts     # 스케줄 설정
│       └── botMessages.ts    # 메시지 템플릿
├── package.json
├── tsconfig.json
└── README.md
```

## 명령어

- `/ping`: 봇 생존 테스트

## 라이선스

MIT
