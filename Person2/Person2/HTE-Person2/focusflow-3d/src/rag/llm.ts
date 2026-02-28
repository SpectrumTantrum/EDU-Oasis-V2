/**
 * LLM 抽象層 — 可切換多種後端
 * 優先順序：LLM_PROVIDER 指定 → MINIMAX → OPENAI → ANTHROPIC → OLLAMA → BEDROCK
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import type { LanguageModel } from 'ai';

const PROVIDER = process.env.LLM_PROVIDER?.toLowerCase(); // 'minimax' | 'openai' | 'anthropic' | 'ollama' | 'bedrock'

function assertBedrockEnv(): void {
  const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
  if (!region) {
    throw new Error(
      'Bedrock requires AWS region. Set AWS_REGION (or AWS_DEFAULT_REGION) when LLM_PROVIDER=bedrock.'
    );
  }

  const hasStaticCreds = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  const hasProfile = Boolean(process.env.AWS_PROFILE);
  if (!hasStaticCreds && !hasProfile) {
    throw new Error(
      'Bedrock requires AWS credentials. Set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY, or set AWS_PROFILE when LLM_PROVIDER=bedrock.'
    );
  }
}

function getMinimaxModel(useChatModel: boolean): LanguageModel {
  const { createMinimax } = require('vercel-minimax-ai-provider');
  const minimax = createMinimax({ apiKey: process.env.MINIMAX_API_KEY });
  const fast = process.env.MINIMAX_MODEL_ID ?? 'MiniMax-M2.1-lightning';
  const chat = process.env.MINIMAX_CHAT_MODEL_ID ?? 'MiniMax-M2.1';
  return minimax(useChatModel ? chat : fast) as LanguageModel;
}

function getOpenAIModel(useChatModel: boolean): LanguageModel {
  const { createOpenAI } = require('@ai-sdk/openai');
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const fast = process.env.OPENAI_MODEL_ID ?? 'gpt-4o-mini';
  const chat = process.env.OPENAI_CHAT_MODEL_ID ?? 'gpt-4o';
  return openai(useChatModel ? chat : fast) as LanguageModel;
}

function getAnthropicModel(useChatModel: boolean): LanguageModel {
  const { createAnthropic } = require('@ai-sdk/anthropic');
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const fast = process.env.ANTHROPIC_MODEL_ID ?? 'claude-3-5-haiku-20241022';
  const chat = process.env.ANTHROPIC_CHAT_MODEL_ID ?? 'claude-3-5-sonnet-20241022';
  return anthropic(useChatModel ? chat : fast) as LanguageModel;
}

function getOllamaModel(useChatModel: boolean): LanguageModel {
  const { ollama } = require('ollama-ai-provider');
  const fast = process.env.OLLAMA_MODEL_ID ?? 'llama3.2';
  const chat = process.env.OLLAMA_CHAT_MODEL_ID ?? process.env.OLLAMA_MODEL_ID ?? 'llama3.2';
  return ollama(useChatModel ? chat : fast) as LanguageModel;
}

function getBedrockModel(useChatModel: boolean): LanguageModel {
  assertBedrockEnv();
  const { bedrock } = require('@ai-sdk/amazon-bedrock');
  const fast = process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-haiku-20240307-v1:0';
  const chat = process.env.BEDROCK_CHAT_MODEL_ID ?? 'anthropic.claude-3-sonnet-20240229-v1:0';
  return useChatModel ? bedrock(chat) : bedrock(fast);
}

function resolveProvider(): 'minimax' | 'openai' | 'anthropic' | 'ollama' | 'bedrock' {
  if (PROVIDER === 'minimax' || process.env.MINIMAX_API_KEY) return 'minimax';
  if (PROVIDER === 'openai' || process.env.OPENAI_API_KEY) return 'openai';
  if (PROVIDER === 'anthropic' || process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (PROVIDER === 'ollama') return 'ollama';
  if (PROVIDER === 'bedrock') {
    assertBedrockEnv();
    return 'bedrock';
  }
  throw new Error(
    'No LLM provider configured. Set MINIMAX_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or LLM_PROVIDER=ollama (see .env.example)'
  );
}

/**
 * 取得當前設定的 LLM。useChatModel: true 用於導師串流，false 用於擷取/測驗/解釋/總結。
 */
export function getModel(useChatModel = false): LanguageModel {
  const p = resolveProvider();
  if (p === 'minimax') return getMinimaxModel(useChatModel);
  if (p === 'openai') return getOpenAIModel(useChatModel);
  if (p === 'anthropic') return getAnthropicModel(useChatModel);
  if (p === 'ollama') return getOllamaModel(useChatModel);
  return getBedrockModel(useChatModel);
}

export function getProviderName(): string {
  try {
    return resolveProvider();
  } catch {
    return 'none';
  }
}
