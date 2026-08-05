/**
 * Server-side prompt compression utility for token reduction
 * Used by aiProvider.ts to compress prompts before sending to LLM
 */

export interface CompressionResult {
  compressed: string;
  originalLength: number;
  compressedLength: number;
  tokensSaved: number;
  compressionRatio: number;
}

const CHARS_PER_TOKEN = 4;

// Filler phrases that can be safely removed without losing meaning
const FILLER_PATTERNS = [
  /\b(?:por favor|please|kindly)\b/gi,
  /\b(?:obrigado|thank you|thanks)\b/gi,
  /\b(?:bem,\s*|well,\s*|so,\s*|now,\s*)/gi,
  /\b(?:eu\s+acho\s+que|I\s+think\s+that)\b/gi,
  /\b(?:na\s+verdade|actually|in\s+fact)\b/gi,
  /\b(?:como\s+você\s+sabe|as\s+you\s+know)\b/gi,
  /\b(?:deixe-me|let\s+me)\b/gi,
];

const REPEATED_LABEL_RE = /(\[[A-Z]{2}\])\s*\1+/g;
const MULTIPLE_BLANKS = /\n{3,}/g;
const MULTIPLE_SPACES = /[ \t]{2,}/g;
const LINE_WHITESPACE = /^[ \t]+|[ \t]+$/gm;

/**
 * Compress a single prompt string by removing redundant content.
 */
export function compressPrompt(input: string): CompressionResult {
  const originalLength = input.length;
  let result = input;

  result = result.replace(MULTIPLE_SPACES, " ");
  result = result.replace(LINE_WHITESPACE, "");
  result = result.replace(MULTIPLE_BLANKS, "\n\n");

  for (const pattern of FILLER_PATTERNS) {
    result = result.replace(pattern, "");
  }

  result = result.replace(REPEATED_LABEL_RE, "$1");
  result = result.replace(/#{1,6}\s+/g, "");
  result = result.replace(/\*{3,}/g, "**");
  result = result.replace(/_{3,}/g, "_");

  const lines = result.split("\n");
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 20 && !trimmed.includes("{") && !trimmed.includes("<")) {
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
    }
    deduped.push(line);
  }
  result = deduped.join("\n");
  result = result.trim();

  const compressedLength = result.length;
  const tokensSaved = Math.ceil((originalLength - compressedLength) / CHARS_PER_TOKEN);
  const compressionRatio = originalLength > 0 ? compressedLength / originalLength : 1;

  return { compressed: result, originalLength, compressedLength, tokensSaved, compressionRatio };
}

/**
 * Compress conversation history by truncating to last N messages
 * and compressing each message.
 */
export function compressHistory(
  messages: Array<{ role: string; content: string }>,
  maxMessages = 6
): Array<{ role: string; content: string }> {
  const truncated = messages.slice(-maxMessages);
  return truncated.map((msg) => ({
    role: msg.role,
    content: compressPrompt(msg.content).compressed,
  }));
}

/**
 * Compress AIMessage[] for use in aiProvider generateAI
 * Returns compressed messages and total tokens saved
 */
export function compressAIMessages(
  messages: Array<{ role: string; content: string }>
): { messages: Array<{ role: string; content: string }>; totalTokensSaved: number } {
  let totalTokensSaved = 0;
  const compressed = messages.map((msg) => {
    const result = compressPrompt(msg.content);
    totalTokensSaved += result.tokensSaved;
    return { role: msg.role, content: result.compressed };
  });
  return { messages: compressed, totalTokensSaved };
}

/**
 * Estimate token count for a string.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
