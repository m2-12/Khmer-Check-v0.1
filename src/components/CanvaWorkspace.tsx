import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Upload, FileImage, Layers, AlertCircle, Sparkles, RefreshCw, Star } from 'lucide-react';
import { CorrectionItem } from '../types';

interface CanvaWorkspaceProps {
  imageSrc: string | null;
  onImageUploaded: (file: File) => void;
  items: CorrectionItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  isProcessing: boolean;
  onLoadSample: (sampleKey: string) => void;
}

export default function CanvaWorkspace({
  imageSrc,
  onImageUploaded,
  items,
  selectedItemId,
  onSelectItem,
  isProcessing,
  onLoadSample
}: CanvaWorkspaceProps) {
  const [zoom, setZoom] = useState<number>(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageUploaded(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUploaded(e.target.files[0]);
    }
  };

  const getBoxStyle = (category: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-2 border-[#DDAE3B] dark:border-amber-400 bg-[#EED8A1]/20 ring-2 ring-[#DDAE3B]/40 animate-pulse scale-102';
    }
    switch (category) {
      case 'spelling':
        return 'border border-rose-500 bg-rose-500/10 hover:bg-rose-500/25';
      case 'grammar':
        return 'border border-[#587E6A] bg-[#587E6A]/10 hover:bg-[#587E6A]/25';
      case 'spacing':
        return 'border border-[#DDAE3B] bg-[#DDAE3B]/10 hover:bg-[#DDAE3B]/25';
      case 'typography':
        return 'border border-sky-500 bg-sky-500/10 hover:bg-sky-500/25';
      case 'tone':
        return 'border border-pink-500 bg-pink-500/10 hover:bg-pink-500/25';
      default:
        return 'border border-[#4A6D5D] bg-[#4A6D5D]/5 hover:bg-[#4A6D5D]/15';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'spelling': return 'អក្ខរាវិរុទ្ធ';
      case 'grammar': return 'វេយ្យាករណ៍';
      case 'spacing': return 'ដកឃ្លា';
      case 'typography': return 'ពុម្ពអក្សរ';
      case 'tone': return 'កែតម្រូវទម្រង់';
      default: return 'ប្រក្រតី';
    }
  };

  return (
    <div className="flex-1 bg-[#F5F2EA]/40 dark:bg-zinc-950/40 flex flex-col min-h-[520px] border border-[#ECE7DC] dark:border-zinc-800/80 rounded-2xl overflow-hidden relative transition-colors duration-300">
      
      {/* Top bar toolbar */}
      {imageSrc && (
        <div className="bg-[#FAF7F2] dark:bg-zinc-900 border-b border-[#ECE7DC] dark:border-zinc-800/60 px-5 py-2.5 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-[#2D3330] dark:text-zinc-400 font-semibold font-heading">
            <Layers className="w-4 h-4 text-[#4A6D5D] animate-none" />
            <span>ផ្ទាំងវិភាគអន្តរកម្ម (Interactive Design Canvas Stage)</span>
          </div>

          <div className="flex items-center space-x-2 bg-white dark:bg-zinc-950 p-1 rounded-lg border border-[#ECE7DC]/60 dark:border-zinc-800/60">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-[#FAF7F2] dark:hover:bg-zinc-900 rounded-md text-[#2D3330] dark:text-zinc-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold w-12 text-center text-[#2D3330] dark:text-zinc-300">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-[#FAF7F2] dark:hover:bg-zinc-900 rounded-md text-[#2D3330] dark:text-zinc-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-[#ECE7DC] dark:bg-zinc-800 mx-1" />
            <button
              onClick={handleZoomReset}
              className="p-1.5 hover:bg-[#FAF7F2] dark:hover:bg-zinc-900 rounded-md text-zinc-500 dark:text-zinc-450 transition-colors"
              title="Fit Screen"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto min-h-[460px]">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-5 py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#EED8A1]/40 rounded-full animate-pulse"></div>
              <div className="w-16 h-16 border-4 border-t-[#4A6D5D] rounded-full animate-spin absolute inset-0"></div>
            </div>
            <div className="text-center space-y-1.5">
              <h5 className="text-sm font-bold text-[#2D3330] dark:text-zinc-200 flex items-center justify-center gap-1.5 font-heading">
                <RefreshCw className="w-4 h-4 animate-spin text-[#4A6D5D]" />
                បញ្ញាសិប្បនិម្មិតកំពុងស្កេនរូបភាព និងកែអក្ខរាវិរុទ្ធ...
              </h5>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                Gemini high-fidelity physical coordinates mapping is loading glyph clusters, analyzing fonts layout, and verifying linguistic spacers.
              </p>
            </div>
          </div>
        ) : imageSrc ? (
          <div
            className="relative bg-[#FAF7F2]/40 dark:bg-zinc-900/10 p-2.5 rounded-2xl border border-[#ECE7DC]/40 dark:border-zinc-800/40 shadow-sm transition-transform duration-300 origin-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={imageSrc}
                alt="Khmer poster workspace"
                className="max-h-[60vh] object-contain block w-auto pointer-events-none rounded-lg"
              />

              <div className="absolute inset-0 select-none">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className={`absolute rounded-xs cursor-pointer transition-all duration-300 flex flex-col justify-between group ${getBoxStyle(
                      item.category,
                      selectedItemId === item.id
                    )}`}
                    style={{
                      left: `${item.boundingBox.x}%`,
                      top: `${item.boundingBox.y}%`,
                      width: `${item.boundingBox.width}%`,
                      height: `${item.boundingBox.height}%`,
                    }}
                    title={`[${item.category}] ${item.originalText}`}
                  >
                    {/* Bounding box tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-zinc-950 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20 transition-all font-sans leading-none flex items-center gap-1.5 border border-zinc-800">
                      <span className="font-sans bg-[#DDAE3B] px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-zinc-950">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="font-bold truncate max-w-[140px]">{item.originalText}</span>
                    </div>

                    <span className="w-1 h-3/4 self-center absolute left-1 rounded-full opacity-55" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Premium Aesthetic Empty State with Interactive Galleries */
          <div className="w-full max-w-4xl flex flex-col items-center space-y-10 py-6">
            
            {/* Uploader Card */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-[#4A6D5D] bg-[#E6EFEA]/30'
                  : 'border-[#ECE7DC] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#4A6D5D]/70 dark:hover:border-emerald-600 hover:scale-101 shadow-xs'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div className="w-16 h-16 bg-[#F5F2EA] dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-[#4A6D5D] dark:text-emerald-400 mb-4 shadow-xs transition-transform duration-300 hover:scale-105">
                <Upload className="w-8 h-8 text-[#4A6D5D]" />
              </div>

              <h4 className="text-base font-heading font-bold text-[#2D3330] dark:text-white">
                ទម្លាក់រូបភាពនៅទីនេះ
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-md leading-relaxed font-sans">
                គាំទ្រប្រភេទរូបភាព JPEG, PNG, or WebP។ 
                ប្រព័ន្ធនឹងធ្វើការស្កេនដោយស្វ័យប្រវត្តិដើម្បីកែកំហុសវេយ្យាករណ៍ និងអក្សរសាស្ត្រ។
              </p>

              <button className="mt-5 bg-[#4A6D5D] hover:bg-[#3E5C4E] dark:bg-[#324B3F] dark:hover:bg-emerald-800 text-[#FAF7F2] font-semibold rounded-xl px-5 py-2.5 text-xs shadow-xs transition-all duration-200 hover:scale-102 active:scale-98">
                ចុចទីនេះ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Quick Info */}
      {imageSrc && !isProcessing && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-[#2D3330]/95 hover:bg-[#2D3330] text-white p-3.5 rounded-2xl border border-zinc-800 text-xs shadow-lg flex items-center gap-3.5 max-w-md backdrop-blur-md transition-colors duration-200 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-5 h-5 text-[#EED8A1] shrink-0 animate-none" />
          <div className="space-y-0.5">
            <div className="font-heading font-bold flex items-center gap-1.5 text-xs text-[#FAF7F2]">
              <span>គន្លឹះផ្ទាំងការងារ (Canvas Tip)</span>
            </div>
            <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">
              សូមចុចលើពាក្យដែលមាន ស៊ុមព័ទ្ធជុំវិញ លើរូបភាពដើម្បីពិនិត្យលម្អិតពីចំណុចខុសឆ្គង ឬចម្លងគំរូអត្ថបទដែលបានកែជាថ្មីភ្លាមៗ!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
