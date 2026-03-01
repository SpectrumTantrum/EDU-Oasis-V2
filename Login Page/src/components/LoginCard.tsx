"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { AuthResult } from "@/lib/mockAuth";
import { StatusState } from "./StatusToast";

type LoginCardProps = {
  onLogin: (payload: { email: string; password: string; remember: boolean }) => Promise<AuthResult>;
  status: StatusState;
  attempts: number;
  reducedMotion: boolean;
};

type FieldErrors = Partial<Record<"email" | "password", string>>;

const MIN_PASSWORD_LENGTH = 6;

export function LoginCard({ onLogin, status, attempts, reducedMotion }: LoginCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const firstError = errors.email ? emailRef.current : errors.password ? passwordRef.current : null;
    firstError?.focus();
  }, [errors]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!email.trim()) {
      next.email = "必填欄位，請輸入帳號";
    }
    if (!password.trim()) {
      next.password = "必填欄位，請輸入密碼";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = "至少 6 碼，請重新確認";
    }
    return next;
  };

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    setSuccess(false);
    const result = await onLogin({ email, password, remember });
    setLoading(false);
    if (result.ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 1200);
    } else {
      setSuccess(false);
    }
  };

  return (
    <section
      className={clsx(
        "glass-card card-grid w-full max-w-md mx-auto p-8 space-y-6 text-oasis-text",
        reducedMotion ? "" : "shadow-glow"
      )}
      aria-label="登入卡片"
    >
      <div className="space-y-2">
        <p className="text-xs text-oasis-muted">OASIS ED</p>
        <h1 className="text-xl leading-7">登入 OASIS</h1>
        <p className="text-sm text-oasis-muted">
          以像素風玻璃質感進入，完成登入即可解鎖互動片段。
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-3">
          <label className="block text-xs tracking-wide text-oasis-muted" htmlFor="email">
            帳號 / Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            className={clsx("pixel-input", errors.email && "error")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p id="email-error" className="text-xs text-oasis-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-oasis-muted">
            <label htmlFor="password">密碼</label>
            <button
              type="button"
              className="text-oasis-accent underline underline-offset-4 focus-ring"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
            >
              {showPassword ? "隱藏密碼" : "顯示密碼"}
            </button>
          </div>
          <div className="relative">
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={clsx("pixel-input pr-24", errors.password && "error")}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-oasis-muted">
              至少 6 碼
            </span>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-xs text-oasis-error">
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-oasis-muted">
          <label className="flex items-center gap-2 cursor-pointer select-none focus-ring">
            <input
              type="checkbox"
              className="h-4 w-4 accent-oasis-accent"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            記住我
          </label>
          <a href="#" onClick={(e) => e.preventDefault()} className="focus-ring">
            忘記密碼
          </a>
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            className={clsx(
              "pixel-btn w-full",
              loading && "pointer-events-none",
              !loading && !success ? "hover:scale-[1.02]" : ""
            )}
            disabled={loading}
            aria-live="polite"
          >
            {loading ? "登入中..." : success ? "成功 ✓" : "登入"}
          </button>
          <p className="text-xs text-oasis-muted">
            支援 Enter 提交、Esc 關閉彈層。測試帳號：<code>pilot@oasis.ed</code> /{" "}
            <code>pixelpass</code>
          </p>
        </div>
      </form>

      <div className="text-xs text-oasis-muted space-y-1">
        <p>嘗試次數：{attempts} / 3</p>
        {status.type === "error" ? (
          <p className="text-oasis-error">{status.message}</p>
        ) : null}
        {status.type === "success" ? (
          <p className="text-oasis-accent-strong">0.8 秒後將跳轉下一步</p>
        ) : null}
      </div>
    </section>
  );
}
