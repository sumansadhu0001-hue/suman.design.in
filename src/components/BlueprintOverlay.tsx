import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Grid, Eye } from "lucide-react";

interface BlueprintOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export default function BlueprintOverlay({ isActive, onClose }: BlueprintOverlayProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden select-none">
      {/* Blueprint Grid Lines Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf615_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf615_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      {/* Blueprint Column Markers */}
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-4 opacity-15">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-full border-x border-dashed border-violet-500 bg-violet-500/5 relative">
            <span className="absolute top-2 left-1 text-[9px] font-mono font-bold text-violet-500">
              COL_{i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Blueprint Badge */}
      <div className="pointer-events-auto fixed top-20 right-6 bg-violet-950/90 text-white border border-violet-500/40 px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 font-mono text-xs z-[70]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
          <span className="text-violet-200 font-bold">BLUEPRINT_INSPECTOR</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-violet-800 hover:bg-violet-700 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
        >
          Exit Wireframe
        </button>
      </div>

      {/* Live Cursor Coordinates Tracker */}
      <div className="fixed bottom-16 right-6 bg-zinc-950/90 text-violet-300 border border-violet-800/80 px-3 py-1.5 rounded-lg text-[10px] font-mono shadow-lg backdrop-blur-sm">
        <span className="text-zinc-500">CURSOR:</span> X: {coords.x}px | Y: {coords.y}px
      </div>
    </div>
  );
}
