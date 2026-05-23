import React from 'react';
import { Award, AlertTriangle, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

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
  // Helpers for radial circle strokes
  const radius = 32;
  const circumference = 2 * Math.PI * radius;

  const getStrokeDashoffset = (score: number) => {
    return circumference - (score / 100) * circumference;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 70) return 'text-violet-500 stroke-violet-500';
    return 'text-amber-500 stroke-amber-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (score >= 70) return 'bg-violet-500/10 text-violet-700 dark:text-violet-400';
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* OCR Confidence Ring */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            OCR Capture Conf.
          </span>
          <h4 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{confidence}%</h4>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">High glyph recognition accuracy</p>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r={radius} className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="4" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className={`transition-all duration-1000 ${getScoreColor(confidence)}`}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={getStrokeDashoffset(confidence)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
            OCR
          </div>
        </div>
      </div>

      {/* Grammar & Spacer Ring */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-violet-500" />
            Khmer Lexicon Score
          </span>
          <h4 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{grammarScore}%</h4>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Spelling, vowel and spacer health</p>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r={radius} className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="4" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className={`transition-all duration-1000 ${getScoreColor(grammarScore)}`}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={getStrokeDashoffset(grammarScore)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
            KHM
          </div>
        </div>
      </div>

      {/* Marketing Quality Score */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Marketing Hook Impact
          </span>
          <h4 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{marketingScore}%</h4>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Slogan readability & commercial vigor</p>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r={radius} className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="4" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className={`transition-all duration-1000 ${getScoreColor(marketingScore)}`}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={getStrokeDashoffset(marketingScore)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
            ADV
          </div>
        </div>
      </div>

      {/* Spatial Overlay Alerts Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Layout Design Vibe
            </span>
            <div className="text-xs font-bold text-zinc-900 dark:text-white mt-1 capitalize truncate max-w-[150px]" title={layoutAdvice.aestheticVibeMatch}>
              {layoutAdvice.aestheticVibeMatch}
            </div>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${layoutAdvice.hasOverlapIssue ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'}`}>
            {layoutAdvice.hasOverlapIssue ? 'ស្ទះប្លង់ (Overlap Alert)' : 'ប្លង់ស្អាតល្អ (Safe Layering)'}
          </div>
        </div>

        <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${layoutAdvice.hasOverlapIssue ? 'text-amber-500' : 'text-zinc-400'}`} />
          <span className="truncate" title={layoutAdvice.overlapDetails || "No text clashes detected!"}>
            {layoutAdvice.overlapDetails || "Spacing and balance look clean."}
          </span>
        </div>
      </div>
    </div>
  );
}
