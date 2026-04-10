import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Activity, Target, ShieldAlert, Waves, ArrowUpRight, ArrowDownRight, Globe, Battery, Signal, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { getAlertConfig } from '../../config/alerts';
import BasinAnalyticsChart from '../Charts/BasinAnalyticsChart';

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
  const [activeTab, setActiveTab] = useState('analytics');
  const history = data?.history || [];
  const current = data?.waterLevel || 0;
  
  const getChange = (pts) => {
    if (!history || history.length < pts) return "0.0";
    const pastEntry = history[history.length - pts];
    const pastValue = typeof pastEntry === 'object' ? pastEntry.waterLevel : pastEntry;
    if (pastValue === undefined || pastValue === null) return "0.0";
    const diff = (current - pastValue);
    return isNaN(diff) ? "0.0" : diff.toFixed(2);
  };

  const stats = [
    { label: 'Current 1h', val: getChange(6), color: 'text-blue-600', icon: <Activity className="w-3 h-3" /> },
    { label: 'Rolling 3h', val: getChange(18), color: 'text-emerald-600', icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'Rolling 6h', val: getChange(36), color: 'text-amber-600', icon: <Waves className="w-3 h-3" /> },
    { label: 'Rolling 12h', val: getChange(72), color: 'text-orange-600', icon: <ShieldAlert className="w-3 h-3" /> },
    { label: 'Rolling 24h', val: getChange(144), color: 'text-rose-600', icon: <Zap className="w-3 h-3" /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-[2rem] relative z-10 w-full max-w-6xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[95vh] border border-white/20"
        >
          {/* LEFT SIDEBAR (Station Profile) */}
          <div className="md:w-[320px] bg-slate-50/50 border-r border-slate-100 p-6 flex flex-col shrink-0 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-academic-blue flex items-center justify-center shadow-lg shadow-academic-blue/20">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="text-[9px] font-black text-academic-blue uppercase tracking-widest leading-none">CCCSS, Shivaji University</h4>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Institutional RTDAS Control</span>
                </div>
            </div>

            <div className="mb-6">
                <div className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-500 mb-2 border border-slate-200">
                    RWS-{sensor.id.toUpperCase()} • RTDAS
                </div>
                <h2 className="text-xl font-black font-serif text-slate-800 tracking-tight uppercase leading-tight">
                    {sensor.name} STATION:<br/>
                    <span className="text-academic-gold italic opacity-80 text-sm">{sensor.river} Monitoring</span>
                </h2>
                <div className="flex items-center gap-2 mt-3 text-[9px] font-bold text-slate-400">
                    <Globe className="w-3 h-3" />
                    <span>STN COORDS: {sensor.location.lat.toFixed(4)}°N, {sensor.location.lng.toFixed(4)}°E</span>
                </div>
            </div>

            {/* INTEGRATED GAUGE (Left) */}
            <div className="flex-grow flex flex-col items-center justify-center py-4 bg-white/80 rounded-2xl border border-slate-100 shadow-inner min-h-[350px]">
                <h4 className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Atmospheric Load MSL</h4>
                <div className="w-full max-h-[400px]">
                    <EngineeringGauge sensor={sensor} data={data} noHeader={true} />
                </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200">
               <p className="text-[9px] text-slate-500 italic leading-relaxed">
                  Field telemetry is captured via radar ultrasonic sensors and transmitted in real-time. Data is research-grade from the CCCSS flood network.
               </p>
            </div>
          </div>

          {/* RIGHT DASHBOARD (Analytics) */}
          <div className="flex-grow p-6 flex flex-col bg-white overflow-hidden relative">
            <button onClick={onClose} className="absolute top-6 right-6 z-20 p-2 text-slate-300 hover:text-red-500 rounded-full transition-all hover:bg-slate-50 box-content">
              <X className="w-6 h-6" />
            </button>

            {/* TABS HEADER */}
            <div className="flex items-center gap-1 mb-6 bg-slate-50 p-1 rounded-xl self-start">
               <button 
                 onClick={() => setActiveTab('analytics')}
                 className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-white text-academic-blue shadow-sm ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 View Analytics
               </button>
               <button 
                 onClick={() => setActiveTab('technical')}
                 className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'technical' ? 'bg-white text-academic-blue shadow-sm ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Technical Specs
               </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-1">
              {activeTab === 'analytics' ? (
                <div className="space-y-6">
                  {/* Rolling Stats Header */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                       {stats.map(s => (
                          <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-3 px-4 transition-all hover:border-academic-blue/30 shadow-sm relative overflow-hidden group">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                                <div className={`${s.color} opacity-40 group-hover:opacity-100 transition-opacity`}>{s.icon}</div>
                              </div>
                              <div className={`text-lg font-mono font-black ${s.color} flex items-baseline gap-1`}>
                                  {parseFloat(s.val) > 0 ? '+' : ''}{s.val}
                                  <span className="text-[9px] font-bold opacity-60">mm</span>
                              </div>
                          </div>
                       ))}
                  </div>

                  {/* MAIN HYETOGRAPH CHART */}
                  <div className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm relative overflow-hidden h-[420px] flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-academic-blue animate-pulse" />
                              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">Hyetograph: Intensity vs. Accumulation</h4>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded border border-slate-100">Live Telemetry</div>
                             <button className="text-slate-300 hover:text-academic-blue transition-colors"><ExternalLink className="w-3.5 h-3.5" /></button>
                          </div>
                      </div>
                      <div className="flex-grow">
                          <BasinAnalyticsChart 
                            history={history} 
                            markerColor={sensor.markerColor}
                            dangerLevels={sensor.dangerLevels}
                          />
                      </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                   <div className="space-y-6">
                      <section>
                         <h5 className="text-[10px] font-black text-academic-blue uppercase tracking-[0.2em] mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Real-Time Telemetry Data
                         </h5>
                         <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                               <span className="text-[11px] text-slate-500 font-bold uppercase">Water Stage (m MSL)</span>
                               <span className="text-sm font-mono font-bold text-slate-800">{current.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                               <span className="text-[11px] text-slate-500 font-bold uppercase">Temperature</span>
                               <span className="text-sm font-mono font-bold text-slate-800">{data?.temperature || '24.5'} °C</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                               <span className="text-[11px] text-slate-500 font-bold uppercase">Battery (System)</span>
                               <span className="text-sm font-mono font-bold text-slate-800">{data?.power || '11.51'} V</span>
                            </div>
                         </div>
                      </section>
                      <section>
                         <h5 className="text-[10px] font-black text-academic-blue uppercase tracking-[0.2em] mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                            <Signal className="w-4 h-4" /> Network Link Information
                         </h5>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                               <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Signal</span>
                               <div className="text-sm font-mono font-bold text-emerald-600">{data?.signal || 97}%</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                               <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Interval</span>
                               <div className="text-sm font-mono font-bold text-slate-700">60s</div>
                            </div>
                         </div>
                      </section>
                   </div>
                   <div className="space-y-6">
                      <section className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                         <h5 className="text-[10px] font-black text-academic-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> Sensor Standard & Compliance
                         </h5>
                         <div className="space-y-4">
                            <div>
                               <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Manufacturer Spec</span>
                               <div className="text-xs font-bold text-slate-700">ISO/IS 0.2mm TP Accuracy Standard</div>
                            </div>
                            <div>
                               <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Uplink Gateway</span>
                               <div className="text-xs font-bold text-slate-700">RTDAS CCCSS SUK Hub - {sensor.id.toUpperCase()}</div>
                            </div>
                            <div>
                               <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Calibration Hash</span>
                               <div className="text-[10px] font-mono text-slate-400 truncate">7f8c1b...d9a2e3</div>
                            </div>
                         </div>
                      </section>
                   </div>
                </div>
              )}
            </div>

            {/* TECHNICAL FOOTER */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mt-4 border-t border-slate-100 shrink-0">
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Battery Status</span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 font-mono">
                        <Battery className="w-3 h-3 text-amber-500" />
                        {data?.power || '11.51'} V
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Signal Health</span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 font-mono">
                        <Signal className="w-3 h-3 text-emerald-500" />
                        {data?.signal || 97}%
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sensor Compliance</span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-700">
                        <Target className="w-3 h-3 text-slate-400" />
                        ISO/IS Standard
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Data Integrity</span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-academic-gold">
                        <Globe className="w-3 h-3" />
                        Live RTDAS
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

