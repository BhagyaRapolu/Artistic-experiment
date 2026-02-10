
import React, { useState } from 'react';
import { GeneratedPortrait, GenerationStatus, ArtStyle, ErrorDetails } from '../types';

interface PortraitDisplayProps {
  portrait: GeneratedPortrait | null;
  status: GenerationStatus;
  pendingPrompt?: string;
  pendingStyle?: ArtStyle | null;
  errorDetails?: ErrorDetails | null;
  onRetry?: () => void;
  isCacheHit?: boolean;
}

const PortraitDisplay: React.FC<PortraitDisplayProps> = ({ 
  portrait, 
  status, 
  pendingPrompt, 
  errorDetails,
  onRetry,
  isCacheHit
}) => {
  const [copied, setCopied] = useState(false);

  if (status === GenerationStatus.IDLE) return null;

  if (status === GenerationStatus.GENERATING_IDEA || status === GenerationStatus.LOADING_IMAGE || status === GenerationStatus.LOADING_INSPIRATION) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-6 text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 uppercase tracking-[0.4em] text-[10px] font-black mb-4">
          {status === GenerationStatus.GENERATING_IDEA ? "Whispering to Muse" : "Mixing Pigments"}
        </p>
        <h2 className="text-2xl font-serif italic text-slate-800 animate-pulse">
          {pendingPrompt ? `"${pendingPrompt}"` : 'Envisioning...'}
        </h2>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR || !portrait) {
    const isSafety = errorDetails?.message === 'moderated_content';
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 max-w-2xl mx-auto px-10 text-center shadow-xl">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-serif italic mb-2">Canvas Blocked</h2>
        <p className="text-slate-500 mb-8">
          {isSafety ? "This prompt touched on restricted themes. Try a different artistic direction." : "The studio connection flickered. Let's try to mix the paints again."}
        </p>
        <button onClick={onRetry} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">Retry Process</button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(portrait.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="relative group">
          <div className="absolute -inset-4 bg-amber-50 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-white p-4 shadow-2xl rounded-xl border border-slate-100 overflow-hidden">
            <img src={portrait.imageUrl} alt={portrait.prompt} className="w-full h-auto rounded shadow-inner" />
            <div className="mt-6 flex justify-between items-end border-t border-slate-50 pt-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Authentic Study</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-serif italic text-slate-800">{portrait.style}</span>
                  <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-400 font-bold uppercase">{portrait.aspectRatio}</span>
                </div>
              </div>
              {isCacheHit && <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold uppercase tracking-tighter">Archived Piece</span>}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl text-slate-900 leading-tight">Artistic Insight</h2>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Current Subject:</span>
              <button onClick={handleCopy} className="text-[10px] hover:text-amber-600 transition-colors uppercase tracking-widest font-bold flex items-center gap-2">
                {copied ? "Copied" : "Copy Prompt"}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
            <p className="text-xl font-serif italic text-slate-600 leading-relaxed">"{portrait.prompt}"</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="p-8 border border-slate-100 rounded-3xl bg-white/50 backdrop-blur-sm shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-4">Technical Breakdown</h3>
              <p className="text-slate-700 leading-relaxed font-serif text-xl italic mb-6">{portrait.inspiration.technique}</p>
              <div className="flex flex-wrap gap-2">
                {portrait.inspiration.palette.map((c, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 rounded-full uppercase tracking-wider">{c}</span>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-4">The Student's Challenge</h3>
              <p className="font-serif italic text-lg leading-relaxed text-slate-300">{portrait.inspiration.challenge}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortraitDisplay;
