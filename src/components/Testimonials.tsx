import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "../data";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.96
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.35 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 }
    }
  })
};

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex, isAutoplay]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoplay(false);
  };

  const testimonial = TESTIMONIALS[currentIndex];

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 relative overflow-hidden bg-[#fafafa] dark:bg-[#0b0b0d] border-t border-zinc-200/40 dark:border-zinc-900/40"
    >
      {/* Visual background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-violet-500/5 dark:bg-violet-500/[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/40 border border-violet-200/50 dark:border-violet-800/50 mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white leading-tight mb-4">
            Client Perspectives
          </h2>
          <p className="text-sm sm:text-base text-zinc-650 dark:text-zinc-400 max-w-lg mx-auto">
            What forward-thinking businesses and directors say about Suman.design digital solutions.
          </p>
        </div>

        {/* Testimonials Slider Area */}
        <div
          id="testimonials-slider-container"
          className="relative min-h-[220px] sm:min-h-[280px] flex items-center justify-center w-full"
          onMouseEnter={() => setIsAutoplay(false)}
          onMouseLeave={() => setIsAutoplay(true)}
          onTouchStart={() => setIsAutoplay(false)}
          onTouchEnd={() => setIsAutoplay(true)}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-[calc(100%-4rem)] sm:w-full mx-auto bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/70 dark:border-zinc-900 p-4 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between relative group/card"
            >
              {/* Decorative Quote Icon */}
              <div className="absolute top-4 right-6 text-violet-500/10 dark:text-violet-500/5 group-hover/card:scale-110 transition-transform duration-500 pointer-events-none">
                <Quote className="w-8 h-8 sm:w-16 sm:h-16 transform rotate-180" />
              </div>

              <div>
                {/* Rating Stars */}
                <div className="flex gap-1 mb-3 sm:mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-[11px] sm:text-base md:text-lg text-zinc-850 dark:text-zinc-250 font-medium leading-relaxed mb-4 sm:mb-8 select-none">
                  "{testimonial.content}"
                </blockquote>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-900 pt-3 sm:pt-6 mt-1 sm:mt-2">
                <div className="flex items-center gap-2">
                  {/* Custom initials avatar */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white font-display font-semibold text-[10px] sm:text-xs flex items-center justify-center shadow-sm select-none shrink-0">
                    {testimonial.name.split(" ").map(n => n.replace(/[^a-zA-Z]/g, "")[0]).join("")}
                  </div>
                  <div>
                    <cite className="not-italic block text-[10px] sm:text-sm font-bold text-zinc-900 dark:text-white">
                      {testimonial.name}
                    </cite>
                    <span className="text-[9px] sm:text-xs text-zinc-500 dark:text-zinc-400 block">
                      {testimonial.role}, {testimonial.company}
                    </span>
                  </div>
                </div>

                {/* Autoplay / Paused Badge */}
                <span className="text-[7px] sm:text-[9px] font-mono font-medium tracking-wider text-zinc-400 bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-500 px-1 py-0.5 sm:px-2 rounded border border-zinc-250/20 dark:border-zinc-800/40 select-none shrink-0">
                  {isAutoplay ? "AUTO" : "PAUSED"}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {/* Previous Button */}
          <div className="absolute left-0 sm:left-0 sm:-translate-x-6 z-20">
            <button
              onClick={() => {
                handlePrev();
                setIsAutoplay(false);
              }}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 flex items-center justify-center shadow-lg hover:text-violet-600 dark:hover:text-violet-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
            </button>
          </div>

          {/* Next Button */}
          <div className="absolute right-0 sm:right-0 sm:translate-x-6 z-20">
            <button
              onClick={() => {
                handleNext();
                setIsAutoplay(false);
              }}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 flex items-center justify-center shadow-lg hover:text-violet-600 dark:hover:text-violet-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pager Indicator Dots */}
        <div className="flex justify-center items-center gap-2.5 mt-8">
          {TESTIMONIALS.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className="relative py-2 focus:outline-none cursor-pointer"
                aria-label={`Go to testimonial ${idx + 1}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "w-7 bg-violet-600 dark:bg-violet-400" : "w-1.5 bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-450 dark:hover:bg-zinc-600"
                  }`}
                />
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
