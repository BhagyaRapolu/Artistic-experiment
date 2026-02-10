
import React from 'react';
import { GeneratedPortrait, GenerationStatus, ArtStyle } from '../types';

interface PortraitDisplayProps {
  portrait: GeneratedPortrait | null;
  status: GenerationStatus;
  pendingPrompt?: string;
  pendingStyle?: ArtStyle | null;
}

const PortraitDisplay: React.FC<PortraitDisplayProps> = ({ portrait, status, pendingPrompt, pendingStyle }) => {
  if (status === GenerationStatus.IDLE) return null;

  if (status === GenerationStatus.GENERATING_IDEA || status === GenerationStatus.LOADING_IMAGE || status === GenerationStatus.LOADING_INSPIRATION) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-4xl mx-auto px-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative w-32 h-32 mb-10">
          <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
             {/* Art Palette and Brush Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 21a9 9 0 110-18c4.97 0 9 3.582 9 8 0 1.035-.84 1.875-1.875 1.875H17.25a1.125 1.125 0 00-1.125 1.125v1.5c0 3.037-2.015 5.5-4.5 5.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
                <circle cx="11" cy="8" r="0.5" fill="currentColor" stroke="none" />
                <circle cx="14" cy="10" r="0.5" fill="currentColor" stroke="none" />
             </svg>
          </div>
        </div>
        
        <div className="max-w-md space-y-4">
          <p className="text-slate-400 uppercase tracking-[0.4em] text-[10px] font-black">
            {status === GenerationStatus.GENERATING_IDEA ? "Whispering to Muse" : 
             status === GenerationStatus.LOADING_IMAGE ? "Mixing Pigments" : "Refining Insight"}
          </p>
          <h2 className="text-2xl font-serif italic text-slate-800 leading-snug px-4">
            {pendingPrompt ? `"${pendingPrompt}"` : 'Envisioning your next masterpiece...'}
          </h2>
          <div className="flex justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR || !portrait) {
    return (
      <div className="text-center py-20 bg-rose-50/30 rounded-3xl max-w-4xl mx-auto border border-rose-100/50">
        <p className="text-rose-600 font-serif italic text-xl">The creative flow encountered a block.</p>
        <p className="text-rose-400 text-xs mt-3 tracking-widest uppercase">Please re-envision and try again.</p>
      </div>
    );
  }

  const getBlobFromDataUrl = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const base64Data = parts[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleSave = () => {
    if (!portrait) return;
    const blob = getBlobFromDataUrl(portrait.imageUrl);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atelier-muse-${portrait.style.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Gallery Piece */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-amber-100 via-white to-rose-100 rounded-[2.5rem] blur-2xl opacity-40"></div>
          <div className="relative bg-white p-6 shadow-2xl rounded-2xl border border-slate-50">
            <img 
              src={portrait.imageUrl} 
              alt={portrait.prompt} 
              className="w-full h-auto rounded-lg shadow-inner ring-1 ring-slate-100"
            />
            <div className="mt-8 flex justify-between items-center text-[10px] text-slate-300 font-black tracking-widest uppercase">
              <span>{portrait.style}</span>
              <span className="bg-slate-50 px-3 py-1 rounded-full text-slate-400">Atelier Muse Original</span>
            </div>
          </div>
        </div>

        {/* Artistic Ledger */}
        <div className="flex flex-col gap-10">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl text-slate-800 mb-2">Artistic Insight</h2>
              <p className="text-slate-400 text-xs tracking-[0.2em] font-medium uppercase mb-8">Composition & Technical Study</p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-black mb-3">Proposed Technique</h3>
                  <p className="text-slate-700 leading-relaxed font-serif text-2xl italic">
                    {portrait.inspiration.technique}
                  </p>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-black mb-4">Pigment Selection</h3>
                  <div className="flex flex-wrap gap-2">
                    {portrait.inspiration.palette.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-100"></div>
                        <span className="text-slate-500 text-xs font-bold tracking-wide">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-400/20 transition-all duration-700"></div>
                  <h3 className="text-[10px] uppercase tracking-[0.4em] text-amber-400 font-black mb-4">The Challenge</h3>
                  <p className="font-serif italic text-xl leading-relaxed text-amber-50 relative z-10">
                    {portrait.inspiration.challenge}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleSave}
              className="flex items-center gap-3 px-10 py-5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all text-xs font-black tracking-widest uppercase shadow-xl active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortraitDisplay;
