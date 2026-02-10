
import React from 'react';
import { GeneratedPortrait, GenerationStatus } from '../types';

interface PortraitDisplayProps {
  portrait: GeneratedPortrait | null;
  status: GenerationStatus;
}

const PortraitDisplay: React.FC<PortraitDisplayProps> = ({ portrait, status }) => {
  if (status === GenerationStatus.IDLE) return null;

  if (status === GenerationStatus.LOADING_IMAGE || status === GenerationStatus.LOADING_INSPIRATION) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-4xl mx-auto">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 animate-pulse font-serif italic text-lg">
          {status === GenerationStatus.LOADING_IMAGE 
            ? "Preparing the canvas..." 
            : "Adding final artistic touches..."}
        </p>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR || !portrait) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-500 font-medium">Something went wrong while painting. Please try again.</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!portrait) return;
    
    // Extract base64 data from the data URL
    const parts = portrait.imageUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const base64Data = parts[1];
    
    // Convert base64 to Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Create a temporary link to trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atelier-muse-${portrait.style.toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-100 to-rose-100 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white p-4 shadow-2xl rounded-lg border border-slate-100">
            <img 
              src={portrait.imageUrl} 
              alt={portrait.prompt} 
              className="w-full h-auto rounded-sm"
              loading="lazy"
            />
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
              <span className="font-serif italic tracking-wider uppercase">{portrait.style} Reference #AI-{Math.floor(Math.random() * 9999)}</span>
              <span>1024 x 1024 px</span>
            </div>
          </div>
        </div>

        {/* Inspiration Section */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-3xl text-slate-800 mb-6 border-b border-slate-200 pb-2">Artist's Inspiration</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">Technique</h3>
                <p className="text-slate-700 leading-relaxed font-light text-lg italic">
                  "{portrait.inspiration.technique}"
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">Pigment Palette</h3>
                <div className="flex flex-wrap gap-3">
                  {portrait.inspiration.palette.map((color, idx) => (
                    <span 
                      key={idx} 
                      className="px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-medium shadow-sm hover:border-amber-200 transition-colors"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">Emotional Mood</h3>
                <p className="text-slate-700 font-medium text-lg">
                  {portrait.inspiration.mood}
                </p>
              </div>

              <div className="p-6 bg-slate-800 rounded-xl text-white shadow-xl">
                <h3 className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold mb-3">Creative Challenge</h3>
                <p className="font-serif italic text-lg leading-relaxed">
                  {portrait.inspiration.challenge}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-medium shadow-md active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save Portrait
            </button>

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print reference card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortraitDisplay;
