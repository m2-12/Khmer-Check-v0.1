import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Upload, FileImage, Layers, HelpCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
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

  // Maps category tag to glowing bounding box borders
  const getBoxStyle = (category: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-2 border-violet-600 dark:border-violet-400 bg-violet-600/15 ring-2 ring-violet-500/40 animate-pulse';
    }
    switch (category) {
      case 'spelling':
        return 'border border-rose-500 bg-rose-500/10 hover:bg-rose-500/25';
      case 'grammar':
        return 'border border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/25';
      case 'spacing':
        return 'border border-amber-500 bg-amber-500/10 hover:bg-amber-500/25';
      case 'typography':
        return 'border border-sky-500 bg-sky-500/10 hover:bg-sky-500/25';
      case 'tone':
        return 'border border-pink-500 bg-pink-500/10 hover:bg-pink-500/25';
      default:
        return 'border border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/15';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'spelling': return 'អក្ខរាវិរុទ្ធ';
      case 'grammar': return 'វេយ្យាករណ៍';
      case 'spacing': return 'ដកឃ្លា';
      case 'typography': return 'ពុម្ពអក្សរ';
      case 'tone': return 'កែសម្រួលដិត';
      default: return 'ប្រក្រតី';
    }
  };

  return (
    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 flex flex-col min-h-[500px] border border-zinc-200/50 dark:border-zinc-800/60 rounded-3xl overflow-hidden relative shadow-inner">
      {/* Top bar toolbar */}
      {imageSrc && (
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 py-2 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <Layers className="w-4 h-4 text-violet-500" />
            <span>ផ្ទាំងពិនិត្យអន្តរកម្ម (Interactive Design Stage)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold w-12 text-center text-zinc-700 dark:text-zinc-300">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Fit Screen"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto min-h-[440px]">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-100 dark:border-violet-950 rounded-full animate-pulse"></div>
              <div className="w-16 h-16 border-4 border-t-violet-600 rounded-full animate-spin absolute inset-0"></div>
            </div>
            <div className="text-center">
              <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5">
                <RefreshCw className="w-4 h-4 animate-spin text-violet-500" />
                កំពុងទាញយកអត្ថបទ និងកែតម្រូវភាសាខ្មែរ...
              </h5>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                Gemini high-fidelity cognitive OCR is parsing coordinates, analyzing glyph spellings, and identifying layout spacing conflicts.
              </p>
            </div>
          </div>
        ) : imageSrc ? (
          <div
            className="relative bg-zinc-800/5 dark:bg-zinc-900/40 p-2 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 shadow-lg transition-transform duration-300 origin-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* The Design Image */}
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={imageSrc}
                alt="Khmer poster workspace"
                className="max-h-[65vh] object-contain block w-auto pointer-events-none"
              />

              {/* Absolute Overlay Bounding Boxes */}
              <div className="absolute inset-0 select-none">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className={`absolute rounded-xs cursor-pointer transition-all duration-200 flex flex-col justify-between group ${getBoxStyle(
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
                    {/* Bounding box mini tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-zinc-950 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 transition-all font-sans leading-none flex items-center gap-1">
                      <span className="font-mono bg-violet-600 px-1 rounded text-[9px] uppercase">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="truncate max-w-[120px]">{item.originalText}</span>
                    </div>

                    {/* Left side accent indicator */}
                    <span className="w-1 h-3/4 self-center absolute left-1 rounded-full opacity-55" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Uploader Screen */
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-violet-500 bg-violet-50/10'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-violet-400 dark:hover:border-violet-900 bg-white dark:bg-zinc-900/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div className="w-16 h-16 bg-gradient-to-tr from-violet-100 to-blue-50 dark:from-zinc-800 dark:to-zinc-800 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 shadow-sm">
                <FileImage className="w-8 h-8" />
              </div>

              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                អូស និងទម្លាក់រូបភាពផ្ទាំងផ្សាយពាណិជ្ជកម្មរបស់អ្នកទីនេះ
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
                គាំទ្ររូបភាពប្រភេទ JPEG, PNG ឬ WebP។ AI នឹងស្កេនទាញយកអត្ថបទភាសាខ្មែរ រួចកែសម្រួលអក្ខរាវិរុទ្ធ ដកឃ្លា និងរូបរាងពុម្ពអក្សរ។
              </p>

              <button className="mt-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-95 transition-all">
                ជ្រើសរើសរូបភាព (Browse Poster)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Quick Info */}
      {imageSrc && !isProcessing && (
        <div className="absolute bottom-4 left-4 bg-zinc-900/95 text-white p-3 rounded-2xl border border-zinc-800 text-xs shadow-xl hidden sm:flex items-center gap-3 max-w-sm backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-violet-400 shrink-0" />
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>គន្លឹះផ្ទាំងការងារ (Tip)</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
              Click on any highlighted text block on the poster mock to inspect the spellcheck details or apply alternate marketing taglines instantly!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
