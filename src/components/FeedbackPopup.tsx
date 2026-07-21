import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, X, Heart, Sparkles, CheckCircle } from "lucide-react";

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const EMOTIONS = [
  { rating: 1, emoji: "😞", label: "Disappointed" },
  { rating: 2, emoji: "😐", label: "Neutral" },
  { rating: 3, emoji: "🙂", label: "Good" },
  { rating: 4, emoji: "😀", label: "Excellent" },
  { rating: 5, emoji: "😍", label: "Love it!" }
];

export default function FeedbackPopup({ isOpen, onClose, onSubmitSuccess }: FeedbackPopupProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const selectedEmotion = EMOTIONS.find(e => e.rating === rating);
      const res = await fetch("/.netlify/functions/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          emoji: selectedEmotion?.emoji || "😀",
          message,
          page_url: window.location.href,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        if (onSubmitSuccess) onSubmitSuccess();
        setTimeout(() => {
          setIsSuccess(false);
          setMessage("");
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-white/95 dark:bg-[#0c0c0e]/95 border border-zinc-200/80 dark:border-zinc-900 shadow-2xl rounded-2xl p-6 backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4.5 right-4.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Feedback Logged!</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Your luxury experience feedback is saved securely. Thanks!
                  </p>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550">
                        Feedback
                      </h4>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">How was your experience?</h3>
                    </div>
                  </div>

                  {/* Rating Selection: Emoji row */}
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850/40">
                    {EMOTIONS.map((item) => (
                      <button
                        key={item.rating}
                        type="button"
                        onClick={() => setRating(item.rating)}
                        className={`text-2xl p-1.5 rounded-lg transition-transform hover:scale-125 duration-150 cursor-pointer ${
                          rating === item.rating
                            ? "bg-violet-150/50 dark:bg-violet-950/40 scale-110 filter none"
                            : "opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
                        }`}
                        title={item.label}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>

                  {/* Stars indicators */}
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-5.5 h-5.5 ${
                            star <= (hoveredRating ?? rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-zinc-250 dark:text-zinc-750"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Textarea comment */}
                  <div className="space-y-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can improve..."
                      className="w-full h-20 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      maxLength={500}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-zinc-550 dark:text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-center"
                    >
                      Maybe Later
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/10 transition-all cursor-pointer text-center disabled:opacity-50"
                    >
                      {isSending ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
