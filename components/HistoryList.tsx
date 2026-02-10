
import React from 'react';
import { GeneratedPortrait } from '../types';

interface HistoryListProps {
  history: GeneratedPortrait[];
  onSelect: (item: GeneratedPortrait) => void;
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-16 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-2xl text-slate-800">Gallery History</h2>
          <p className="text-sm text-slate-500 italic">Your recent artistic explorations</p>
        </div>
        <button 
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest font-semibold"
        >
          Clear All
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {history.map((item, index) => (
          <div 
            key={`${item.prompt}-${index}`}
            onClick={() => onSelect(item)}
            className="flex-shrink-0 w-48 group cursor-pointer snap-start"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg shadow-md border border-slate-100 transition-all group-hover:shadow-xl group-hover:-translate-y-1">
              <img 
                src={item.imageUrl} 
                alt={item.prompt} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase tracking-widest">View</span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-tighter text-amber-600 font-bold">{item.style}</p>
              <p className="text-xs text-slate-600 line-clamp-2 italic font-serif leading-tight mt-1">
                "{item.prompt}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
