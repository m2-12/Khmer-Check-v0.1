import React from 'react';
import { PenTool, CheckCircle, RefreshCw, Moon, Sun, Layers, Sliders, Languages } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  activePanel: 'corrections' | 'rewrite' | 'ocr-converter';
  setActivePanel: (val: 'corrections' | 'rewrite' | 'ocr-converter') => void;
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
    <header className="border-b border-[#ECE7DC] dark:border-zinc-800/80 bg-[#FAF7F2]/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-start">
        <div className="bg-gradient-to-tr from-[#4A6D5D] to-[#587E6A] dark:from-[#3E5C4E] dark:to-emerald-800 p-2 rounded-xl text-[#FAF7F2] shadow-sm shrink-0 transition-transform duration-300 hover:rotate-6">
          <PenTool className="w-5 h-5 animate-pulse" id="header-logo-icon" />
        </div>
        <div className="text-left">
          <h1 className="text-base sm:text-lg font-heading font-bold tracking-tight text-[#2D3330] dark:text-zinc-100 flex items-center gap-2">
            អក្ខរាវិរុទ្ធខ្មែរ <span className="font-sans text-xs bg-[#EED8A1] dark:bg-amber-950/40 text-[#7D5B1A] dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-[#DDAE3B]/20 whitespace-nowrap">V0.1</span>
          </h1>
          <p className="text-xs font-sans uppercase font-bold tracking-widest text-[#587E6A] dark:text-zinc-500">Khmer Spell Checker</p>
        </div>
      </div>

      {/* Premium Tab Selector Switches */}
      <div className="flex items-center w-full sm:w-auto bg-[#EFEBE4] dark:bg-zinc-900 p-1 rounded-xl border border-[#ECE7DC]/40 dark:border-zinc-800/50 justify-between sm:justify-center gap-1">
        <button
          onClick={() => setActivePanel('corrections')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 whitespace-nowrap ${
            activePanel === 'corrections'
              ? 'bg-[#FAF7F2] dark:bg-zinc-800 text-[#2D3330] dark:text-white shadow-xs scale-102 font-bold'
              : 'text-[#6C7571] dark:text-zinc-400 hover:text-[#2D3330] dark:hover:text-white'
          }`}
          title="Direct on-design word detection and error checking"
        >
          <Layers className="w-3.5 h-3.5 text-[#587E6A] dark:text-emerald-400" />
          <span>ផ្ទាំងការងារ (Canvas)</span>
        </button>
        <button
          onClick={() => setActivePanel('rewrite')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 whitespace-nowrap ${
            activePanel === 'rewrite'
              ? 'bg-[#FAF7F2] dark:bg-zinc-800 text-[#2D3330] dark:text-white shadow-xs scale-102 font-bold'
              : 'text-[#6C7571] dark:text-zinc-400 hover:text-[#2D3330] dark:hover:text-white'
          }`}
          title="Isolated sentence writing and multi-tone translation options"
        >
          <Sliders className="w-3.5 h-3.5 text-[#DDAE3B] dark:text-amber-400" />
          <span>កែសម្រួលឃ្លា (Tone)</span>
        </button>
        <button
          onClick={() => setActivePanel('ocr-converter')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 whitespace-nowrap ${
            activePanel === 'ocr-converter'
              ? 'bg-[#FAF7F2] dark:bg-zinc-800 text-[#2D3330] dark:text-white shadow-xs scale-102 font-bold'
              : 'text-[#6C7571] dark:text-zinc-400 hover:text-[#2D3330] dark:hover:text-white'
          }`}
          title="Client-side Image to Khmer and English Text Converter"
        >
          <Languages className="w-3.5 h-3.5 text-[#4A6D5D] dark:text-emerald-400" />
          <span>បំប្លែងរូបភាពជាអត្ថបទ (OCR)</span>
        </button>
      </div>

      <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
        {hasData && (
          <div className="hidden md:flex items-center bg-[#E6EFEA] dark:bg-emerald-950/20 border border-[#CEE2D7] dark:border-emerald-900/40 px-3 py-1.5 rounded-lg text-[#324B3F] dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 text-[#4A6D5D] mr-2 shrink-0 animate-bounce" />
            <div className="text-left leading-tight">
              <div className="text-xs font-mono font-bold text-[#557866] dark:text-emerald-400">OCR CONFIDENCE</div>
              <div className="text-xs font-bold font-heading">{ocrConfidence}% Accurate</div>
            </div>
          </div>
        )}

        {hasData && (
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 border border-[#ECE7DC] hover:bg-[#FAF7F2] dark:border-zinc-800 dark:hover:bg-zinc-900 text-[#2D3330] dark:text-zinc-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#587E6A]" />
            <span>ចាប់ផ្តើមថ្មី</span>
          </button>
        )}

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 border border-[#ECE7DC] dark:border-zinc-800 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-zinc-900 text-[#2D3330] dark:text-zinc-300 transition-all duration-200 hover:scale-[1.05]"
          title="Toggle light/dark layout design"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#DDAE3B]" /> : <Moon className="w-4 h-4 text-[#587E6A]" />}
        </button>
      </div>
    </header>
  );
}
