
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import PortraitDisplay from './components/PortraitDisplay';
import { GeneratedPortrait, GenerationStatus, ArtStyle } from './types';
import { generatePortrait, generateInspirationNotes } from './services/geminiService';

const App: React.FC = () => {
  const [portrait, setPortrait] = useState<GeneratedPortrait | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);

  const handleGenerate = useCallback(async (subject: string, style: ArtStyle) => {
    try {
      setStatus(GenerationStatus.LOADING_IMAGE);
      
      // Step 1: Generate the image
      const imageUrl = await generatePortrait(subject, style);
      
      setStatus(GenerationStatus.LOADING_INSPIRATION);
      
      // Step 2: Generate inspiration notes
      const inspiration = await generateInspirationNotes(subject, style);
      
      setPortrait({
        imageUrl,
        prompt: subject,
        style,
        inspiration
      });
      setStatus(GenerationStatus.SUCCESS);
    } catch (error) {
      console.error("Generation failed:", error);
      setStatus(GenerationStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Header />
        
        <PromptInput 
          onGenerate={handleGenerate} 
          isLoading={status === GenerationStatus.LOADING_IMAGE || status === GenerationStatus.LOADING_INSPIRATION} 
        />
        
        <PortraitDisplay portrait={portrait} status={status} />
      </main>

      <footer className="py-8 text-center text-slate-400 text-xs tracking-widest uppercase border-t border-slate-100 bg-white/30 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} Atelier Muse — The Multi-Medium Digital Studio</p>
      </footer>

      {/* Aesthetic watercolor blotches decoration */}
      <div className="fixed -bottom-20 -left-20 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed -top-20 -right-20 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
};

export default App;
