/**
 * promptCompression — Utility to compress LLM prompts for token reduction
 *
 * Strategies:
 * 1. Remove redundant whitespace and blank lines
 * 2. Deduplicate system prompt segments
 * 3. Truncate conversation history to last N messages
 * 4. Remove filler words and verbose phrases
 * 5. Compact repetitive patterns (e.g., repeated labels)
 * 6. Strip markdown formatting that doesn't affect meaning
 */

export interface CompressionResult {
  compressed: string;
  originalLength: number;
  compressedLength: number;
  tokensSaved: number;
  compressionRatio: number;
}

// Rough token estimate: ~4 chars per token for English/multilingual
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

// Repeated label patterns like [PT] [PT] [PT]
const REPEATED_LABEL_RE = /(\[[A-Z]{2}\])\s*\1+/g;

// Multiple blank lines → single blank line
const MULTIPLE_BLANKS = /\n{3,}/g;

// Multiple spaces → single space
const MULTIPLE_SPACES = /[ \t]{2,}/g;

// Trailing/leading whitespace on lines
const LINE_WHITESPACE = /^[ \t]+|[ \t]+$/gm;

/**
 * Compress a single prompt string by removing redundant content.
 */
export function compressPrompt(input: string): CompressionResult {
  const originalLength = input.length;
  let result = input;

  // 1. Normalize whitespace
  result = result.replace(MULTIPLE_SPACES, " ");
  result = result.replace(LINE_WHITESPACE, "");
  result = result.replace(MULTIPLE_BLANKS, "\n\n");

  // 2. Remove filler phrases
  for (const pattern of FILLER_PATTERNS) {
    result = result.replace(pattern, "");
  }

  // 3. Compact repeated labels (e.g., [PT][PT][PT] → [PT])
  result = result.replace(REPEATED_LABEL_RE, "$1");

  // 4. Remove redundant markdown formatting (keep **bold** and lists, strip extra)
  result = result.replace(/#{1,6}\s+/g, ""); // Remove heading markers
  result = result.replace(/\*{3,}/g, "**"); // *** → **
  result = result.replace(/_{3,}/g, "_"); // ___ → _

  // 5. Collapse repeated instruction blocks
  const lines = result.split("\n");
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Only deduplicate non-empty lines that look like instructions (>20 chars, no placeholders)
    if (trimmed.length > 20 && !trimmed.includes("{") && !trimmed.includes("<")) {
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
    }
    deduped.push(line);
  }
  result = deduped.join("\n");

  // 6. Final whitespace cleanup
  result = result.trim();

  const compressedLength = result.length;
  const tokensSaved = Math.ceil((originalLength - compressedLength) / CHARS_PER_TOKEN);
  const compressionRatio = originalLength > 0 ? compressedLength / originalLength : 1;

  return {
    compressed: result,
    originalLength,
    compressedLength,
    tokensSaved,
    compressionRatio,
  };
}

/**
 * Compress conversation history by truncating to last N messages
 * and compressing each message.
 */
export function compressHistory(
  messages: Array<{ role: string; content: string }>,
  maxMessages = 6
): Array<{ role: string; content: string }> {
  // Keep only the last N messages
  const truncated = messages.slice(-maxMessages);

  // Compress each message
  return truncated.map((msg) => ({
    role: msg.role,
    content: compressPrompt(msg.content).compressed,
  }));
}

/**
 * Compress a system prompt by deduplicating repeated instructions
 * and removing verbose explanations.
 */
export function compressSystemPrompt(systemPrompt: string): CompressionResult {
  const originalLength = systemPrompt.length;

  // Split into instruction lines
  const lines = systemPrompt.split("\n");
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      deduped.push(line);
      continue;
    }

    // Normalize for comparison (lowercase, remove punctuation)
    const key = trimmed
      .toLowerCase()
      .replace(/[.,;:!?]/g, "")
      .replace(/\s+/g, " ");

    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }

  let result = deduped.join("\n");

  // Apply general compression
  const generalResult = compressPrompt(result);

  return {
    ...generalResult,
    tokensSaved: Math.ceil((originalLength - generalResult.compressedLength) / CHARS_PER_TOKEN),
  };
}

/**
 * Estimate token count for a string.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
