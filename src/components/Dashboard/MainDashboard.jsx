import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShieldAlert, Activity, Map as MapIcon,
  Phone, Globe, Info, BookOpen, AlertCircle,
  Radio, Clock
} from 'lucide-react';
import HeaderBar from './HeaderBar';
import StatsOverview from './StatsOverview';
import InteractiveMap from '../Map/InteractiveMap';
import { EngineeringGauge, ZoomedGauge, SimpleIndicator } from '../WaterGauge/EngineeringGauge';
import LiveDataChart from '../Charts/LiveDataChart';
import QRRegistration from '../Alerts/QRRegistration';
import AlertBanner from '../Alerts/AlertBanner';
import { fetchAllSensors } from '../../services/thingspeakAPI';
import { SENSORS } from '../../config/sensors';
import { getAlertConfig, calculateBasinRisk } from '../../config/alerts';

/* ─── Info / Project Sidebar ─────────────────────────────────────────── */
const InfoPanel = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="overlay"
        />
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="info-sidebar p-8 flex flex-col gap-6 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold font-serif text-academic-blue flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" /> PROJECT INFO
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-red-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Ownership */}
          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> OWNERSHIP & DEVELOPMENT
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              This dashboard is the intellectual property of the{' '}
              <strong className="text-academic-blue">Centre for Climate Change and Sustainability Studies (CCCSS)</strong>,{' '}
              <strong>Shivaji University, Kolhapur</strong>. All data, results, and visual representations are owned by CCCSS.
            </p>
          </section>

          {/* Project */}
          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> SPONSORED PROJECT
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Developed under the <strong>DST–SERB, Govt. of India</strong> sponsored research project:
            </p>
            <p className="text-[11px] font-mono text-academic-blue my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-inner leading-relaxed">
              "IoT and Geoinformatics Based Flood Monitoring and Prediction System for Panchganga River Basin"
            </p>
            <p className="text-sm text-slate-600">
              Under the guidance of <strong>Dr. S. S. Panhalkar</strong> &amp; <strong>Dr. G. S. Nivhekar</strong>.<br />
              Developed by <strong>Er. Satwik K. Udupi</strong>.
            </p>
          </section>

          {/* Data & System */}
          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> DATA ACQUISITION
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Water level data is captured by <strong>ultrasonic radar sensors</strong> installed over bridges and weirs on the Panchganga River and its tributaries. Telemetry is transmitted via the <strong>RTDAS (Real-Time Data Acquisition System)</strong> portal and integrated with the <strong>ThingSpeak IoT API</strong> for real-time monitoring.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> ACADEMIC DISCLAIMER
            </h3>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This dashboard is developed by CCCSS, Shivaji University and is currently <strong>under active development</strong>. All data presented is <strong>academic and research-derived</strong> and must be used solely for educational and awareness purposes. Official flood response and emergency decisions must be based on authoritative sources (WRD Maharashtra, IMD, CWC).
              <br /><br />
              Data and site ownership: <strong>CCCSS, Shivaji University, Kolhapur</strong>. Unauthorised reproduction is prohibited.
            </p>
          </section>

          {/* Emergency */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> EMERGENCY HOTLINES
            </h3>
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
              {[
                { label: 'Flood Control Room', num: '1070' },
                { label: 'Police Control Room', num: '100' },
                { label: 'Disaster Management', num: '108' },
                { label: 'WRD Maharashtra', num: '022-22027990' },
              ].map((c, i, arr) => (
                <div key={c.label}
                  className={`flex justify-between font-bold text-slate-700 py-2 ${i < arr.length - 1 ? 'border-b border-slate-200' : ''}`}>
                  <span>{c.label}</span>
                  <a href={`tel:${c.num}`} className="text-academic-blue hover:underline">{c.num}</a>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ─── Disclaimer Footer Bar ──────────────────────────────────────────── */
const DisclaimerFooter = () => (
  <div className="border-t border-slate-200 bg-amber-50/60 px-4 lg:px-8 py-3 text-center">
    <p className="text-[10px] text-amber-800 font-medium leading-relaxed max-w-5xl mx-auto">
      <strong>⚠ Academic Disclaimer:</strong> This dashboard is developed by CCCSS, Shivaji University Kolhapur and is under active development.
      Data is academic and research-derived — for awareness purposes only. Official emergency decisions must rely on WRD / IMD / CWC sources.
      Site &amp; data ownership: <strong>CCCSS, Shivaji University, Kolhapur</strong>. |{' '}
      <span className="text-amber-700 font-bold">Demo data shown until RTDAS channels are configured.</span>
    </p>
  </div>
);

/* ─── Dashboard Summary Content ──────────────────────────────────────── */
const DashboardSummary = ({ sensorData }) => {
  const activeAlerts = Object.values(sensorData).filter(d => d.alertLevel !== 'normal').length;
  const activeNodes = Object.values(sensorData).length;
  const totalRainfall = Object.values(sensorData).reduce((acc, d) => acc + (d.waterLevel || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h3 className="text-[10px] font-black text-academic-gold uppercase tracking-[0.3em]">Network Intelligence</h3>
        <h2 className="text-3xl font-black font-serif text-slate-800 leading-tight">Basin Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Total Network Rainfall', val: `${totalRainfall.toFixed(2)}`, unit: 'MM', color: 'text-academic-blue', icon: <Waves className="w-5 h-5" /> },
          { label: 'Active Alerts', val: activeAlerts, unit: 'LOGGED', color: activeAlerts > 0 ? 'text-amber-500' : 'text-emerald-500', icon: <ShieldAlert className="w-5 h-5" /> },
          { label: 'Stations Online', val: activeNodes, unit: 'NODES', color: 'text-emerald-600', icon: <Activity className="w-5 h-5" /> },
          { label: 'System Status', val: 'SECURE', unit: 'ENCRYPTED', color: 'text-academic-blue', icon: <Zap className="w-5 h-5" /> }
        ].map(stat => (
          <div key={stat.label} className="academic-panel p-5 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
               {stat.icon}
               <span className="text-[9px] font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono ${stat.color}`}>{stat.val}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
          <MapIcon className="w-8 h-8 text-academic-blue/40" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Station Analytics Guide</h4>
          <p className="text-xs text-slate-500 font-medium">Click any station marker on the map to view detailed rainfall intensity, telemetry health, and historical trends.</p>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Station Detail Content ────────────────────────────────────────── */
const StationDetail = ({ sensor, data, onBack }) => {
  const level = data?.waterLevel || 0;
  const alertConfig = getAlertConfig(data?.alertLevel || 'normal');
  const history = data?.history || [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-academic-blue transition-colors mb-4 group"
      >
        <motion.span whileHover={{ x: -2 }}><X className="w-4 h-4" /></motion.span>
        Close Station View
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-500 border border-slate-200">
              RG-{sensor.id.toUpperCase()}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm" style={{ backgroundColor: alertConfig.color, color: '#fff' }}>
              {alertConfig.label} Status
            </div>
          </div>
          <h2 className="text-2xl font-black font-serif text-slate-800 leading-tight uppercase">
            {sensor.name} <br/>
            <span className="text-academic-blue/60 text-sm italic">{sensor.subBasin || 'Basin Channel'} Station</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="academic-panel p-5 bg-slate-50/50 border-l-4 border-l-academic-blue">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Realtime Level</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-slate-800">{level.toFixed(2)}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">MM</span>
            </div>
          </div>
          <div className="academic-panel p-5 flex flex-col justify-center items-center gap-1">
            <EngineeringGauge sensor={sensor} data={data} noHeader={true} />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Visual Scale</span>
          </div>
      </div>

      <div className="academic-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
           <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Rainfall Intensity Time-Series</h4>
           <div className="flex gap-1">
             {['1H', '3H', '6H', '24H'].map(t => (
               <button key={t} className="text-[8px] font-bold px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-400">{t}</button>
             ))}
           </div>
        </div>
        <div className="h-[280px]">
          <BasinAnalyticsChart history={history} markerColor={sensor.markerColor} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Battery', val: `${data?.power || '12.8'}V`, icon: <Battery className="w-3.5 h-3.5" />, color: 'text-amber-500' },
          { label: 'Signal', val: `${data?.signal || 98}%`, icon: <Signal className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
          { label: 'Lat/Long', val: sensor.location.lat.toFixed(3), icon: <Globe className="w-3.5 h-3.5" />, color: 'text-blue-500' }
        ].map(item => (
          <div key={item.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
            </div>
            <div className={`text-[12px] font-mono font-bold ${item.color}`}>{item.val}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Main Dashboard Redesign ────────────────────────────────────────── */
const MainDashboard = ({ onNavigate }) => {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllSensors();
        setSensorData(data);
        setLastUpdate(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch sensor data:', err);
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentSensor = SENSORS.find(s => s.id === selectedSensorId);

  return (
    <div className="dashboard-split-container">
      {/* LEFT: MAP SECTION */}
      <div className="map-viewport">
        <InteractiveMap
          sensorData={sensorData}
          selectedSensor={selectedSensorId}
          onSensorClick={(id) => setSelectedSensorId(id)}
        />
        
        {/* Floating Controls Overlay */}
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3 pointer-events-none">
           <div className="bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-xl pointer-events-auto max-w-[280px]">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 bg-academic-blue rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h1 className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-none">Panchganga Basin</h1>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Rain Gauge Grid</span>
                 </div>
              </div>
              <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                     <span className="text-slate-400 uppercase">Alert Status</span>
                     <span className="text-emerald-500 font-mono uppercase bg-emerald-50 px-2 rounded">Safe</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold">
                     <span className="text-slate-400 uppercase">System Network</span>
                     <span className="text-academic-blue font-mono uppercase bg-blue-50 px-2 rounded">RTDAS-01</span>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT: INFO PANEL SECTION */}
      <div className="info-viewport p-6 md:p-10 lg:p-14">
        <div className="max-w-2xl mx-auto space-y-12 pb-24">
          
          {/* Header row */}
          <div className="flex items-center justify-between gap-4">
             <div>
                <HeaderBar 
                  connectionStatus={loading ? 'offline' : 'online'}
                  lastUpdateTime={lastUpdate}
                  onAboutClick={() => setIsAboutOpen(true)}
                  onNavigate={onNavigate}
                  currentPage="dashboard"
                  minimalMode={true}
                />
             </div>
          </div>

          <AnimatePresence mode="wait">
            {!selectedSensorId ? (
              <DashboardSummary sensorData={sensorData} key="overview" />
            ) : (
              <StationDetail 
                sensor={currentSensor} 
                data={sensorData[selectedSensorId]} 
                onBack={() => setSelectedSensorId(null)} 
                key="detail"
              />
            )}
          </AnimatePresence>

          {/* Institutional Branding Footer */}
          <div className="pt-20 border-t border-slate-100 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default text-center">
              <h4 className="text-[10px] font-black text-academic-blue uppercase tracking-[0.4em] mb-2">CCCSS • Shivaji University</h4>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">DEVELOPED BY SATWIK K. UDUPI JRF 2026 FOR ADVANCED HYDROMET INTERFACE RESEARCH</p>
          </div>
        </div>
      </div>

      {/* Info Sidebar Modal (Legacy compatibility) */}
      <InfoPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default MainDashboard;
