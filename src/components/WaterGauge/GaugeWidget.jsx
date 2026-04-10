import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Waves } from 'lucide-react';
import { getAlertConfig } from '../../config/alerts';

/**
 * Compact side-gauge indicator for the map sidebar.
 * Mimics the Rainwatch "SimpleRainIndicator" style.
 */
export const GaugeWidget = ({ sensor, data, active, onClick }) => {
  const level = data?.waterLevel || 0;
  const alertConfig = getAlertConfig(data?.alertLevel || 'normal');
  const history = data?.history || [];
  
  // Trend logic: compare current level to a few samples ago
  const prevLevel = history.length > 5 ? (typeof history[history.length - 6] === 'object' ? history[history.length - 6].waterLevel : history[history.length - 6]) : level;
  const isRising = level >= prevLevel && level !== 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
        active 
          ? 'ring-2 ring-academic-blue/10 border-academic-blue shadow-md' 
          : 'border-slate-200 shadow-sm'
      }`}
      style={{ height: '140px' }}
    >
      {/* Side Accent Bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: active ? alertConfig.color : (sensor.markerColor || alertConfig.color) }}
      />
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-tight pr-2">
          {sensor.name.toUpperCase()}
        </h4>
        {active && <Waves className="w-3 h-3 text-academic-blue opacity-40" />}
      </div>

      {/* Main Reading */}
      <div className="mt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">
            {level.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">m MSL</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[8px] font-black uppercase tracking-widest ${isRising ? 'text-emerald-500' : 'text-slate-400'}`}>
            {level > 0 ? (isRising ? 'RISING' : 'FALLING') : 'OFFLINE'}
          </span>
          {level > 0 && (isRising ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-slate-400" />)}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-2">
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
          RTDAS Live Uplink
        </span>
        <div 
          className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-slate-100 bg-slate-50 shadow-sm" 
          style={{ color: alertConfig.color }}
        >
          {alertConfig.label}
        </div>
      </div>
    </motion.div>
  );
};

export default GaugeWidget;
