
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import PortraitDisplay from './components/PortraitDisplay';
import HistoryList from './components/HistoryList';
import { GeneratedPortrait, GenerationStatus, ArtStyle } from './types';
import { generatePortrait, generateInspirationNotes, generateRandomSubject, editImage } from './services/geminiService';

const DB_NAME = 'AtelierMuseDB';
const STORE_NAME = 'history';
const MAX_HISTORY = 15;

const dbHelper = {
  getDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  save: async (history: GeneratedPortrait[]) => {
    try {
      const db = await dbHelper.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(history, 'current_history');
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error("IndexedDB Save Error:", e);
    }
  },
  load: async (): Promise<GeneratedPortrait[]> => {
    try {
      const db = await dbHelper.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get('current_history');
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      console.error("IndexedDB Load Error:", e);
      return [];
    }
  },
  clear: async () => {
    try {
      const db = await dbHelper.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete('current_history');
    } catch (e) {
      console.error("IndexedDB Clear Error:", e);
    }
  }
};

const App: React.FC = () => {
  const [portrait, setPortrait] = useState<GeneratedPortrait | null>(null);
  const [history, setHistory] = useState<GeneratedPortrait[]>([]);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [pendingPrompt, setPendingPrompt] = useState<string>('');
  const [pendingStyle, setPendingStyle] = useState<ArtStyle | null>(null);
  const isInitialized = useRef(false);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const saved = await dbHelper.load();
      if (saved && saved.length > 0) {
        setHistory(saved);
        setPortrait(saved[0]);
        setStatus(GenerationStatus.SUCCESS);
        setPendingPrompt(saved[0].prompt);
        setPendingStyle(saved[0].style);
      }
      isInitialized.current = true;
    };
    init();
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      dbHelper.save(history);
    }
  }, [history]);

  const handleGenerate = useCallback(async (subject: string, style: ArtStyle, base64Image?: string) => {
    // Prevent multiple concurrent generations
    if (status === GenerationStatus.LOADING_IMAGE || status === GenerationStatus.LOADING_INSPIRATION) return;

    try {
      const displaySubject = subject || (base64Image ? "Visual Re-imagination" : "Abstract Creation");
      setPendingPrompt(displaySubject);
      setPendingStyle(style);
      setStatus(GenerationStatus.LOADING_IMAGE);
      
      // Step 1: Generate or Edit the image first
      let imageUrl: string;
      if (base64Image) {
        imageUrl = await editImage(base64Image, subject, style);
      } else {
        imageUrl = await generatePortrait(subject, style);
      }
      
      // Step 2: Now that we have the image, generate multimodal inspiration notes
      setStatus(GenerationStatus.LOADING_INSPIRATION);
      const inspiration = await generateInspirationNotes(imageUrl, displaySubject, style);
      
      const newPortrait: GeneratedPortrait = {
        imageUrl,
        prompt: displaySubject,
        style,
        inspiration
      };
      
      setPortrait(newPortrait);
      setHistory(prev => {
        const filtered = prev.filter(p => p.imageUrl !== imageUrl && p.prompt !== displaySubject);
        return [newPortrait, ...filtered].slice(0, MAX_HISTORY);
      });
      setStatus(GenerationStatus.SUCCESS);

      // Smooth scroll to results
      setTimeout(() => {
        displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
    } catch (error) {
      console.error("Generation failed:", error);
      setStatus(GenerationStatus.ERROR);
    }
  }, [status]);

  const handleSurpriseMe = useCallback(async (style: ArtStyle) => {
    try {
      setStatus(GenerationStatus.GENERATING_IDEA);
      const subject = await generateRandomSubject();
      setPendingPrompt(subject);
      setPendingStyle(style);
      await handleGenerate(subject, style);
      return subject;
    } catch (error) {
      console.error("Failed to get surprise idea:", error);
      setStatus(GenerationStatus.ERROR);
    }
  }, [handleGenerate]);

  const handleSelectHistory = (item: GeneratedPortrait) => {
    setPortrait(item);
    setStatus(GenerationStatus.SUCCESS);
    setPendingPrompt(item.prompt);
    setPendingStyle(item.style);
    setTimeout(() => {
      displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleClearHistory = async () => {
    if(confirm("Are you sure you want to clear your artistic gallery history?")) {
      setHistory([]);
      await dbHelper.clear();
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900">
      <main className="flex-grow">
        <Header />
        
        <PromptInput 
          onGenerate={handleGenerate}
          onSurpriseMe={handleSurpriseMe}
          isLoading={status !== GenerationStatus.IDLE && status !== GenerationStatus.SUCCESS && status !== GenerationStatus.ERROR} 
        />
        
        <div ref={displayRef}>
          <PortraitDisplay 
            portrait={portrait} 
            status={status} 
            pendingPrompt={pendingPrompt}
            pendingStyle={pendingStyle}
          />
        </div>

        {history.length > 0 && (
          <HistoryList 
            history={history} 
            onSelect={handleSelectHistory} 
            onClear={handleClearHistory}
          />
        )}
      </main>

      <footer className="py-12 text-center text-slate-300 text-[10px] tracking-[0.5em] uppercase mt-20">
        <p>© {new Date().getFullYear()} Atelier Muse Studio</p>
      </footer>

      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-amber-50/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-rose-50/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
};

export default App;
