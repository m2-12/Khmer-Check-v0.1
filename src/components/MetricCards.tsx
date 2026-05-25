import React from 'react';
import { Award, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface MetricCardsProps {
  confidence: number;
  grammarScore: number;
  marketingScore: number;
  layoutAdvice: {
    hasOverlapIssue: boolean;
    overlapDetails: string | null;
    spacingDistributionRating: string;
    aestheticVibeMatch: string;
  };
}

export default function MetricCards({
  confidence,
  grammarScore,
  marketingScore,
  layoutAdvice
}: MetricCardsProps) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  const getStrokeDashoffset = (score: number) => {
    return circumference - (score / 100) * circumference;
  };

  const getScoreColors = (score: number) => {
    if (score >= 90) return {
      text: 'text-[#4A6D5D] dark:text-emerald-400',
      stroke: 'stroke-[#4A6D5D] dark:stroke-emerald-400',
      bg: 'bg-[#E6EFEA] dark:bg-emerald-950/20 mr-2.5',
      accent: '#4A6D5D'
    };
    if (score >= 70) return {
      text: 'text-[#9B7004] dark:text-amber-400',
      stroke: 'stroke-[#DDAE3B] dark:stroke-amber-400',
      bg: 'bg-[#FFFDF5] dark:bg-amber-950/20 mr-2.5',
      accent: '#DDAE3B'
    };
    return {
      text: 'text-rose-700 dark:text-rose-450',
      stroke: 'stroke-rose-600 dark:stroke-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/20 mr-2.5',
      accent: '#E11D48'
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {/* OCR Confidence Ring */}
      <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.01] group min-w-0">
        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#4A6D5D] shrink-0" />
            <span className="truncate">Extraction Index</span>
          </span>
          <h4 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#2D3330] dark:text-white transition-colors duration-200 group-hover:text-[#4A6D5D]">
            {confidence}%
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-405 font-medium truncate" title="Glyph parsing accuracy">Glyph parsing accuracy</p>
        </div>
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r={radius} className="stroke-[#F5F2EA] dark:stroke-zinc-800" strokeWidth="4.5" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className={`transition-all duration-1000 ${getScoreColors(confidence).stroke}`}
              strokeWidth="4.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={getStrokeDashoffset(confidence)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-heading font-extrabold text-[#2D3330] dark:text-zinc-300">
            OCR
          </div>
        </div>
      </div>

      {/* Grammar & Spacer Ring */}
      <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.01] group min-w-0">
        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 flex items-center gap-1.5 min-w-0">
            <Award className="w-4 h-4 text-[#DDAE3B] shrink-0" />
            <span className="truncate">Linguistic Health</span>
          </span>
          <h4 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#2D3330] dark:text-white transition-colors duration-200 group-hover:text-[#9B7004]">
            {grammarScore}%
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-405 font-medium truncate" title="Spacers & spellings score">Spacers & spellings score</p>
        </div>
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r={radius} className="stroke-[#F5F2EA] dark:stroke-zinc-800" strokeWidth="4.5" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className={`transition-all duration-1000 ${getScoreColors(grammarScore).stroke}`}
              strokeWidth="4.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={getStrokeDashoffset(grammarScore)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-heading font-extrabold text-[#2D3330] dark:text-zinc-300">
            KHM
          </div>
        </div>
      </div>

      {/* Marketing Quality Score */}
      <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.01] group min-w-0">
        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-4 h-4 text-[#DDAE3B] shrink-0" />
            <span className="truncate">Copywriting Impact</span>
          </span>
          <h4 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#2D3330] dark:text-white transition-colors duration-200 group-hover:text-[#9B7004]">
            {marketingScore}%
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-405 font-medium truncate" title="Sales copy punchiness Index">Sales copy punchiness Index</p>
        </div>
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r={radius} className="stroke-[#F5F2EA] dark:stroke-zinc-800" strokeWidth="4.5" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className={`transition-all duration-1000 ${getScoreColors(marketingScore).stroke}`}
              strokeWidth="4.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={getStrokeDashoffset(marketingScore)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-heading font-extrabold text-[#2D3330] dark:text-zinc-300">
            COPY
          </div>
        </div>
      </div>

      {/* Spatial Overlay Alerts Card */}
      <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01] min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="space-y-1 flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 block truncate">
              Visual Narrative Vibe
            </span>
            <div className="text-sm sm:text-base font-bold text-[#2D3330] dark:text-white mt-1 capitalize whitespace-normal break-words font-heading" title={layoutAdvice.aestheticVibeMatch}>
              {layoutAdvice.aestheticVibeMatch}
            </div>
          </div>
          <div className={`text-xs uppercase font-bold tracking-tight px-2 py-1 rounded-md shrink-0 ${layoutAdvice.hasOverlapIssue ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 border border-rose-100' : 'bg-[#E6EFEA] dark:bg-emerald-950/25 text-[#4A6D5D] border border-[#CEE2D7]'}`}>
            {layoutAdvice.hasOverlapIssue ? 'ស្ទះ (Overlap)' : 'ប្លង់ល្អ (Perfect)'}
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-405 flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-zinc-950 p-2 sm:p-2.5 rounded-xl border border-[#ECE7DC]/50 dark:border-zinc-800/60 min-w-0">
          <AlertTriangle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${layoutAdvice.hasOverlapIssue ? 'text-[#DDAE3B] animate-pulse' : 'text-[#587E6A]'}`} />
          <span className="whitespace-normal break-words text-xs font-sans font-medium" title={layoutAdvice.overlapDetails || "No text overlapping coordinates reported!"}>
            {layoutAdvice.overlapDetails || "No overlap text clashing."}
          </span>
        </div>
      </div>
    </div>
  );
}
