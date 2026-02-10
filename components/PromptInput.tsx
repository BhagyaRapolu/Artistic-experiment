
import React, { useState, useRef } from 'react';
import { ArtStyle } from '../types';

interface PromptInputProps {
  onGenerate: (subject: string, style: ArtStyle, image?: string) => void;
  onSurpriseMe: (style: ArtStyle) => Promise<string | void>;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, onSurpriseMe, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.WATERCOLOR);
  const [isFocused, setIsFocused] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() || uploadedImage) {
      onGenerate(subject, style, uploadedImage || undefined);
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
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 px-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Style Selector - Optimized for 16 styles */}
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

        {/* The Command Card */}
        <div className="relative">
          <div className={`
            flex flex-col sm:flex-row items-center gap-0 
            bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden
            ${isFocused ? 'border-amber-300 shadow-2xl ring-4 ring-amber-50/50' : 'border-slate-100 shadow-xl shadow-slate-200/50'}
          `}>
            <div className="flex-grow flex items-center w-full min-h-[76px]">
              {/* Image Upload Trigger / Preview */}
              <div className="pl-6 flex items-center">
                {uploadedImage ? (
                  <div className="relative group w-12 h-12">
                    <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover rounded-xl ring-2 ring-amber-100" />
                    <button 
                      type="button" 
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-3 text-slate-300 hover:text-amber-500 transition-colors bg-slate-50 rounded-2xl border border-dashed border-slate-200"
                    title="Upload reference image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                placeholder={uploadedImage ? "Describe changes or style details..." : `Envision your ${style.toLowerCase()}...`}
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
        </div>
        
        {/* Infinite Inspiration Trigger */}
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
