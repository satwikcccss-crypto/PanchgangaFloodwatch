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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => onClick && onClick(sensor.id)}
      className="bg-white rounded-xl p-4 border shadow-sm transition-all duration-300 cursor-pointer group relative overflow-hidden"
      style={{ borderColor: `${alertConfig.color}20` }}
    >
      {/* Top glow bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-full"
        style={{ background: `linear-gradient(90deg, transparent, ${alertConfig.color}, transparent)` }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="status-dot flex-shrink-0"
            style={{ backgroundColor: isActive ? alertConfig.color : '#475569' }}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-academic-blue truncate leading-tight">
              {sensor.name}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium truncate">{sensor.sensorType}</p>
          </div>
        </div>
        <span 
          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
          style={{ 
            backgroundColor: alertConfig.bgColor, 
            color: alertConfig.color,
            border: `1px solid ${alertConfig.color}30`
          }}
        >
          {alertConfig.label}
        </span>
      </div>

      {/* Water Level Display */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="stat-number text-2xl font-black text-slate-800">
              {waterLevel !== null && waterLevel !== undefined ? waterLevel.toFixed(2) : '--'}
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">m MSL</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon()}
            <span className="text-[10px] text-slate-500">
              {pctOfWarning > 0 ? `${pctOfWarning.toFixed(0)}% of warning` : 'No data'}
            </span>
          </div>
        </div>
        
        {/* Mini Gauge */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle 
              cx="18" cy="18" r="14" fill="none" 
              stroke={alertConfig.color}
              strokeWidth="3"
              strokeDasharray={`${Math.min(100, pctOfWarning) * 0.88} 88`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Droplets className="w-3.5 h-3.5" style={{ color: alertConfig.color }} />
          </div>
        </div>
      </div>

      {/* Footer: Thresholds */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400">
        <span>W: {sensor.dangerLevels.warning}m</span>
        <span>D: {sensor.dangerLevels.danger}m</span>
        <span>HFL: {sensor.dangerLevels.hfl}m</span>
      </div>

      {/* Timestamp */}
      {data?.timestamp && (
        <div className="text-[10px] text-slate-600 mt-1.5 font-mono">
          {new Date(data.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Kolkata'
          })}
          {data.isMockData && <span className="ml-1 text-amber-600">(demo)</span>}
        </div>
      )}
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
