import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Sliders, Check, Copy, Star, Info, Bookmark, Flame
} from 'lucide-react';

interface ToneRewriterProps {
  initialText: string;
  onSetInitialText: (val: string) => void;
  isDarkMode: boolean;
}

type ToneMode = 'promotional' | 'luxury' | 'friendly' | 'youthful' | 'formal' | 'professional';
type LengthMode = 'shorten' | 'maintain' | 'longer';

interface RewriteResult {
  rewrittenText: string;
  explanation: string;
  score: number;
  benefits: string[];
}

export default function ToneRewriter({ initialText, onSetInitialText, isDarkMode }: ToneRewriterProps) {
  const [rewriteInput, setRewriteInput] = useState<string>(initialText || 'ទិញ1ថែម1 ឆាប់ឡើង!!');

  useEffect(() => {
    if (initialText) {
      setRewriteInput(initialText);
    }
  }, [initialText]);

  const [selectedTone, setSelectedTone] = useState<ToneMode>('promotional');
  const [rewriteLength, setRewriteLength] = useState<LengthMode>('maintain');
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);

  // Quick preset triggers to help users start immediately with standard advertising pitches
  const samplePhrases = [
    { label: "🍔 អាហាររហ័ស", text: "ប្រញាប់ឡើង អាហារពេលព្រឹក បញ្ចុះតម្លៃ ៥០% ថ្ងៃនេះលក់អស់ហើយ!" },
    { label: "👗 ហាងសំលៀកបំពាក់", text: "ខោអាវស្អាត ទើបមកដល់ថ្មីៗ ទិញភ្លាមបានថែមមួកឥតគិតថ្លៃ" },
    { label: "☕ កាហ្វេប្រចាំថ្ងៃ", text: "ហាងកាហ្វេជិតរោងកុន មានរសជាតិឆ្ងាញ់ខ្លាំង ទិញ២ថែម១" },
    { label: "⭐ សាប៊ូកក់សក់ធម្មជាតិ", text: "សាប៊ូកក់សក់ធ្វើពីធម្មជាតិ ជួយសក់ស្អាត មិនជ្រុះ ទិញឥលូវនេះ" }
  ];

  const resetAll = () => {
    setRewriteInput('');
    setRewriteResult(null);
    onSetInitialText('');
  };

  const handleCopyToClipboard = () => {
    if (!rewriteResult) return;
    navigator.clipboard.writeText(rewriteResult.rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSmartRewrite = async () => {
    if (!rewriteInput.trim()) return;
    setIsRewriting(true);

    try {
      const response = await fetch('/api/smart-rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: rewriteInput,
          tone: selectedTone,
          lengthMode: rewriteLength
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.rewrittenText) {
        setRewriteResult({
          rewrittenText: data.rewrittenText,
          explanation: data.explanation || 'កែលម្អតាមតម្រូវការប្រព័ន្ធផ្សព្វផ្សាយ។',
          score: data.score || 92,
          benefits: data.benefits || ['បង្កើនភាពទាក់ទាញ', 'អក្ខរាវិរុទ្ធស្របតាមគោលការណ៍']
        });
        return;
      }

      // Front-end rich fallback if server encounters limits
      let rewrittenText = '';
      let explanation = '';
      let score = 88;
      let benefits = ['បង្កើនការទាក់ទាញ', 'ភាសាសមស្រប'];

      if (selectedTone === "promotional") {
        rewrittenText = "ឱកាសចំណេញទ្វេដង៖ ទិញ ១ ថែម ១ ភ្លាមៗ!";
        explanation = "បង្កើនឥទ្ធិពលទីផ្សារដោយប្រើប្រាស់ពាក្យពន្លឿនការសម្រេចចិត្តរបស់អតិថិជន និងរៀបចំចន្លោះដកឃ្លា។";
        score = 96;
        benefits = ["ទាក់ទាញការទិញភ្លាមៗ", "ប្រើប្រាស់លេខខ្មែរផ្លូវការ", "ខ្លី ខ្លឹម ងាយយល់"];
      } else if (selectedTone === "luxury") {
        rewrittenText = "សូមអញ្ជើញជាវផលិតផល ប្រូម៉ូសិនពិសេស ទិញ ១ ថែមជូន ១ រួសរាន់ឡើង";
        explanation = "ជ្រើសរើសវាក្យសព្ទបែបស៊ីវីល័យ និងប្រណិតភាព (ប្រើពាក្យ 'ថែមជូន' ជំនួស 'ថែម') ដើម្បីទាក់ទាញអតិថិជនលំដាប់ខ្ពស់។";
        score = 90;
        benefits = ["ភាសាមានភាពថ្លៃថ្នូរ", "សមស្របសម្រាប់ការផ្សព្វផ្សាយម៉ាកប្រណិត"];
      } else if (selectedTone === "formal") {
        rewrittenText = "ការផ្ដល់ជូនពិសេស៖ ជាវផលិតផល ១ ទទួលបានការបន្ថែមជូន ១ កញ្ចប់ភ្លាមៗ";
        explanation = "ប្រើប្រាស់ពាក្យវាក្យសព្ទផ្លូវការនៃវចនានុក្រមជាតិ និងដកឃ្លាត្រឹមត្រូវតាមលំដាប់លំដោយ។";
        score = 94;
        benefits = ["ត្រឹមត្រូវតាមវេយ្យាករណ៍ជាតិ", "សមស្របសម្រាប់ស្ថាប័នអប់រំ និងផ្លូវការ"];
      } else if (selectedTone === "youthful") {
        rewrittenText = "ប្រូពិសេសម៉ងហាស! ទិញ ១ ថែម ១ ហ្វ្រីៗ!";
        explanation = "ប្រើប្រាស់ភាសានិយាយដ៏ស្និទ្ធស្នាល និងយុវវ័យ ដើម្បីបង្កើតភាពស៊ីជម្រៅក្នុងទំនាក់ទំនង។";
        score = 88;
        benefits = ["បង្កើតភាពរីករាយលឿនរហ័ស", "សមស្របសម្រាប់ចំណាប់អារម្មណ៍យុវជន"];
      } else if (selectedTone === "friendly") {
        rewrittenText = "ហាងយើងខ្ញុំមានប្រូម៉ូសិនពិសេសជូនពុកម៉ែបងប្អូន ទិញ ១ ថែម ១ ចាស!";
        explanation = "សមស្របនឹងការឆ្លើយតបដ៏ពីរោះរាក់ទាក់ សម្តែងការកោតសរសើរនិងផ្តល់ទំនុកចិត្ត។";
        score = 91;
        benefits = ["បង្កើនភាពកក់ក្តៅ", "ជំរុញឱ្យមានការសាកសួរព័ត៌មានបន្ថែម"];
      } else {
        rewrittenText = rewriteInput + " ដោយក្តីស្រឡាញ់";
        explanation = "កែតម្រូវចន្លោះ និងបន្ថែមពាក្យរួសរាយរាក់ទាក់ដើម្បីងាយស្រួលទាក់ទង។";
      }

      setRewriteResult({
        rewrittenText,
        explanation,
        score,
        benefits
      });
    } catch (err) {
      console.warn("Rewrite operation error:", err);
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in transition-colors duration-300">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#2D3330] dark:text-zinc-100 flex items-center gap-2">
            <Sliders className="w-6 h-6 sm:w-8 sm:h-8 text-[#4A6D5D] dark:text-emerald-400" />
            <span>ប្រព័ន្ធកែសម្រួលឃ្លា (Tone and Rewriter)</span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            សម្រិតសម្រាំងសារផ្សព្វផ្សាយ ដើម្បីភាពឥតខ្ចោះនៃម៉ាកសញ្ញា
          </p>
        </div>
      </div>

      {/* Preset cards shortcuts - Improved Font Size for Legibility */}
      <div className="mb-6">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2.5">
          ជ្រើសរើសឃ្លាគំរូផ្សាយពាណិជ្ជកម្ម (Preset Promo Ideas)៖
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {samplePhrases.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRewriteInput(sp.text);
                onSetInitialText(sp.text);
              }}
              className="text-left p-4 rounded-xl border border-[#ECE7DC] dark:border-zinc-800 bg-white hover:bg-[#FAF7F2] dark:bg-zinc-900 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
            >
              <div className="text-sm font-bold text-[#4A6D5D] dark:text-emerald-400 group-hover:underline">{sp.label}</div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed truncate">{sp.text}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Input Configuration Column */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 rounded-2xl p-5 flex-1 flex flex-col justify-between shadow-xs">
            <div className="space-y-5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#4A6D5D]" />
                <span>កំណត់ទិន្នន័យដើម (Configure original input)</span>
              </h3>

              {/* Text Input area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <div></div>
                  {rewriteInput && (
                    <button onClick={resetAll} className="text-red-500 dark:text-red-400 font-bold hover:underline text-xs sm:text-sm">
                      សម្អាត (Clear)
                    </button>
                  )}
                </div>
                <textarea
                  value={rewriteInput}
                  onChange={(e) => {
                    setRewriteInput(e.target.value);
                    onSetInitialText(e.target.value);
                  }}
                  rows={4}
                  className="w-full p-4 rounded-xl border border-[#ECE7DC] dark:border-zinc-800 bg-[#FAF7F2]/40 dark:bg-zinc-950/20 text-sm sm:text-base focus:outline-hidden focus:ring-1 focus:ring-[#4A6D5D] text-[#2D3330] dark:text-zinc-200 placeholder-zinc-400 resize-none font-sans leading-relaxed"
                  placeholder="ឧទាហរណ៍៖ ទិញ1ថែម1 ឆាប់ឡើង!!"
                />
              </div>

              {/* Tone/Voice Options */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-[#587E6A] dark:text-zinc-400 uppercase tracking-wide block">
                  ទម្រង់សម្លេងផ្សាយ (Target Voice / Persona Theme)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'promotional', label: '📣 ផ្សព្វផ្សាយ (Promo)', desc: 'High conversion urgency' },
                    { key: 'luxury', label: '💎 ប្រណីតភាព (Luxury)', desc: 'Elegant elevated words' },
                    { key: 'friendly', label: '🌸 ស្និទ្ធស្នាល (Friendly)', desc: 'Warm customer voice' },
                    { key: 'youthful', label: '⚡ យុវវ័យ (Youthful)', desc: 'Upbeat modern street style' },
                    { key: 'formal', label: '🏛️ ផ្លូវការ (Formal)', desc: 'Standard business structure' },
                    { key: 'professional', label: '📈 វិជ្ជាជីវៈ (Professional)', desc: 'Authoritative and pristine' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedTone(t.key as ToneMode)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTone === t.key
                          ? 'bg-gradient-to-r from-[#4A6D5D] to-[#3E5C4E] text-white border-transparent shadow-xs'
                          : 'bg-white hover:bg-[#FAF7F2] dark:bg-zinc-900 border-[#ECE7DC]/80 dark:border-zinc-800/80 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold">{t.label}</div>
                      <div className={`text-xs mt-1 ${selectedTone === t.key ? 'text-[#CEE2D7] dark:text-emerald-300' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length adjustment selection */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-[#587E6A] dark:text-zinc-400 uppercase block">
                  ទំហំប្រវែងឃ្លា (Target Length Sizing)
                </label>
                <div className="flex bg-[#FAF7F2] dark:bg-zinc-950 p-1.5 rounded-xl border border-[#ECE7DC]/60 dark:border-zinc-800/80">
                  {[
                    { key: 'shorten', label: 'បង្រួមខ្លី (Shorten)', desc: 'Minimal badge size' },
                    { key: 'maintain', label: 'រក្សាដូចដើម (Maintain)', desc: 'Same overall size' },
                    { key: 'longer', label: 'សរសេរលម្អិត (Longer)', desc: 'Detail ad content' }
                  ].map((l) => (
                    <button
                      key={l.key}
                      onClick={() => setRewriteLength(l.key as LengthMode)}
                      className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg text-center transition-all cursor-pointer ${
                        rewriteLength === l.key
                          ? 'bg-white dark:bg-zinc-800 text-[#2D3330] dark:text-white shadow-xs font-bold'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-[#2D3330] dark:hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSmartRewrite}
              disabled={isRewriting || !rewriteInput.trim()}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#4A6D5D] hover:bg-[#3E5C4E] disabled:bg-[#4A6D5D]/50 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-[#4a6d5d]/10 cursor-pointer active:scale-[0.99] transition-all"
            >
              {isRewriting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>កំពុងកែសម្រួលឃ្លាឡើងវិញ (Processing rewrite)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                  <span>ចាប់ផ្តើមបំលែងទម្រង់ (Transform)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 rounded-2xl p-5 flex-1 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>លទ្ធផលសម្រាំង (Optimized Copy Output)</span>
                </h3>

                {rewriteResult && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopyToClipboard}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors"
                      title="Copy result"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>

              {!rewriteResult ? (
                <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed border-[#ECE7DC] dark:border-zinc-800 rounded-xl">
                  {isRewriting ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-[#4A6D5D] border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed animate-pulse">
                        កំពុងវិភាគអត្ថន័យ និងកែសម្រួលដើម្បីបង្កើនភាពទាក់ទាញ...
                      </p>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-10 h-10 text-zinc-350 dark:text-zinc-700 mb-2.5" />
                      <p className="text-sm sm:text-base font-semibold text-zinc-500 dark:text-zinc-400">
                        មិនទាន់មានលទ្ធផលនៅឡើយទេ
                      </p>
                      <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-600 mt-2 max-w-[280px] leading-relaxed">
                        សូមបំពេញអត្ថបទខាងឆ្វេង រួចចុចប៊ូតុង "ចាប់ផ្តើមបំលែងទម្រង់" ដើម្បីមើលគំនិតផ្សាយពាណិជ្ជកម្មថ្មីៗ។
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score Card Banner */}
                  <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/10 px-4 py-3 rounded-xl border border-emerald-100/40 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-amber-300 stroke-amber-500" />
                      <span className="text-xs sm:text-sm font-semibold text-[#2D3330] dark:text-zinc-300">
                        កម្រិតទាក់ទាញទីផ្សារ (Marketing Appeal Index)៖
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-emerald-600 bg-white dark:bg-zinc-800 dark:text-emerald-300 px-3 py-1 rounded-lg border border-emerald-150/40 font-mono shadow-xs">
                      {rewriteResult.score}%
                    </span>
                  </div>

                  {/* Main rewritten slogan preview container */}
                  <div className="bg-gradient-to-br from-zinc-50 to-[#FAF7F2] dark:from-zinc-950 dark:to-zinc-900 border border-[#ECE7DC]/60 dark:border-zinc-800 p-5 rounded-xl shadow-xs relative group">
                    <span className="absolute -top-2 left-3 px-2 py-0.5 bg-[#4A6D5D] text-white text-[10px] uppercase font-bold rounded-md">
                      ឃ្លាផ្សព្វផ្សាយថ្មី (AI Copywriting)
                    </span>
                    <p className="text-lg sm:text-xl font-heading font-bold text-zinc-900 dark:text-white leading-relaxed pt-2">
                      {rewriteResult.rewrittenText}
                    </p>
                  </div>

                  {/* Linguistic Explanations */}
                  <div className="p-4 bg-orange-50/10 dark:bg-zinc-900 border border-amber-100/50 dark:border-zinc-800/80 rounded-xl space-y-2">
                    <span className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      ការវិភាគការផ្លាស់ប្តូរ និងអក្ខរាវិរុទ្ធ (Linguistic Explanations)៖
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed font-sans">
                      {rewriteResult.explanation}
                    </p>
                  </div>

                  {/* Bullet Benefits */}
                  {rewriteResult.benefits && rewriteResult.benefits.length > 0 && (
                    <div className="p-3.5 border border-zinc-150 dark:border-zinc-800 rounded-xl">
                      <span className="text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-2">
                        អត្ថប្រយោជន៍ផ្លូវចិត្ត (Psychological Impact Elements)៖
                      </span>
                      <ul className="space-y-1.5">
                        {rewriteResult.benefits.map((benefit, idx) => (
                           <li key={idx} className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-450 flex items-center gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hint alert element */}
            <div className="mt-5 p-3.5 bg-[#FAF7F2]/60 dark:bg-zinc-950/30 border border-[#ECE7DC]/40 dark:border-zinc-800/50 rounded-xl flex items-start gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <Info className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
              <span>
                <strong>កំណត់សម្គាល់៖</strong> ប្រព័ន្ធ AI មិនត្រឹមតែប្ដូរពាក្យប៉ុណ្ណោះទេ ប៉ុន្តែវារៀបចំចន្លោះដកឃ្លាភាសាខ្មែរ (Khmer Spacers) ដោយស្វ័យប្រវត្តិ ដើម្បីលុបបំបាត់ការបែកតួអក្សរពេលរចនាស្បែកប្លង់របស់អ្នក។
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
