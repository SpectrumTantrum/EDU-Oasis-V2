export type AuthResult = {
  ok: boolean;
  message: string;
  lockHint?: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockAuthenticate(params: {
  email: string;
  password: string;
  attemptCount: number;
}) {
  const { email, password, attemptCount } = params;
  const jitter = 420 + Math.random() * 480;
  await delay(jitter);

  const isValid = email.trim().toLowerCase() === "pilot@oasis.ed" && password === "pixelpass";

  if (isValid) {
    return {
      ok: true,
      message: "登入成功，準備進入 OASIS"
    } satisfies AuthResult;
  }

  const baseMessage = "帳號或密碼錯誤";
  if (attemptCount >= 2) {
    return {
      ok: false,
      message: baseMessage,
      lockHint: "已連續 3 次錯誤，可嘗試重設密碼"
    } satisfies AuthResult;
  }

  return {
    ok: false,
    message: baseMessage
  } satisfies AuthResult;
}
