export const ROLE_MENTION = '<@&1440856773568364656>';

export const DAILY_MORNING_MESSAGE = `
# 🌞 Morning Brief
${ROLE_MENTION}

궁금한 부분이나 이슈 있으시면 이야기해주세요!
오늘도 화이팅!
`;

export const DAILY_NIGHT_MESSAGE = `
# 🌙 Daily Wrap-up
${ROLE_MENTION}

오늘도 너무 수고 많으셨고, 내일 뵐게요!
`;

export const WEEKLY_NIGHT_MESSAGE = `
# 🎉 Weekly Wrap-up
${ROLE_MENTION}

이번 주도 너무 수고 많으셨어요!
주말 잘 보내시고 다음 주에 뵐게요!
`;

export const MANAGEMENT_MESSAGE = `
# ❗️ 진행 상황 공유 알림봇
${ROLE_MENTION}

현재 진행중인 내용을 스레드로 공유해주세요! 
`;

export const TEST_MESSAGE = `
# 🔍 테스트 메시지
${ROLE_MENTION}

테스트 메시지입니다.
`;

export const createReminderMessage = (time: string, message: string) => {
  return `
  # ⏰ 리마인더
  ${ROLE_MENTION}

  📅 **시간**: ${time}
  💬 **내용**: ${message}
  `;
};

export const createMeetingMessage = ({
  time,
  title,
  description,
}: {
  time: string;
  title: string;
  description?: string;
}) => {
  const descriptionPart = description ? `📄 **내용**:\n  ${description}` : '';

  return `
  # 📅 회의 일정 알림
  ${ROLE_MENTION}

  📅 **시간**: ${time}
  💬 **제목**: ${title}
  ${descriptionPart}
  `;
};
