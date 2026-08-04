/**
 * useStreamingText — Reveals text word-by-word for a typewriter/streaming effect
 * Simulates LLM streaming responses without requiring server-side SSE
 */
import { useState, useEffect, useCallback, useRef } from "react";

export function useStreamingText(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const indexRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    setDisplayed("");
    setIsStreaming(true);
    indexRef.current = 0;

    if (!text) {
      setIsStreaming(false);
      return;
    }

    const words = text.split(" ");
    const interval = setInterval(() => {
      if (indexRef.current < words.length) {
        const next = words.slice(0, indexRef.current + 1).join(" ");
        setDisplayed(next);
        indexRef.current++;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const skip = useCallback(() => {
    setDisplayed(textRef.current);
    setIsStreaming(false);
    indexRef.current = textRef.current.split(" ").length;
  }, []);

  return { displayed, isStreaming, skip };
}
