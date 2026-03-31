import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ShieldAlert, CheckCircle2, Siren } from 'lucide-react';
import { getAlertConfig } from '../../config/alerts';

const AlertBanner = ({ alertLevel }) => {
  const config = getAlertConfig(alertLevel);
  
  const getIcon = () => {
    switch (alertLevel) {
      case 'normal': return <CheckCircle2 className="w-6 h-6" />;
      case 'warning': return <AlertCircle className="w-6 h-6" />;
      case 'danger': return <ShieldAlert className="w-6 h-6" />;
      case 'extreme': return <Siren className="w-6 h-6" />;
      default: return <AlertCircle className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`official-alert ${alertLevel}`}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest">{config.label}</h2>
          <span className="h-4 w-px bg-current opacity-20" />
          <h2 className="text-sm font-bold tracking-tight">{config.labelMr}</h2>
        </div>
        <p className="text-[11px] font-semibold opacity-90 mt-1 uppercase tracking-tight">
          Current Basin Status: {config.description} | {config.actionMr}
        </p>
      </div>
      <div className="hidden md:block">
        <span className="text-[10px] font-bold underline decoration-2 underline-offset-4 cursor-help">
          CWC & WRD MAHARASHTRA STANDARDS
        </span>
      </div>
    </motion.div>
  );
};

export default AlertBanner;
