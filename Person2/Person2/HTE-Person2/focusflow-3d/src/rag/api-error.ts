import { NextResponse } from "next/server";

export interface ApiErrorOptions {
  provider?: string;
  details?: unknown;
}

export function apiError(
  code: string,
  message: string,
  status: number,
  options?: ApiErrorOptions
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        provider: options?.provider,
        details: options?.details,
      },
    },
    { status }
  );
}

export function getErrorMessage(err: unknown, fallback = "Unknown error"): string {
  return err instanceof Error ? err.message : fallback;
}
