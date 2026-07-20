import { motion } from "motion/react";

interface SkeletonProps {
  className?: string;
}

export function Shimmer({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-zinc-200/70 dark:bg-zinc-800/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent ${className}`}
    />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161617]/95 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] h-full">
      <div>
        {/* Header & Icon */}
        <div className="flex items-center justify-between mb-8">
          <Shimmer className="w-12 h-12 rounded-xl" />
          <Shimmer className="w-16 h-5 rounded-md" />
        </div>

        {/* Title */}
        <Shimmer className="w-2/3 h-6 rounded-md mb-3" />
        
        {/* Description Lines */}
        <div className="space-y-2 mb-8">
          <Shimmer className="w-full h-4 rounded-md" />
          <Shimmer className="w-5/6 h-4 rounded-md" />
        </div>

        {/* What is Included List */}
        <div className="border-t border-zinc-100 dark:border-zinc-900/80 pt-6 mt-6">
          <Shimmer className="w-24 h-3.5 rounded-sm mb-4" />
          <div className="space-y-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="w-4 h-4 rounded-full shrink-0" />
                <Shimmer className="w-1/2 h-3.5 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits / Outcomes */}
      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900/80">
        <Shimmer className="w-20 h-3.5 rounded-sm mb-3.5" />
        <div className="flex flex-wrap gap-2">
          <Shimmer className="w-16 h-5 rounded-full" />
          <Shimmer className="w-20 h-5 rounded-full" />
          <Shimmer className="w-14 h-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161617]/95 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      <div>
        {/* Mockup Canvas */}
        <div className="aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 mb-6 p-6 flex flex-col justify-between relative overflow-hidden">
          <Shimmer className="absolute inset-0 z-0 opacity-40" />
          
          {/* Mockup Header */}
          <div className="flex items-center justify-between border-b border-zinc-200/20 dark:border-white/10 pb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-white/30" />
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-white/30" />
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-white/30" />
            </div>
            <Shimmer className="w-14 h-3.5 rounded-sm" />
          </div>

          {/* Mockup Center */}
          <div className="my-auto flex flex-col items-center py-4 relative z-10">
            <Shimmer className="w-20 h-5 rounded-full mb-3" />
            <Shimmer className="w-48 h-6 rounded-md mb-2" />
            <Shimmer className="w-32 h-3.5 rounded-md" />
          </div>

          {/* Mockup Footer */}
          <div className="grid grid-cols-3 gap-3 border-t border-zinc-200/20 dark:border-white/10 pt-3 relative z-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Shimmer className="w-10 h-2.5 rounded-sm" />
                <Shimmer className="w-12 h-3.5 rounded-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Meta / Category & Timeline */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Shimmer className="w-3.5 h-3.5 rounded-full" />
            <Shimmer className="w-16 h-3.5 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <Shimmer className="w-3.5 h-3.5 rounded-full" />
            <Shimmer className="w-16 h-3.5 rounded-md" />
          </div>
        </div>

        {/* Title */}
        <Shimmer className="w-3/4 h-6 rounded-md mb-3" />

        {/* Description */}
        <div className="space-y-2 mb-6">
          <Shimmer className="w-full h-4 rounded-md" />
          <Shimmer className="w-5/6 h-4 rounded-md" />
        </div>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Shimmer className="w-14 h-5 rounded-md" />
          <Shimmer className="w-12 h-5 rounded-md" />
          <Shimmer className="w-16 h-5 rounded-md" />
          <Shimmer className="w-10 h-5 rounded-md" />
        </div>
      </div>

      {/* Button */}
      <Shimmer className="w-full h-11 rounded-xl" />
    </div>
  );
}

export function SkeletonGrid({ type, count = 3 }: { type: "services" | "projects"; count?: number }) {
  return (
    <div className={type === "services" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05 }}
        >
          {type === "services" ? <ServiceCardSkeleton /> : <ProjectCardSkeleton />}
        </motion.div>
      ))}
    </div>
  );
}
