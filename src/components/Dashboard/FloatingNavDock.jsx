import React, { useState } from 'react';
import { LayoutGrid, Radio, Activity, RefreshCw, ArrowUp, MapPin, Check } from 'lucide-react';
import { SENSORS } from '../../config/sensors';

const FloatingNavDock = ({ 
  currentPage, 
  onNavigate, 
  selectedSensorId, 
  onSensorSelect, 
  onRefreshData,
  onOpenDetails
}) => {
  const [showStationSubmenu, setShowStationSubmenu] = useState(false);
  const activeSensor = SENSORS.find(s => s.id === selectedSensorId) || SENSORS[0];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop Floating Navigation (Right Side) */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-[150] flex-col items-end gap-3 pointer-events-none">
        
        {/* Station Submenu (Tooltip style) */}
        {showStationSubmenu && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-2xl w-56 flex flex-col gap-1 transition-all mr-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1.5 block">Select Station</span>
            {SENSORS.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  onSensorSelect(s.id);
                  setShowStationSubmenu(false);
                  if (currentPage !== 'dashboard') onNavigate('dashboard');
                }}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedSensorId === s.id
                  ? 'bg-academic-gold text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-academic-blue'
                }`}
              >
                <span>{s.shortName}</span>
                {selectedSensorId === s.id && <Check className="w-3 h-3 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}

        {/* Main Dock */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-[2rem] p-5 shadow-2xl flex flex-col gap-4 items-center w-16">
          {/* Dashboard Icon */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`p-3 rounded-xl transition-all relative group ${
              currentPage === 'dashboard'
              ? 'bg-academic-gold text-slate-900 shadow-lg shadow-academic-gold/20'
              : 'text-slate-400 hover:text-academic-blue hover:bg-slate-50'
            }`}
            title="Dashboard"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="absolute right-18 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Dashboard
            </span>
          </button>

          {/* Radar Network Icon */}
          <button
            onClick={() => onNavigate('network')}
            className={`p-3 rounded-xl transition-all relative group ${
              currentPage === 'network'
              ? 'bg-academic-gold text-slate-900 shadow-lg shadow-academic-gold/20'
              : 'text-slate-400 hover:text-academic-blue hover:bg-slate-50'
            }`}
            title="Radar Network"
          >
            <Radio className="w-5 h-5" />
            <span className="absolute right-18 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Radar Network
            </span>
          </button>

          {/* View Details (Opens active station zoomed modal) */}
          <button
            onClick={onOpenDetails}
            className="p-3 rounded-xl text-slate-400 hover:text-academic-blue hover:bg-slate-50 transition-all relative group"
            title="View Details"
          >
            <Activity className="w-5 h-5" />
            <span className="absolute right-18 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Station Analytics: {activeSensor.shortName}
            </span>
          </button>

          {/* Station selector button */}
          <button
            onClick={() => setShowStationSubmenu(!showStationSubmenu)}
            className={`p-3 rounded-xl transition-all relative group ${
              showStationSubmenu ? 'bg-slate-100 text-academic-blue' : 'text-slate-400 hover:text-academic-blue hover:bg-slate-50'
            }`}
            title="Switch Stations"
          >
            <MapPin className="w-5 h-5" />
            <span className="absolute right-18 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Select Station ({activeSensor.shortName})
            </span>
          </button>

          <span className="w-8 h-[1px] bg-slate-200" />

          {/* Refresh data */}
          <button
            onClick={onRefreshData}
            className="p-3 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-50 transition-all relative group"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="absolute right-18 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Sync Telemetry
            </span>
          </button>

          {/* Scroll to top */}
          <button
            onClick={handleScrollToTop}
            className="p-3 rounded-xl text-slate-400 hover:text-academic-blue hover:bg-slate-50 transition-all relative group"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="absolute right-18 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Back to Top
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] w-[92%] bg-white/95 backdrop-blur-md border border-slate-200 rounded-full py-2 px-3 shadow-2xl flex items-center justify-around gap-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`p-2.5 rounded-full transition-all ${
            currentPage === 'dashboard' ? 'bg-academic-gold text-slate-900 shadow-md' : 'text-slate-400 hover:text-academic-blue'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('network')}
          className={`p-2.5 rounded-full transition-all ${
            currentPage === 'network' ? 'bg-academic-gold text-slate-900 shadow-md' : 'text-slate-400 hover:text-academic-blue'
          }`}
        >
          <Radio className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenDetails}
          className="p-2.5 rounded-full text-slate-400 hover:text-academic-blue active:scale-95"
        >
          <Activity className="w-4 h-4" />
        </button>

        <select
          value={selectedSensorId}
          onChange={(e) => {
            onSensorSelect(e.target.value);
            if (currentPage !== 'dashboard') onNavigate('dashboard');
          }}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-[8px] font-black uppercase rounded-lg px-1.5 py-1 max-w-[90px] outline-none"
        >
          {SENSORS.map(s => (
            <option key={s.id} value={s.id}>{s.shortName}</option>
          ))}
        </select>

        <button
          onClick={onRefreshData}
          className="p-2.5 rounded-full text-slate-400 hover:text-emerald-500 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

export default FloatingNavDock;
