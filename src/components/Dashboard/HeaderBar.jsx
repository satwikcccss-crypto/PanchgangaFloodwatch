import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Clock, Wifi, WifiOff, Type, Globe } from 'lucide-react';

const HeaderBar = ({ connectionStatus, lastUpdateTime, onAboutClick, onNavigate, currentPage }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFontSize = () => {
    const currentSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = currentSize === '110%' ? '100%' : '110%';
  };

  return (
    <header className="inst-header">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-slate-200 pr-6 mr-2">
          <div className="p-1">
            <img 
              src={`${import.meta.env.BASE_URL}cccss_logo.png`} 
              alt="Shivaji University CCCSS" 
              className="h-14 lg:h-16 object-contain"
              onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/en/b/b3/Shivaji_University_logo.png'; }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold font-serif text-academic-blue tracking-tight leading-snug max-w-md">
              Realtime River Water Level Monitoring System<br/>
              <span className="text-lg lg:text-xl">Shivaji University, Kolhapur</span>
            </h1>
            <h2 className="text-[9px] lg:text-[10px] font-bold text-academic-gold uppercase tracking-[0.2em] mt-1.5 opacity-90">
              Developed by: Centre for Climate Change and Sustainability Studies (CCCSS)
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
              currentPage === 'dashboard' 
              ? 'bg-white text-academic-blue shadow-sm' 
              : 'text-slate-500 hover:text-academic-blue'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate('network')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
              currentPage === 'network' 
              ? 'bg-white text-academic-blue shadow-sm' 
              : 'text-slate-500 hover:text-academic-blue'
            }`}
          >
            Radar Network
          </button>
        </nav>
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
