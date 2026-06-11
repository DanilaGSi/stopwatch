/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from "react";
import { Play, Square, Pause, RotateCw, Timer } from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      startTimeRef.current = Date.now() - elapsedTime;

      const update = () => {
        setElapsedTime(Date.now() - startTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(update);
      };

      animationFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isPaused]);

  // Command handlers
  const handleStartStop = () => {
    if (!isActive) {
      setElapsedTime(0);
      setIsActive(true);
      setIsPaused(false);
    } else {
      setElapsedTime(0);
      setIsActive(false);
      setIsPaused(false);
    }
  };

  const handlePauseResume = () => {
    if (isActive) {
      setIsPaused((prev) => !prev);
    }
  };

  // Time format helper
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const centis = Math.floor((ms % 1000) / 10);

    return {
      hours: hrs.toString().padStart(2, "0"),
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
      centiseconds: centis.toString().padStart(2, "0"),
    };
  };

  const time = formatTime(elapsedTime);

  // SVG Ring Progress Calculations
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  // Progress wraps every 60 seconds
  const progressPercent = (elapsedTime % 60000) / 60000;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans antialiased text-neutral-800 relative select-none">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Stopwatch App Container */}
      <div
        id="stopwatch-container"
        className="relative z-10 bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl transition-all duration-300"
      >
        {/* Header App Info */}
        <div className="flex items-center justify-between mb-8 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
                Stopwatch
              </h1>
              <p className="text-xs text-neutral-400">Precision Timer</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-50 border border-neutral-100">
            {isActive && !isPaused ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 bg-emerald-50/10">Active</span>
              </>
            ) : isActive && isPaused ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-700 bg-amber-50/10">Paused</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span className="text-neutral-500">Idle</span>
              </>
            )}
          </div>
        </div>

        {/* Stopwatch Display and Ring */}
        <div className="relative flex flex-col items-center justify-center my-6">
          {/* SVG Progress Circle Sweep */}
          <svg className="w-76 h-76 max-w-full -rotate-90 md:w-80 md:h-80" viewBox="0 0 300 300">
            {/* Background Track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="fill-none stroke-neutral-100/70"
              strokeWidth="6"
            />
            {/* Active Progress Sweep */}
            <motion.circle
              cx="150"
              cy="150"
              r={radius}
              className="fill-none"
              strokeWidth="6"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 0.1,
              }}
              style={{
                stroke: isActive && !isPaused ? "url(#indigoGradient)" : isPaused ? "#f59e0b" : "#e5e5e5",
                strokeLinecap: "round",
              }}
            />
            <defs>
              <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Core Digital Clock */}
          <div className="absolute flex flex-col items-center justify-center">
            <div className="flex items-baseline font-mono text-neutral-900">
              <span
                id="display"
                className="text-5xl font-black tracking-tight transition-colors duration-300 select-all"
              >
                {time.hours}:{time.minutes}:{time.seconds}
              </span>
              <span className="text-2xl font-semibold text-neutral-400 ml-1">
                .{time.centiseconds}
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 mt-2 uppercase">
              hrs : mins : secs : ms
            </span>
          </div>
        </div>

        {/* Interactive Control Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          {/* Start/Stop Button */}
          <motion.button
            id="startStopBtn"
            onClick={handleStartStop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-semibold text-white shadow-lg transition-colors duration-200 cursor-pointer ${
              isActive
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25 border-t border-rose-500/10"
                : "bg-neutral-900 hover:bg-neutral-800 shadow-neutral-950/25 border-t border-neutral-800/20"
            }`}
          >
            {isActive ? (
              <>
                <Square className="w-5 h-5 fill-white/10" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white/10" />
                <span>Start</span>
              </>
            )}
          </motion.button>

          {/* Pause/Resume Button */}
          <motion.button
            id="pauseResumeBtn"
            disabled={!isActive}
            onClick={handlePauseResume}
            whileHover={isActive ? { scale: 1.02 } : {}}
            whileTap={isActive ? { scale: 0.98 } : {}}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg ${
              !isActive
                ? "bg-neutral-100 text-neutral-400 border border-neutral-200/50 shadow-none cursor-not-allowed"
                : isPaused
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20 border-t border-amber-500/10 cursor-pointer"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 border-t border-emerald-500/10 cursor-pointer"
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5 fill-white/10 animate-pulse" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 fill-white/10" />
                <span>Pause</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
