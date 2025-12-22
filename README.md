# Discord Automated Bot

Discord 서버에서 자동으로 메시지를 전송하는 봇입니다. 프로젝트 진행 단계에 따라 스케줄된 메시지를 전송하여 팀원들과 소통을 돕습니다.

## 기능

- **슬래시 명령어**:
  - `/ping`: 봇 생존 테스트
  - `/test`: 테스트 메시지 출력
  - `/mode`: 프로젝트 모드 전환 (before, soft, hard)
  - `/reminder`: 리마인더 메시지 전송
  - `/meeting`: 회의 일정 알림 메시지 전송
  - `/deploy`: 배포 완료 알림 메시지 전송 (BE/FE 구분)
- **자동 메시지 전송**: 프로젝트 단계에 따라 자동으로 메시지 전송
  - **아침 메시지**: 평일 오전 9시 (월~금)
  - **일일 마무리 메시지**: 평일 오후 7시 (월~목)
  - **주간 마무리 메시지**: 금요일 오후 7시
  - **관리 메시지**: 프로젝트 진행 중 모드에 따라 추가 알림 전송

## 기술 스택

- **TypeScript**
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
- `PROJECT_PHASE`: 프로젝트 단계 (`before`, `soft`, `hard` 중 하나)
  - `before`: 프로젝트 기간 전 모드 (기본 스케줄만 실행)
  - `soft`: Soft 관리 모드 (기본 스케줄 + 관리 메시지 3회/일)
  - `hard`: Hard 관리 모드 (기본 스케줄 + 관리 메시지 4회/일)

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

## 프로젝트 모드별 스케줄

### Before 모드 (프로젝트 기간 전)

- **아침 메시지**: 매주 월~금 오전 9시 (KST)
- **일일 마무리 메시지**: 매주 월~목 오후 7시 (KST)
- **주간 마무리 메시지**: 매주 금요일 오후 7시 (KST)

### Soft 모드 (Soft 관리 모드)

Before 모드의 모든 스케줄 + 다음 추가 스케줄:

- **관리 메시지**: 매주 월~금 오전 10시, 오후 2시, 오후 6시 (KST)

### Hard 모드 (Hard 관리 모드)

Before 모드의 모든 스케줄 + 다음 추가 스케줄:

- **관리 메시지**: 매주 월~금 오전 10시, 오후 2시, 오후 4시, 오후 6시 (KST)

모든 스케줄은 `Asia/Seoul` 타임존을 기준으로 실행됩니다.

## 프로젝트 구조

```
discord-automated-bot/
├── src/
│   ├── index.ts              # 메인 진입점 및 봇 초기화
│   └── bot/
│       ├── index.ts          # 스케줄 설정 및 모드 전환 로직
│       ├── botSchedule.ts    # 크론 스케줄 표현식 정의
│       ├── botMessages.ts   # 메시지 템플릿
│       └── bot.service.ts   # 스케줄 메시지 전송 서비스
├── dist/                     # 빌드 출력 디렉토리
├── package.json
├── tsconfig.json
└── README.md
```

## 명령어

### `/ping`

봇 생존 테스트 명령어입니다. 봇이 정상적으로 작동하는지 확인할 수 있습니다.

### `/test`

테스트 메시지를 출력하는 명령어입니다. 봇의 메시지 전송 기능을 테스트할 때 사용할 수 있습니다.

### `/mode`

프로젝트 모드를 전환하는 명령어입니다. 실행 중인 스케줄을 중지하고 새로운 모드의 스케줄을 시작합니다.

**옵션:**

- `type`: 모드 선택 (필수)
  - `before`: 프로젝트 기간 전 모드
  - `soft`: Soft 관리 모드
  - `hard`: Hard 관리 모드

**사용 예시:**

```
/mode type:before
/mode type:soft
/mode type:hard
```

**참고:** 모드 전환 시 기존에 실행 중이던 모든 스케줄이 중지되고, 선택한 모드의 스케줄이 새로 시작됩니다.

### `/reminder`

리마인더 메시지를 포맷팅하여 채널에 전송하는 명령어입니다.

**옵션:**
- `time`: 시간 (필수) - 예: "15:00", "오후 3시"
- `message`: 리마인더 메시지 (필수)

**사용 예시:**
```
/reminder time:"15:00" message:"PR 리뷰 확인"
/reminder time:"오후 3시" message:"코드 리뷰 시간"
```

**동작:**
- 명령어 실행 시 채널에 포맷팅된 리마인더 메시지가 전송됩니다
- 사용자에게는 확인 메시지가 표시됩니다 (Ephemeral - 본인만 보임)

### `/meeting`

회의 일정 알림 메시지를 포맷팅하여 채널에 전송하는 명령어입니다.

**옵션:**
- `time`: 회의 시간 (필수) - 예: "15:00", "오후 3시"
- `title`: 회의 제목 (필수)
- `description`: 회의 설명 (선택사항)

**사용 예시:**
```
/meeting time:"15:00" title:"스프린트 회의"
/meeting time:"오후 3시" title:"주간 회의" description:"주간 진행 상황 공유"
```

**동작:**
- 명령어 실행 시 채널에 포맷팅된 회의 일정 알림 메시지가 전송됩니다
- 사용자에게는 확인 메시지가 표시됩니다 (Ephemeral - 본인만 보임)

### `/deploy`

배포 완료 알림 메시지를 지정된 채널에 전송하는 명령어입니다.

**옵션:**
- `type`: 배포 타입 선택 (필수)
  - `BE (Backend)`: 백엔드 서버 배포
  - `FE (Frontend)`: 프론트엔드 서버 배포

**사용 예시:**
```
/deploy type:BE
/deploy type:FE
```

**동작:**
- 명령어 실행 시 지정된 배포 알림 채널(ID: 1442798960178892870)에 배포 완료 메시지가 전송됩니다
- 메시지 형식: `## YYYY-MM-DD HH:mm:ss (BE or FE) 서버 배포 완료되었습니다.`
- 날짜시간은 한국 시간대(Asia/Seoul) 기준으로 자동 포맷팅됩니다
- 사용자에게는 확인 메시지가 표시됩니다 (Ephemeral - 본인만 보임)

## 라이선스

MIT
