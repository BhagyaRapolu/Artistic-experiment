
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArtStyle, AspectRatio } from '../types';

interface PromptInputProps {
  onGenerate: (subject: string, style: ArtStyle, aspectRatio: AspectRatio, image?: string) => void;
  onSurpriseMe: (style: ArtStyle) => Promise<string | void>;
  isLoading: boolean;
  initialValue?: string;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
  { value: "1:1", label: "Square", icon: <div className="w-3 h-3 border-2 border-current rounded-sm" /> },
  { value: "4:3", label: "Classic", icon: <div className="w-4 h-3 border-2 border-current rounded-sm" /> },
  { value: "16:9", label: "Wide", icon: <div className="w-5 h-2.5 border-2 border-current rounded-sm" /> },
  { value: "3:4", label: "Portrait", icon: <div className="w-2.5 h-3.5 border-2 border-current rounded-sm" /> },
  { value: "9:16", label: "Tall", icon: <div className="w-2 h-4 border-2 border-current rounded-sm" /> },
];

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, onSurpriseMe, isLoading, initialValue }) => {
  const [subject, setSubject] = useState(initialValue || '');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.WATERCOLOR);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValue && !subject) {
      setSubject(initialValue);
    }
  }, [initialValue]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0];
    if (item?.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) processFile(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() || uploadedImage) {
      onGenerate(subject, style, aspectRatio, uploadedImage || undefined);
    }
  };

  const handleRandomize = async () => {
    const newSubject = await onSurpriseMe(style);
    if (newSubject) {
      setSubject(newSubject);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 px-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Style Selection */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {Object.values(ArtStyle).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                style === s 
                  ? 'bg-slate-900 text-white shadow-lg scale-105 ring-2 ring-slate-900 ring-offset-2' 
                  : 'bg-white/60 text-slate-500 border border-slate-100 hover:text-slate-800 hover:bg-white shadow-sm'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Selection */}
        <div className="flex justify-center gap-4">
          <div className="bg-white/40 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                type="button"
                onClick={() => setAspectRatio(ar.value)}
                disabled={isLoading}
                title={ar.label}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  aspectRatio === ar.value
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {ar.icon}
                <span className="text-[10px] font-black tracking-widest uppercase">{ar.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Input Field with Drag & Drop */}
        <div 
          className="relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
        >
          <div className={`
            flex flex-col sm:flex-row items-center gap-0 
            bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden
            ${isFocused || isDragging ? 'border-amber-300 shadow-2xl ring-4 ring-amber-50/50' : 'border-slate-100 shadow-xl shadow-slate-200/50'}
            ${isDragging ? 'bg-amber-50/30 scale-[1.01]' : ''}
          `}>
            <div className="flex-grow flex items-center w-full min-h-[76px]">
              <div className="pl-6 flex items-center">
                {uploadedImage ? (
                  <div className="relative group w-14 h-14">
                    <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover rounded-xl ring-2 ring-amber-200 shadow-md" />
                    <button 
                      type="button" 
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Reference"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-[8px] text-white font-black uppercase px-1 rounded shadow-sm">Ref</div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className={`
                      p-4 text-slate-300 hover:text-amber-500 hover:bg-amber-50 hover:border-amber-200 
                      transition-all bg-slate-50/50 rounded-2xl border border-dashed border-slate-200
                      ${isDragging ? 'border-amber-400 text-amber-500 bg-amber-50' : ''}
                    `}
                    title="Upload or Drag Reference Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <input
                type="text"
                value={subject}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={uploadedImage ? "Describe transformation or artistic shifts..." : isDragging ? "Drop your muse here..." : `Envision your ${style.toLowerCase()}... (Paste image here)`}
                className="w-full bg-transparent px-5 py-6 text-lg sm:text-xl font-serif italic text-slate-700 placeholder:text-slate-300 focus:outline-none"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || (!subject.trim() && !uploadedImage)}
              className={`
                w-full sm:w-auto min-w-[180px] h-[76px]
                bg-slate-900 text-white font-bold tracking-[0.15em] uppercase text-xs
                hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed 
                transition-all duration-300 active:scale-[0.98]
                flex items-center justify-center gap-2 px-10
              `}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>{uploadedImage ? 'Re-imagine' : 'Inspire'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
          {isDragging && (
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="bg-amber-400 text-white font-black uppercase tracking-[0.3em] px-8 py-4 rounded-full shadow-2xl animate-bounce">
                Drop Image
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center -mt-2">
          <button
            type="button"
            onClick={handleRandomize}
            disabled={isLoading}
            className="group flex items-center gap-3 px-6 py-2 rounded-full bg-amber-50/30 hover:bg-amber-100/60 border border-amber-100/40 transition-all duration-300 shadow-sm"
          >
            <div className={`p-1 rounded-full bg-white shadow-sm transition-transform group-hover:rotate-180 duration-700 ${isLoading ? 'animate-spin text-amber-600' : 'text-amber-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-amber-800/70 uppercase tracking-[0.2em]">
              {isLoading ? 'Ideating...' : 'Random Inspiration'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
