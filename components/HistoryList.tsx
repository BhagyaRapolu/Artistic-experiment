
import React from 'react';
import { GeneratedPortrait } from '../types';

interface HistoryListProps {
  history: GeneratedPortrait[];
  onSelect: (item: GeneratedPortrait) => void;
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-20 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl text-slate-800">The Atelier Vault</h2>
          <p className="text-xs text-slate-400 tracking-widest uppercase font-black mt-1">Curated Journey</p>
        </div>
        <button onClick={onClear} className="text-[10px] text-slate-300 hover:text-rose-500 transition-colors uppercase tracking-[0.3em] font-black">Archive All</button>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
        {history.map((item, idx) => (
          <div key={idx} onClick={() => onSelect(item)} className="flex-shrink-0 w-56 group cursor-pointer snap-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg border border-slate-50 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
              <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <span className="px-4 py-2 border border-white/50 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">Examine</span>
              </div>
            </div>
            <div className="mt-4 px-1">
              <p className="text-[9px] uppercase tracking-widest text-amber-600 font-black">{item.style}</p>
              <p className="text-xs text-slate-500 line-clamp-2 italic font-serif leading-relaxed mt-1 opacity-80 group-hover:opacity-100 transition-opacity">"{item.prompt}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
