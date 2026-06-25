import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Clock, Wifi, WifiOff, Type, Globe } from 'lucide-react';

const HeaderBar = ({ connectionStatus, lastUpdateTime, onAboutClick, onNavigate, currentPage, minimalMode = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFontSize = () => {
    const currentSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = currentSize === '110%' ? '100%' : '110%';
  };

  if (minimalMode) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <img 
                src={`${import.meta.env.BASE_URL}cccss_logo.png`} 
                alt="CCCSS" 
                className="h-10 object-contain grayscale hover:grayscale-0 transition-all opacity-80"
                onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/en/b/b3/Shivaji_University_logo.png'; }}
              />
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Hydrological RTDAS</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Shivaji University</span>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
             <div className="flex flex-col items-end">
                <span className="text-sm font-mono font-black text-academic-blue leading-none">{time.toLocaleTimeString()}</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
             </div>
           </div>
        </div>


      </div>
    );
  }

  return (
    <header className="inst-header">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 pr-0 md:pr-6 mr-0 md:mr-2 w-full md:w-auto text-center sm:text-left">
          <div className="p-1 flex-shrink-0">
            <img 
              src={`${import.meta.env.BASE_URL}cccss_logo.png`} 
              alt="Shivaji University CCCSS" 
              className="h-16 sm:h-14 lg:h-16 object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/en/b/b3/Shivaji_University_logo.png'; }}
            />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-serif text-academic-blue tracking-tight leading-snug max-w-md">
              Realtime River Water Level Monitoring System<br/>
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold block mt-0.5">Shivaji University, Kolhapur</span>
            </h1>
            <h2 className="text-[9px] lg:text-[10px] font-bold text-academic-gold uppercase tracking-[0.15em] mt-1.5 opacity-90 text-center sm:text-left">
              Developed by: Centre for Climate Change and Sustainability Studies (CCCSS)
            </h2>
          </div>
        </div>

        {/* Info button visible on mobile/tablet (hidden on xl) */}
        <button 
          onClick={onAboutClick}
          className="xl:hidden p-2 text-academic-blue hover:bg-slate-100 border border-slate-200 rounded-lg bg-slate-50 hover:text-blue-900 transition-all active:scale-95 flex-shrink-0"
          title="Project Info"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="hidden xl:flex items-center gap-6">
        {/* Accessibility Tools */}
        <div className="flex items-center gap-2 mr-4">
          <button 
            onClick={toggleFontSize}
            className="flex items-center gap-1 px-2 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-academic-blue rounded font-bold text-[10px] uppercase transition-all"
            title="Toggle Text Size"
          >
            <Type className="w-3 h-3" /> A±
          </button>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-academic-blue" />
            <span className="text-lg font-mono font-bold text-academic-blue">
              {time.toLocaleTimeString()}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </span>
        </div>

        <div className="h-10 w-px bg-slate-300" />

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            {connectionStatus === 'online' ? (
              <Wifi className="w-4 h-4 text-emerald-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-xs font-bold uppercase tracking-widest ${connectionStatus === 'online' ? 'text-emerald-600' : 'text-red-600'}`}>
              Network: {connectionStatus === 'online' ? 'Secure' : 'Offline'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">
            Sync: {lastUpdateTime || 'Initializing...'}
          </span>
        </div>

        <button 
          onClick={onAboutClick}
          className="ml-2 flex items-center gap-2 px-6 py-2.5 bg-white border border-academic-blue hover:bg-academic-blue hover:text-white text-academic-blue rounded transition-all font-bold text-[11px] uppercase tracking-widest active:scale-95"
        >
          <Info className="w-4 h-4" />
          Project Info
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
