import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, Check, Copy, RefreshCw, Languages, 
  Sparkles, FileImage, Download, ArrowRight, CornerDownLeft, AlertCircle
} from 'lucide-react';
import Tesseract from 'tesseract.js';

interface OcrConverterProps {
  onPasteToTone: (text: string) => void;
}

export default function OcrConverter({ onPasteToTone }: OcrConverterProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('khm+eng');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [inputFileName, setInputFileName] = useState<string>('');
  const [inputFileSize, setInputFileSize] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសប្រភេទរូបភាពតែប៉ុណ្ណោះ! (Please select an image file)');
      return;
    }
    setInputFileName(file.name);
    setInputFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setExtractedText('');
      setProgress(0);
      setStatusText('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleOcrConvert = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText('កំពុងរៀបចំឧបករណ៍ស្កេន (Initializing OCR)...');

    try {
      const result = await Tesseract.recognize(
        imageSrc,
        selectedLang,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatusText(`កំពុងស្កេន និងបកប្រែរកអត្ថបទ (Recognizing)៖ ${Math.round(m.progress * 100)}%`);
            } else {
              // Translate common statuses for Khmer friendliness
              const statusMap: Record<string, string> = {
                'loading tesseract core': 'កំពុងទាញយកម៉ាស៊ីនស្នូល...',
                'initializing tesseract': 'កំពុងចាប់ផ្តើមដំណើរការ...',
                'loading language traineddata': 'កំពុងទាញយកទិន្នន័យភាសា...',
                'initializing api': 'កំពុងភ្ជាប់ API...',
              };
              setStatusText(statusMap[m.status] || `ស្ថានភាព៖ ${m.status}...`);
            }
          }
        }
      );

      setExtractedText(result.data.text || '');
      setStatusText('បំប្លែងរូបភាពទៅជាអត្ថបទជោគជ័យ! (Successfully converted)');
    } catch (error) {
      console.error('OCR Error:', error);
      setStatusText('មានបញ្ហាក្នុងការស្កេនរករូបភាព។ សូមព្យាយាមម្តងទៀត។ (OCR conversion error)');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Khmer-OCR-Text-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setImageSrc(null);
    setInputFileName('');
    setInputFileSize('');
    setExtractedText('');
    setProgress(0);
    setStatusText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in transition-colors duration-300">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2D3330] dark:text-zinc-100 flex items-center gap-2">
            <Languages className="w-6 h-6 text-[#4A6D5D] dark:text-emerald-400" />
            <span>ប្រព័ន្ធបំប្លែងរូបភាពទៅជាអត្ថបទ (OCR Converter)</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            ស្កេន និងស្រង់យកអត្ថបទភាសាខ្មែរ និងអង់គ្លេសចេញពីរូបភាព ផ្ទាំងផ្សព្វផ្សាយ ឬរូបថតដោយស្វ័យប្រវត្តិ។
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#EFEBE4] dark:bg-zinc-900 border border-[#ECE7DC]/40 dark:border-zinc-800/50 p-1.5 rounded-xl">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-2 uppercase tracking-wide">
            ភាសាស្កេន (Language)៖
          </span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            disabled={isProcessing}
            className="text-xs bg-white dark:bg-zinc-800 text-[#2D3330] dark:text-zinc-200 border border-[#ECE7DC] dark:border-zinc-700 rounded-lg px-2.5 py-1 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4A6D5D]/50"
          >
            <option value="khm+eng">ខ្មែរ + English (លាយគ្នា)</option>
            <option value="khm">ភាសាខ្មែរតែប៉ុណ្ណោះ (Khmer Only)</option>
            <option value="eng">English Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Upload Zone / Preview Area */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 rounded-2xl p-5 flex-1 flex flex-col shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 mb-4 flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              <span>រូបភាពតម្រូវការបំប្លែង (Source Image)</span>
            </h3>

            {!imageSrc ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`flex-1 min-h-[350px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-[#4A6D5D] bg-[#4A6D5D]/5 dark:bg-emerald-950/10'
                    : 'border-[#CEE2D7] hover:border-[#4A6D5D] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] dark:border-zinc-800 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-xs text-[#587E6A] dark:text-emerald-400 mb-4 border border-[#ECE7DC]/60 dark:border-zinc-800">
                  <Upload className="w-8 h-8 animate-bounce" />
                </div>
                
                <p className="text-sm font-bold text-[#2D3330] dark:text-zinc-200">
                  ទាញរូបភាពមកដាក់ទីនេះ ឬ ចុចដើម្បីស្វែងរកឯកសារ
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  គាំទ្ររាល់ឯកសាររូបភាពប្រភេទ JPEG, PNG, ឬ WebP។ មានប្រសិទ្ធភាពខ្ពស់លើរូបថតដែលមានពុម្ពអក្សរច្បាស់ល្អ។
                </p>
                
                <button
                  type="button"
                  className="mt-6 px-4 py-2 bg-[#4A6D5D] text-white hover:bg-[#3E5C4E] rounded-xl text-xs font-bold shadow-xs transition-colors duration-200"
                >
                  ជ្រើសរើសរូបភាព
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                <div className="relative border border-[#ECE7DC]/80 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl flex items-center justify-center min-h-[280px] max-h-[380px] overflow-hidden">
                  <img
                    src={imageSrc}
                    alt="Upload Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                  <button
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5 shadow-md transition-colors duration-200"
                    title="លុបចោលដើម្បីជ្រើសរូបថ្មី"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* File info card */}
                <div className="mt-4 p-3 bg-[#FAF7F2] dark:bg-zinc-950/60 border border-[#ECE7DC]/50 dark:border-zinc-800/80 rounded-xl flex justify-between items-center text-xs">
                  <div className="truncate pr-4">
                    <p className="font-bold text-[#2D3330] dark:text-zinc-200 truncate">{inputFileName}</p>
                    <p className="text-zinc-400 text-[10px] mt-0.5">{inputFileSize}</p>
                  </div>
                  <span className="shrink-0 text-[#2D3330] dark:text-zinc-400 font-mono bg-[#EFEBE4] dark:bg-zinc-900 px-2 py-1 rounded">
                    {selectedLang === 'khm+eng' ? 'Khmer + Eng' : selectedLang === 'khm' ? 'Khmer Only' : 'English Only'}
                  </span>
                </div>

                {/* Progress Tracking Bar */}
                {isProcessing && (
                  <div className="mt-4 p-4 border border-[#EED8A1]/40 bg-[#FBF8F1] dark:bg-amber-950/10 rounded-xl animate-pulse">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-bold text-[#7D5B1A] dark:text-amber-400 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {statusText}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#7D5B1A] dark:text-amber-400">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Trigger convert action if not yet processing */}
                {!isProcessing && !extractedText && (
                  <button
                    onClick={handleOcrConvert}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#4A6D5D] hover:bg-[#3E5C4E] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>បំប្លែងរូបភាពទៅជាអត្ថបទ (Convert to Text)</span>
                  </button>
                )}

                {extractedText && (
                  <button
                    onClick={resetAll}
                    className="mt-4 w-full flex items-center justify-center gap-2 border border-[#ECE7DC] dark:border-zinc-800 hover:bg-[#FAF7F2] dark:hover:bg-zinc-900 text-[#2D3330] dark:text-zinc-300 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-[#587E6A]" />
                    <span>ជ្រើសរើសរូបភាពថ្មីម្តងទៀត (Start Over)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Processed Text Display */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white dark:bg-zinc-900 border border-[#ECE7DC] dark:border-zinc-800/80 rounded-2xl p-5 flex-1 flex flex-col shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#587E6A] dark:text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>លទ្ធផលស្កេនអត្ថបទ (Extracted Text Result)</span>
              </h3>
              
              {extractedText && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyToClipboard}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors"
                    title="ចម្លងទៅខ្ទង់សតិ (Copy)"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors"
                    title="ទាញយកជាឯកសារ .txt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {!extractedText ? (
                <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed border-[#ECE7DC] dark:border-zinc-800 rounded-xl">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed animate-pulse">
                        {statusText || 'កំពុងដំណើរការបំលែងទៅជាអត្ថបទ...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-2.5" />
                      <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                        មិនទាន់មានលទ្ធផលនៅឡើយទេ
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1 max-w-[280px]">
                        សូមបញ្ចូលរូបភាព និង ចុចប៊ូតុង "បំប្លែងរូបភាពទៅជាអត្ថបទ" ដើម្បីចាប់ផ្តើមបំប្លែង។
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="flex-1 flex flex-col">
                    <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1.5">
                      អ្នកអាចពិនិត្យ ឬកែសម្រួលអត្ថបទខាងក្រោម (Editable TextArea)៖
                    </label>
                    <textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="w-full flex-1 min-h-[290px] text-sm leading-relaxed p-4 border border-[#ECE7DC] dark:border-zinc-800 bg-[#FAF7F2]/30 dark:bg-zinc-950/40 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4A6D5D]/50 text-[#2D3330] dark:text-zinc-200 font-sans resize-none"
                    />
                  </div>

                  {/* Actions to interact with external modules */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => onPasteToTone(extractedText)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#E6EFEA] hover:bg-[#CEE2D7] dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-[#324B3F] dark:text-emerald-300 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200"
                    >
                      <CornerDownLeft className="w-4 h-4 shrink-0 text-[#4A6D5D] dark:text-emerald-400" />
                      <span>បញ្ជូនទៅផ្ទាំង "កែសម្រួលឃ្លា" (Paste to Tone Editor)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quality advice */}
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-[#ECE7DC]/40 dark:border-zinc-800/60 rounded-xl flex items-start gap-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                <strong>គន្លឹះដើម្បីទទួលបានលទ្ធផលល្អ៖</strong> ប្រព័ន្ធស្កេនត្រូវការរូបភាពដែលមានពន្លឺគ្រប់គ្រាន់ ពុម្ពអក្សរត្រង់កម្រិតខ្ពស់ និងមិនមានការបិទបាំង។ ប្រសិនបើពាក្យខ្លះមិនត្រឹមត្រូវ លោកអ្នកអាចកែតម្រូវវាដោយផ្ទាល់ក្នុងផ្ទាំងខាងលើ។
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
