import React, { useState, useEffect } from 'react';
import HeaderBar from '../Dashboard/HeaderBar';
import { EngineeringGauge, ZoomedGauge } from '../WaterGauge/EngineeringGauge';
import { fetchAllSensors } from '../../services/thingspeakAPI';
import { SENSORS } from '../../config/sensors';
import { motion } from 'framer-motion';
import { LayoutGrid, Info, Activity, Globe, Clock, ShieldAlert, Radio, Battery, Signal, Zap, ChevronRight } from 'lucide-react';

const RadarNetwork = ({ onNavigate }) => {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [zoomedSensor, setZoomedSensor] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllSensors();
        setSensorData(data);
        setLastUpdate(new Date().toLocaleTimeString());
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch sensor data:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col pt-8 engineering-grid">
      <div className="max-w-[1700px] w-full mx-auto px-4 lg:px-8 flex-grow pb-24">
        <HeaderBar 
          connectionStatus={loading ? 'offline' : 'online'} 
          lastUpdateTime={lastUpdate}
          onAboutClick={() => {}} 
          onNavigate={onNavigate}
          currentPage="network"
        />

        {/* ANALYSIS HEADER */}
        <div className="mt-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col">
                <h3 className="text-xl font-black font-serif text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                    <Activity className="w-6 h-6 text-academic-blue" />
                    Telemetry Network Analysis
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                    RTDAS Sensor Grid • IS-Standards • 24/7 Monitoring
                </p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Operational Status</span>
                   <span className="text-sm font-black text-emerald-600 uppercase tracking-tight">Active & Reporting</span>
                </div>
            </div>
        </div>

        {/* SENSOR GRID */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8"
        >
          {SENSORS.map(s => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-[10px] font-black text-academic-blue uppercase mb-1">RG-{s.id.slice(0,2).toUpperCase()}</div>
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight leading-tight">{s.shortName}</h4>
                    </div>
                    <div className="bg-academic-blue/10 text-academic-blue px-2 py-1 rounded text-[8px] font-mono font-bold">
                        {lastUpdate || 'LIVE'}
                    </div>
                </div>

                {/* Gauge Section */}
                <div className="flex-grow min-h-[250px] mb-6 flex flex-col justify-center">
                    <EngineeringGauge sensor={s} data={sensorData[s.id]} noHeader={true} />
                </div>

                {/* Intensity Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        <span>Stage Intensity</span>
                        <span className="text-academic-blue">0.12 m/hr</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            className="h-full bg-gradient-to-right from-amber-400 to-amber-500"
                        />
                    </div>
                </div>

                {/* Micro Stats */}
                <div className="flex justify-between items-center px-2 mb-6 text-[9px] font-bold text-slate-400 uppercase">
                    <div className="flex flex-col items-center gap-1">
                        <Signal className="w-3 h-3 text-emerald-500" />
                        <span>97%</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Battery className="w-3 h-3 text-amber-500" />
                        <span>12.8V</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span>Live</span>
                    </div>
                </div>

                {/* Action */}
                <button 
                    onClick={() => setZoomedSensor(s)}
                    className="w-full py-3 border border-slate-100 rounded-xl text-[10px] font-black font-serif text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-academic-blue transition-all group-hover:border-academic-blue/20"
                >
                    View Full Analytics
                </button>
            </div>
          ))}
        </motion.div>
        
        {/* BOTTOM TECH STATUS */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
             {[
                { label: 'Active Nodes', val: '05 of 05', icon: Zap, color: 'text-blue-500' },
                { label: 'Gateway', val: 'CCCSS-SU-RG-01', icon: Globe, color: 'text-emerald-500' },
                { label: 'Latency', val: '< 1500 ms', icon: Clock, color: 'text-amber-500' },
                { label: 'Protocol', val: 'TLS 1.3 / AES', icon: ShieldAlert, color: 'text-blue-500' },
                { label: 'Uplink', val: 'ThingSpeak API', icon: Radio, color: 'text-indigo-500' },
             ].map(item => (
                <div key={item.label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{item.label}</div>
                        <div className="text-[10px] font-bold text-slate-700 font-mono tracking-tight">{item.val}</div>
                    </div>
                </div>
             ))}
        </div>
      </div>

      {zoomedSensor && (
        <ZoomedGauge 
          sensor={zoomedSensor} 
          data={sensorData[zoomedSensor.id]} 
          onClose={() => setZoomedSensor(null)} 
        />
      )}
    </div>
  );
};

export default RadarNetwork;
