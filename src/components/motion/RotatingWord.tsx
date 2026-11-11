"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FlipFadeText } from "@/components/ui/flip-fade-text";

const size = "text-[clamp(2.25rem,5vw,3.6rem)]";
// Overrides the component's defaults (uppercase, wide tracking, text-6xl) to match the hero heading.
const wordStyle = `${size} md:${size} normal-case tracking-[-0.03em] leading-[1.04] gap-0 text-brand dark:text-brand`;

type Props = { words: string[]; interval?: number };

/**
 * Sits inline at the end of a sentence. An invisible copy of the longest word reserves
 * the space, so the heading never reflows while the words change. After one full pass
 * it rests on the first word; with reduced motion it shows that word, static.
 */
export default function RotatingWord({ words, interval = 2500 }: Props) {
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setDone(true),
      interval * words.length + 2000,
    );
    return () => clearTimeout(timer);
  }, [interval, words.length]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="relative inline-block whitespace-nowrap align-baseline">
      <span className="invisible">{longest}</span>
      <span className="absolute left-0 top-0">
        {reduceMotion || done ? (
          <span className="text-brand">{words[0]}</span>
        ) : (
          <FlipFadeText
            words={words}
            interval={interval}
            className="min-h-0 justify-start"
            textClassName={wordStyle}
          />
        )}
      </span>
    </span>
  );
}
