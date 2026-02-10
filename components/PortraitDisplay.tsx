
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-6 text-center animate-in fade-in duration-500">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-amber-50/50 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <p className="text-slate-400 uppercase tracking-[0.5em] text-[10px] font-black">
            {status === GenerationStatus.GENERATING_IDEA ? "Consulting the Muse" : 
             status === GenerationStatus.LOADING_IMAGE ? "Mixing Pigments" : "Analyzing Technique"}
          </p>
          <h2 className="text-3xl font-serif italic text-slate-800 animate-pulse">
            {pendingPrompt ? `"${pendingPrompt}"` : 'Visualizing concept...'}
          </h2>
        </div>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR || !portrait) {
    const isSafety = errorDetails?.message === 'moderated_content';
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 max-w-2xl mx-auto px-12 text-center shadow-2xl">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif italic mb-4">The Canvas is Silent</h2>
        <p className="text-slate-500 text-lg leading-relaxed mb-10">
          {isSafety ? "The artistic direction triggered a safety boundary. Every master must sometimes adjust their vision." : "A temporary flicker in the studio's connection occurred. Your paints are still ready."}
        </p>
        <button 
          onClick={onRetry} 
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
        >
          Retry Expression
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(portrait.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = portrait.imageUrl;
    const safeName = portrait.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    link.download = `AtelierMuse_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Artistic Study Column */}
        <div className="relative group">
          <div className="absolute -inset-6 bg-amber-50/50 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
          <div className="relative bg-white p-5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-2xl border border-slate-100 overflow-hidden transform transition-transform duration-700 hover:rotate-1">
            <div className="relative canvas-texture overflow-hidden rounded-lg shadow-inner">
              <img 
                src={portrait.imageUrl} 
                alt={portrait.prompt} 
                className="w-full h-auto block select-none" 
              />
            </div>
            
            <div className="mt-8 flex justify-between items-end border-t border-slate-50 pt-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Authentic Study № {Math.floor(Math.random()*9000)+1000}</p>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-serif italic text-slate-800">{portrait.style}</span>
                  <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                  <span className="text-[10px] bg-slate-50 px-2.5 py-1 rounded-md text-slate-400 font-bold uppercase tracking-widest">{portrait.aspectRatio}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 {isCacheHit && <span className="text-[9px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full font-black uppercase tracking-tighter">Archived Piece</span>}
                 <button 
                  onClick={handleDownload}
                  className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all group/btn bg-slate-50/50"
                  title="Preserve to Local Gallery"
                 >
                   <svg className="w-6 h-6 group-active/btn:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Column */}
        <div className="lg:pt-8 space-y-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-5xl text-slate-900 leading-[1.1]">The Insight</h2>
              <div className="h-1.5 w-20 bg-amber-400 rounded-full"></div>
            </div>
            
            <div className="flex items-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Curated Subject</span>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={handleCopy} className="text-[10px] hover:text-amber-600 transition-colors uppercase tracking-[0.2em] font-black flex items-center gap-2.5 group/copy">
                  <span className="group-hover/copy:underline">{copied ? "Copied" : "Copy Prompt"}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                </button>
              </div>
            </div>
            <p className="text-2xl font-serif italic text-slate-600 leading-relaxed font-light">"{portrait.prompt}"</p>
          </div>

          <div className="space-y-10">
            {/* Technical Detail Card */}
            <div className="p-10 border border-slate-100 rounded-[2rem] bg-white/60 backdrop-blur-md shadow-sm space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg className="w-20 h-20 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2z"/></svg>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">Technical Breakdown</h3>
                <p className="text-slate-800 leading-relaxed font-serif text-2xl italic">{portrait.inspiration.technique}</p>
              </div>
              
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Pigment Palette</p>
                <div className="flex flex-wrap gap-3">
                  {portrait.inspiration.palette.map((c, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-900/5 border border-slate-900/10 text-[10px] font-bold text-slate-600 rounded-lg uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all cursor-default">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Challenge Card */}
            <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full -mr-24 -mt-24 blur-[80px]"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 mb-6">The Studio Challenge</h3>
              <p className="font-serif italic text-xl leading-relaxed text-slate-200 font-light">
                {portrait.inspiration.challenge}
              </p>
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Mastery Level: High</span>
                <div className="flex gap-1">
                  {[1,2,3,4].map(s => <div key={s} className="w-1.5 h-1.5 rounded-full bg-amber-400/50"></div>)}
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortraitDisplay;
