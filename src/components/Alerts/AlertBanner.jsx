import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ShieldAlert, CheckCircle2, Siren } from 'lucide-react';
import { getAlertConfig } from '../../config/alerts';

const AlertBanner = ({ alertLevel, triggers = [], riskTrend = 'stable' }) => {
  const config = getAlertConfig(alertLevel);
  
  const getIcon = () => {
    switch (alertLevel) {
      case 'normal': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'danger': return <ShieldAlert className="w-6 h-6 text-orange-600" />;
      case 'extreme': return <Siren className="w-6 h-6 text-red-600" />;
      default: return <AlertCircle className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    if (alertLevel === 'normal') {
        if (riskTrend === 'rising') return 'Panchganga levels rising — monitoring inflow.';
        return 'System active: all sensors within safe limits.';
    }
    
    const triggerNames = triggers.length > 0 
        ? triggers.join(' & ').toUpperCase() 
        : 'SENSORS';

    return `${triggerNames} CROSSING ${alertLevel.toUpperCase()} THRESHOLD.`;
  };

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`official-alert ${alertLevel} border-l-[6px] shadow-sm`}
    >
      <div className="flex-shrink-0">
        <div className="bg-white/90 p-2 rounded-xl shadow-inner border border-slate-100">
           {getIcon()}
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">{config.label}</h2>
          <span className="h-3 w-px bg-current opacity-20 hidden sm:inline" />
          <h2 className="text-[10px] font-black tracking-widest">{config.labelMr}</h2>
          
          {riskTrend !== 'stable' && (
             <span className={`sm:ml-auto text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                riskTrend === 'surging' ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-100 text-amber-600'
             }`}>
                {riskTrend === 'surging' ? 'Rapid Surge Detected' : 'Basin Rising'}
             </span>
          )}
        </div>
        <p className="text-[12px] font-black tracking-tight mt-1">
          {getStatusText()}
        </p>
      </div>
    </motion.div>
  );
};

export default AlertBanner;
