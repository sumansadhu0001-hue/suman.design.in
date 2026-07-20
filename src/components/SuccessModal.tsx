import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackInquiry?: () => void;
}

export default function SuccessModal({ isOpen, onClose, onTrackInquiry }: SuccessModalProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate 40 dynamic confetti particles
      const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#a855f7"];
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 200 - 100, // offset left/right
        y: Math.random() * -150 - 50, // jump upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5,
        delay: Math.random() * 0.4
      }));
      setParticles(newParticles);

      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#030303]/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0d0d0f] border border-zinc-200/80 dark:border-zinc-850/80 rounded-3xl p-8 text-center shadow-2xl overflow-hidden z-10"
          >
            {/* Confetti Explosion Animation Canvas */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    scale: 0.2,
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "40%",
                    width: p.size,
                    height: p.size,
                    borderRadius: "4px",
                    backgroundColor: p.color,
                  }}
                />
              ))}
            </div>

            {/* Radiant Circle with Animated Checkmark */}
            <div className="relative flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Check className="w-10 h-10 stroke-[2.5]" />
                </motion.div>
              </motion.div>

              {/* Ping Ring */}
              <span className="absolute inset-x-0 top-0 mx-auto w-20 h-20 rounded-full bg-emerald-500/20 animate-ping pointer-events-none opacity-50" />
            </div>

            {/* Title & Messages */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-display font-bold text-zinc-900 dark:text-white"
            >
              Thank You!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-2"
            >
              Your inquiry has been received successfully.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-zinc-650 dark:text-zinc-400 mt-4 leading-relaxed max-w-sm mx-auto"
            >
              We'll review your project requirements and custom digital architecture specifications and contact you within 24 hours.
            </motion.p>

            {/* Interactive Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-col gap-2.5 sm:flex-row"
            >
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer border border-zinc-200/50 dark:border-zinc-800"
              >
                Continue Browsing
              </button>
              <button
                onClick={() => {
                  if (onTrackInquiry) onTrackInquiry();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Track Inquiry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
              <span>Securely logged in Suman.design Client CRM</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
