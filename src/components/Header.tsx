import React from 'react';
import { PenTool, CheckCircle, RefreshCw, Moon, Sun, BookOpen, Layers, Users, Sliders } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  activePanel: 'corrections' | 'rewrite' | 'dictionary' | 'history';
  setActivePanel: (val: 'corrections' | 'rewrite' | 'dictionary' | 'history') => void;
  onReset: () => void;
  hasData: boolean;
  ocrConfidence: number;
}

export default function Header({
  isDarkMode,
  setIsDarkMode,
  activePanel,
  setActivePanel,
  onReset,
  hasData,
  ocrConfidence
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-violet-600 to-blue-500 p-2.5 rounded-xl text-white shadow-md shadow-violet-500/20">
          <PenTool className="w-5 h-5" id="header-logo-icon" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            អក្សរាការ <span className="text-xs bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold px-2.5 py-0.5 rounded-full border border-violet-200/50 dark:border-violet-900/30">Khmer Proofing v1.2</span>
          </h1>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wide">
            DESIGNER COGNITIVE OCR & GRAMMAR CORRECTOR
          </p>
        </div>
      </div>

      {/* Mode Switches */}
      <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/50">
        <button
          onClick={() => setActivePanel('corrections')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            activePanel === 'corrections'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
          title="Direct on-design word detection and error checking"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ផ្ទាំងការងារ (Canvas)</span>
        </button>
        <button
          onClick={() => setActivePanel('rewrite')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            activePanel === 'rewrite'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
          title="Isolated sentence writing and multi-tone translation options"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>កែសម្រួលឃ្លា (Tone Rewrite)</span>
        </button>
        <button
          onClick={() => setActivePanel('dictionary')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            activePanel === 'dictionary'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
          title="Adjust rules or add terminology replacements"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>វចនានុក្រមប្រេន (Dictionary)</span>
        </button>
        <button
          onClick={() => setActivePanel('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            activePanel === 'history'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ប្រវត្តិ (History)</span>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {hasData && (
          <div className="hidden md:flex items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3 py-1.5 rounded-lg text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
            <div className="text-left leading-tight">
              <div className="text-[10px] font-mono font-semibold">OCR CAPTURE</div>
              <div className="text-xs font-bold font-sans">{ocrConfidence}% Confidence</div>
            </div>
          </div>
        )}

        {hasData && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ចាប់ផ្តើមថ្មី</span>
          </button>
        )}

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
          title="Toggle light/dark layout design"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
