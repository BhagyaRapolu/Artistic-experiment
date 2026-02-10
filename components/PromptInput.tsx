
import React, { useState } from 'react';
import { DEFAULT_SUBJECTS } from '../constants';
import { ArtStyle } from '../types';

interface PromptInputProps {
  onGenerate: (subject: string, style: ArtStyle) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.WATERCOLOR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim()) {
      onGenerate(subject, style);
    }
  };

  const handleRandomize = () => {
    const random = DEFAULT_SUBJECTS[Math.floor(Math.random() * DEFAULT_SUBJECTS.length)];
    setSubject(random);
    onGenerate(random, style);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 px-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-wrap justify-center gap-2">
          {Object.values(ArtStyle).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                style === s 
                  ? 'bg-slate-800 text-white shadow-md scale-105' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative group">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={`Describe your ${style.toLowerCase()} subject...`}
            className="w-full px-6 py-4 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !subject.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            {isLoading ? 'Creating...' : 'Inspire'}
          </button>
        </div>
        
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            disabled={isLoading}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-3 py-1 rounded hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Surprise me
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
