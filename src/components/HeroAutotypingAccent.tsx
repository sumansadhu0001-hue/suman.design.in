import React, { useState, useEffect } from "react";

const EXEC_PHRASES = [
  "your reputation",
  "your brand",
  "your market authority",
  "your revenue growth"
];

const DEV_PHRASES = [
  "your architecture",
  "your core vitals",
  "your tech stack",
  "sub-100ms LCP"
];

interface HeroAutotypingAccentProps {
  perspective: "executive" | "developer";
}

export default function HeroAutotypingAccent({ perspective }: HeroAutotypingAccentProps) {
  const phrases = perspective === "developer" ? DEV_PHRASES : EXEC_PHRASES;

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Check system reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  // Reset typing state when perspective switches
  useEffect(() => {
    setPhraseIndex(0);
    setCurrentText("");
    setIsDeleting(false);
  }, [perspective]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const targetPhrase = phrases[phraseIndex % phrases.length];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (currentText.length < targetPhrase.length) {
        timer = setTimeout(() => {
          setCurrentText(targetPhrase.substring(0, currentText.length + 1));
        }, 60);
      } else {
        // Completed typing, hold for 2500ms before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(targetPhrase.substring(0, currentText.length - 1));
        }, 30);
      } else {
        // Completed deleting, move to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => prev + 1);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <span className="block">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] dark:from-[#A78BFA] dark:to-[#8B5CF6] font-bold">
          {phrases[0]}
        </span>
      </span>
    );
  }

  return (
    <span className="block select-none">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] dark:from-[#A78BFA] dark:to-[#8B5CF6] font-bold">
        {currentText || "\u00A0"}
      </span>
      <span className="text-[#8B5CF6] dark:text-[#A78BFA] animate-pulse font-normal ml-0.5 inline-block opacity-90">
        |
      </span>
    </span>
  );
}
