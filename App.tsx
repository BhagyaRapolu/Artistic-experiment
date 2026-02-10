
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import PortraitDisplay from './components/PortraitDisplay';
import HistoryList from './components/HistoryList';
import { GeneratedPortrait, GenerationStatus, ArtStyle, ErrorDetails, AspectRatio } from './types';
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
    } catch (e) {
      console.error("Persistence Error:", e);
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
      return [];
    }
  },
  clear: async () => {
    try {
      const db = await dbHelper.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete('current_history');
    } catch (e) {}
  }
};

const App: React.FC = () => {
  const [portrait, setPortrait] = useState<GeneratedPortrait | null>(null);
  const [history, setHistory] = useState<GeneratedPortrait[]>([]);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string>('');
  const [pendingStyle, setPendingStyle] = useState<ArtStyle | null>(null);
  const [pendingAspectRatio, setPendingAspectRatio] = useState<AspectRatio>("1:1");
  const [isCacheHit, setIsCacheHit] = useState(false);
  
  const latestRequestId = useRef(0);
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
        setPendingAspectRatio(saved[0].aspectRatio || "1:1");
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

  const handleGenerate = useCallback(async (subject: string, style: ArtStyle, aspectRatio: AspectRatio, base64Image?: string) => {
    const requestId = ++latestRequestId.current;
    
    setErrorDetails(null);
    setIsCacheHit(false);
    const displaySubject = subject.trim() || (base64Image ? "Re-imagined Study" : "Creative Genesis");
    setPendingPrompt(displaySubject);
    setPendingStyle(style);
    setPendingAspectRatio(aspectRatio);

    const cachedItem = history.find(item => 
      item.prompt.toLowerCase() === displaySubject.toLowerCase() && 
      item.style === style && 
      item.aspectRatio === aspectRatio &&
      !base64Image
    );

    if (cachedItem) {
      setPortrait(cachedItem);
      setStatus(GenerationStatus.SUCCESS);
      setIsCacheHit(true);
      displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    try {
      setStatus(GenerationStatus.LOADING_IMAGE);
      
      let imageUrl: string;
      if (base64Image) {
        imageUrl = await editImage(base64Image, subject, style, aspectRatio);
      } else {
        imageUrl = await generatePortrait(displaySubject, style, aspectRatio);
      }
      
      if (requestId !== latestRequestId.current) return;

      setStatus(GenerationStatus.LOADING_INSPIRATION);
      const inspiration = await generateInspirationNotes(imageUrl, displaySubject, style);
      
      if (requestId !== latestRequestId.current) return;

      const newPortrait: GeneratedPortrait = {
        imageUrl,
        prompt: displaySubject,
        style,
        aspectRatio,
        inspiration
      };
      
      setPortrait(newPortrait);
      setHistory(prev => {
        const filtered = prev.filter(p => p.imageUrl !== imageUrl);
        return [newPortrait, ...filtered].slice(0, MAX_HISTORY);
      });
      setStatus(GenerationStatus.SUCCESS);

      setTimeout(() => {
        displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      
    } catch (error: any) {
      if (requestId !== latestRequestId.current) return;
      
      console.error("Artistic failure:", error);
      setStatus(GenerationStatus.ERROR);
      
      const errorMsg = error.message || "";
      setErrorDetails({
        message: errorMsg === 'moderated_content' ? 'moderated_content' : 'technical_error',
        canRetry: errorMsg !== 'moderated_content',
      });
    }
  }, [history]);

  const handleSurpriseMe = useCallback(async (style: ArtStyle) => {
    const requestId = ++latestRequestId.current;
    try {
      setErrorDetails(null);
      setStatus(GenerationStatus.GENERATING_IDEA);
      const subject = await generateRandomSubject();
      
      if (requestId !== latestRequestId.current) return;
      
      setPendingPrompt(subject);
      setPendingStyle(style);
      await handleGenerate(subject, style, pendingAspectRatio);
      return subject;
    } catch (error: any) {
      if (requestId !== latestRequestId.current) return;
      setStatus(GenerationStatus.ERROR);
      setErrorDetails({ message: "idea_failed", canRetry: true });
    }
  }, [handleGenerate, pendingAspectRatio]);

  const handleRetry = () => {
    if (pendingPrompt && pendingStyle) {
      handleGenerate(pendingPrompt, pendingStyle, pendingAspectRatio);
    }
  };

  const handleSelectHistory = (item: GeneratedPortrait) => {
    setPortrait(item);
    setStatus(GenerationStatus.SUCCESS);
    setPendingPrompt(item.prompt);
    setPendingStyle(item.style);
    setPendingAspectRatio(item.aspectRatio || "1:1");
    setErrorDetails(null);
    setIsCacheHit(true);
    setTimeout(() => {
      displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleClearHistory = async () => {
    if(confirm("Permanently archive the current vault?")) {
      setHistory([]);
      setPortrait(null);
      setStatus(GenerationStatus.IDLE);
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
          initialValue={pendingPrompt}
        />
        <div ref={displayRef}>
          <PortraitDisplay 
            portrait={portrait} 
            status={status} 
            pendingPrompt={pendingPrompt}
            pendingStyle={pendingStyle}
            errorDetails={errorDetails}
            onRetry={handleRetry}
            isCacheHit={isCacheHit}
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
      <footer className="py-16 text-center text-slate-300 text-[10px] tracking-[0.5em] uppercase mt-20">
        <p>© {new Date().getFullYear()} Atelier Muse Fine Art Studio</p>
      </footer>
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-amber-50/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-rose-50/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse delay-1000"></div>
    </div>
  );
};

export default App;
