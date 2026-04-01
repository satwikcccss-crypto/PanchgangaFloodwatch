import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Activity, Target, ShieldAlert, Waves, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAlertConfig } from '../../config/alerts';

export const EngineeringGauge = ({ sensor, data, onClick, noHeader = false }) => {
  const level = data?.waterLevel || 0;
  const alertConfig = getAlertConfig(data?.alertLevel || 'normal');
  
  // Calculate vertical mapping with a tightly bounded operational range
  const rawBase = sensor.dangerLevels.warning - 2;
  const rawTop = sensor.dangerLevels.hfl + 2;
  
  // Floor to nearest 0.2m
  const baseMsl = Math.floor(rawBase * 5) / 5;
  const topMsl = Math.ceil(rawTop * 5) / 5;
  const range = topMsl - baseMsl;
  
  const getTopPosition = (val) => {
    let p = ((val - baseMsl) / range) * 100;
    return Math.max(0, Math.min(100, p));
  };
  
  const fillPercentage = getTopPosition(level);

  // Thresholds for glowing effects
  const isAlertActive = level >= sensor.dangerLevels.warning;
  const isDangerActive = level >= sensor.dangerLevels.danger;

  // Generate structural increments: 0.1m for ticks, 0.5m for labels
  const ticks = [];
  for (let i = baseMsl; i <= topMsl + 0.01; i += 0.1) {
    ticks.push(Number(i.toFixed(1)));
  }

  return (
    <div 
      className={`academic-panel p-4 relative cursor-pointer group hover:border-academic-blue transition-all h-full flex flex-col ${noHeader ? 'border-none shadow-none bg-transparent' : ''}`}
      onClick={onClick}
    >
      {!noHeader && (
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h4 className="text-xs font-bold font-serif text-academic-blue tracking-wider leading-tight">{sensor.name}</h4>
            <span className="text-[9px] font-bold text-slate-400 font-mono">PNCHGN-RTDAS-{sensor.id.toUpperCase()}</span>
          </div>
          <div className="text-right">
            <div className="text-base font-black font-mono tracking-tighter" style={{ color: alertConfig.color }}>
              {level.toFixed(2)}m
            </div>
            <div className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: alertConfig.color, color: '#fff' }}>
              {alertConfig.label}
            </div>
          </div>
        </div>
      )}

      <div className="relative mt-2 flex-grow min-h-[180px]">
        <div className="survey-staff-container h-full max-h-[350px]">
          <div className="relative h-full w-20 mx-auto">
            {/* Scale labels on the LEFT */}
            <div className="absolute right-full top-0 bottom-0 w-10 z-10 pointer-events-none pr-2">
                {ticks.filter(t => (t * 10) % 5 === 0).map(tick => (
                  <div 
                    key={tick}
                    className="absolute right-0 text-[10px] font-mono font-bold text-slate-500"
                    style={{ bottom: `${getTopPosition(tick)}%`, transform: 'translateY(50%)' }}
                  >
                    {tick.toFixed(1)}
                  </div>
                ))}
            </div>

            <div className="survey-staff h-full">
            
            {/* Background Color Zones */}
            <div className="zone-normal" style={{ height: `${getTopPosition(sensor.dangerLevels.warning)}%` }} />
            <div 
              className="zone-alert" 
              style={{ 
                bottom: `${getTopPosition(sensor.dangerLevels.warning)}%`, 
                height: `${getTopPosition(sensor.dangerLevels.danger) - getTopPosition(sensor.dangerLevels.warning)}%` 
              }} 
            />
            <div 
              className="zone-danger" 
              style={{ 
                bottom: `${getTopPosition(sensor.dangerLevels.danger)}%`, 
                height: `${100 - getTopPosition(sensor.dangerLevels.danger)}%` 
              }} 
            />

            {/* Scale Tick Marks (Inside) */}
            <div className="absolute inset-0 z-10 w-full pointer-events-none">
              {ticks.map((tick) => {
                const isMajor = (tick * 10) % 5 === 0;
                const pos = getTopPosition(tick);
                return (
                  <div 
                    key={tick}
                    className={`absolute left-0 border-slate-300/40 ${isMajor ? 'w-full border-b-[1.5px]' : 'w-4 border-b'}`}
                    style={{ bottom: `${pos}%` }}
                  />
                );
              })}
            </div>

            {/* dynamic water fill */}
            <div className="survey-water" style={{ height: `${fillPercentage}%` }}>
                <div className="wave"></div>
                <div className="wave wave2"></div>
            </div>

            {/* Glowing Threshold Marks */}
            <div className={`alert-mark ${isAlertActive ? 'glow-alert' : ''}`} style={{ bottom: `${getTopPosition(sensor.dangerLevels.warning)}%` }} />
            <div className={`danger-mark ${isDangerActive ? 'glow-danger' : ''}`} style={{ bottom: `${getTopPosition(sensor.dangerLevels.danger)}%` }} />

            {/* Floating Level Pill */}
            <div className="level-pill" style={{ bottom: `${fillPercentage}%` }}>
              {level.toFixed(2)}m
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Dashboard Indicator
export const SimpleIndicator = ({ sensor, data, onClick, active }) => {
  const level = data?.waterLevel || 0;
  const alertConfig = getAlertConfig(data?.alertLevel || 'normal');
  const history = data?.history || [];
  const prevLevel = history.length > 5 ? history[history.length - 6] : level;
  const isRising = level >= prevLevel;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`academic-panel p-4 cursor-pointer relative overflow-hidden transition-all border-l-4 ${
        active ? 'ring-2 ring-academic-blue bg-blue-50/50' : ''
      }`}
      style={{ borderLeftColor: alertConfig.color }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{sensor.name}</h4>
        <div className={`p-1 rounded-md ${active ? 'bg-academic-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
          <Waves className="w-3 h-3" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-mono font-black text-slate-800 tracking-tighter">{level.toFixed(2)}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">m</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {isRising ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
          <span className={`text-[8px] font-bold uppercase tracking-widest ${isRising ? 'text-emerald-600' : 'text-red-500'}`}>
            {isRising ? 'Rising' : 'Falling'}
          </span>
        </div>
        <span className="text-[8px] font-bold text-slate-400 font-mono">MSL</span>
      </div>
    </motion.div>
  );
};

const MiniTrend = ({ history }) => {
  if (!history || history.length < 2) return <div className="h-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calibrating Stream...</div>;
  
  const values = history.map(h => typeof h === 'object' ? h.waterLevel : h);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 0.1;
  const width = 300;
  const height = 60;
  
  const points = values.map((val, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={(history.length - 1) / (history.length - 1) * width} cy={height - ((history[history.length-1] - min) / range) * height} r="3" fill="#38bdf8" />
    </svg>
  );
};

export const ZoomedGauge = ({ sensor, data, onClose }) => {
  const history = data?.history || [];
  const current = data?.waterLevel || 0;
  
  // Calculate historical shifts (assuming 10min intervals in the 150pt history)
  const getChange = (pts) => {
    if (history.length < pts) return 0;
    const pastEntry = history[history.length - pts];
    const pastValue = typeof pastEntry === 'object' ? pastEntry.waterLevel : pastEntry;
    return (current - pastValue).toFixed(2);
  };

  const stats = [
    { label: '1h Change', val: getChange(6) },
    { label: '3h Change', val: getChange(18) },
    { label: '6h Change', val: getChange(36) },
    { label: '12h Change', val: getChange(72) },
    { label: '24h Change', val: getChange(144) }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="academic-panel bg-white p-6 relative z-10 w-full max-w-6xl shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 overflow-y-auto max-h-[90vh]"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 rounded-full transition-all active:scale-90">
            <X className="w-6 h-6" />
          </button>
          
          <div className="md:col-span-12 flex items-center gap-6 border-b border-slate-100 pb-6">
            <div className="p-4 bg-academic-blue/5 rounded-2xl">
                <Target className="w-10 h-10 text-academic-blue" />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-serif text-academic-blue uppercase tracking-tight leading-none">{sensor.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{sensor.authority}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">LAT: {sensor.location.lat} • LNG: {sensor.location.lng}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stats.map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{s.label}</span>
                  <div className={`text-sm font-mono font-bold ${parseFloat(s.val) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {parseFloat(s.val) >= 0 ? '+' : ''}{s.val}m
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Hydro-Analysis Trend (24h Window)</span>
                    </div>
                </div>
                <div className="h-40 mb-4 bg-white/5 rounded-xl border border-white/10 p-4 relative z-10">
                    <MiniTrend history={history} />
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Waves className="w-48 h-48" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-inner">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Field Site Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {sensor.description}
                  </p>
              </div>
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl overflow-hidden relative">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Node Hardware Visual</h4>
                  <div className="aspect-video bg-slate-800 rounded-xl border border-blue-500/30 flex flex-col items-center justify-center p-4 text-center">
                      <Activity className="w-8 h-8 text-blue-500/40 mb-2" />
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                          IOT SENSOR UNIT: PNCHGN-v2.1<br/>
                          SHIVAJI UNIVERSITY DESIGN
                      </span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 opacity-5">
                      <ShieldAlert className="w-24 h-24 text-white" />
                  </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6">
             <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center flex-grow">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 w-full text-center pb-2">Physical Staff Reading</h4>
                <div className="w-full h-full min-h-[400px]">
                    <EngineeringGauge sensor={sensor} data={data} noHeader={true} />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
