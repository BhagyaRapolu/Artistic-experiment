
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 text-center">
      <h1 className="text-5xl font-bold text-slate-800 mb-2">Atelier Muse</h1>
      <p className="text-slate-500 italic font-light tracking-wide">
        Generating fine art portraits across multiple mediums to spark your creative journey.
      </p>
      <div className="mt-4 flex justify-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
      </div>
    </header>
  );
};

export default Header;
