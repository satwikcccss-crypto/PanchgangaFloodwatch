import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SENSORS } from '../../config/sensors';
import { getAlertConfig } from '../../config/alerts';

const StatCard = ({ sensor, data, index, onClick }) => {
  const alertConfig = getAlertConfig(data?.alertLevel || 'normal');
  const waterLevel = data?.waterLevel;
  const isActive = data?.status === 'active';
  
  // Determine trend based on water level relative to thresholds
  const pctOfWarning = waterLevel ? (waterLevel / sensor.dangerLevels.warning) * 100 : 0;
  
  const getTrendIcon = () => {
    if (!waterLevel) return <Minus className="w-3.5 h-3.5 text-slate-500" />;
    if (pctOfWarning > 90) return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
    if (pctOfWarning < 50) return <TrendingDown className="w-3.5 h-3.5 text-green-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onClick?.(sensor.id)}
      className="bg-white rounded-lg p-5 border shadow-sm cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between h-[160px] border-slate-200 hover:shadow-md"
    >
      {/* Floodwatch Left Accent Bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: isActive ? alertConfig.color : '#94a3b8' }}
      />

      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-tight mb-1">
            {sensor.name.toUpperCase()}
          </h4>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{sensor.river}</p>
        </div>
      </div>

      {/* Main Reading */}
      <div className="flex flex-col mt-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-slate-800 tracking-tighter tabular-nums">
            {waterLevel !== null && waterLevel !== undefined ? waterLevel.toFixed(2) : '--'}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">m MSL</span>
        </div>
        
        {/* Trend Indicator */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isActive ? (pctOfWarning > 90 ? 'RISING' : pctOfWarning < 50 ? 'FALLING' : 'STABLE') : 'OFFLINE'}
          </span>
          {isActive && (pctOfWarning > 90 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-slate-400" />)}
        </div>
      </div>

      {/* Reference Footer */}
      <div className="flex justify-between items-end mt-4">
        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
           IST REF
        </div>
        <div 
          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-slate-100 bg-slate-50" 
          style={{ color: alertConfig.color }}
        >
           {alertConfig.label}
        </div>
      </div>
    </motion.div>
  );
};

const StatsOverview = ({ sensorData, onSensorClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
      {SENSORS.map((sensor, index) => (
        <StatCard
          key={sensor.id}
          sensor={sensor}
          data={sensorData?.[sensor.id]}
          index={index}
          onClick={onSensorClick}
        />
      ))}
    </div>
  );
};

export default React.memo(StatsOverview);
