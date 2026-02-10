
import React from 'react';
import { GeneratedPortrait } from '../types';

interface HistoryListProps {
  history: GeneratedPortrait[];
  onSelect: (item: GeneratedPortrait) => void;
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  const handleDownload = (e: React.MouseEvent, item: GeneratedPortrait) => {
    e.stopPropagation(); // Don't trigger selection
    const link = document.createElement('a');
    link.href = item.imageUrl;
    const safeName = item.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    link.download = `AtelierMuse_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 mt-20 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="max-w-6xl mx-auto flex justify-between items-end mb-8 border-b border-slate-100 pb-4 px-4">
        <div>
          <h2 className="text-3xl text-slate-800">The Atelier Vault</h2>
          <p className="text-xs text-slate-400 tracking-widest uppercase font-black mt-1">Curated Journey</p>
        </div>
        <button 
          onClick={onClear} 
          className="text-[10px] text-slate-300 hover:text-rose-500 transition-colors uppercase tracking-[0.3em] font-black"
        >
          Archive All
        </button>
      </div>

      <div className="relative gallery-mask">
        <div className="flex gap-8 overflow-x-auto pt-4 pb-12 px-[8%] snap-x art-scrollbar scroll-smooth">
          {history.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => onSelect(item)} 
              className="flex-shrink-0 w-64 group cursor-pointer snap-center"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg border border-slate-50 transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:ring-4 group-hover:ring-amber-50">
                <img 
                  src={item.imageUrl} 
                  alt={item.prompt} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[3px] gap-3">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center gap-3">
                    <span className="px-6 py-2.5 bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-xl">
                      Examine
                    </span>
                    <button 
                      onClick={(e) => handleDownload(e, item)}
                      className="text-white/70 hover:text-white flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Quick Save
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-5 px-1 transition-all duration-500 group-hover:translate-x-1">
                <p className="text-[9px] uppercase tracking-[0.25em] text-amber-600 font-black mb-1.5 flex items-center gap-2">
                  <span className="w-4 h-px bg-amber-200"></span>
                  {item.style}
                </p>
                <p className="text-sm text-slate-500 line-clamp-2 italic font-serif leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                  "{item.prompt}"
                </p>
              </div>
            </div>
          ))}
          {/* Spacer to maintain edge fading on the last item */}
          <div className="flex-shrink-0 w-1 px-[8%]"></div>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
