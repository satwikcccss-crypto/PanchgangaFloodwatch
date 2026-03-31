import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Info, ShieldAlert, 
  Activity, Users, Map as MapIcon, 
  Phone, Globe, BookOpen, AlertCircle
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
import { getAlertConfig } from '../../config/alerts';

const InfoPanel = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="overlay"
        />
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="info-sidebar p-8 flex flex-col gap-8"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold font-serif text-academic-blue flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-academic-blue" /> PROJECT INFO
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-red-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <section>
            <h3 className="text-xs font-bold text-academic-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> FUNDING & GUIDANCE
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 font-medium">
              This dashboard is developed by the <strong className="text-academic-blue">CCCSS Shivaji University</strong> as part of the <strong>DST, SERB GOVT OF INDIA</strong> sponsored project titled:
            </p>
            <p className="text-[11px] font-mono leading-relaxed text-academic-blue my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
              "IOT and Geoinformatics Based Flood Monitoring And prediction system"
            </p>
            <p className="text-sm leading-relaxed text-slate-600 font-medium">
              Under the guidance of <strong>Dr. S. S. Panhalkar Sir</strong> & <strong>Dr. G. S. Nivhekar Sir</strong>.<br/>
              Developed by <strong>Er. Satwik K. Udupi</strong>.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> EMERGENCY HOTLINES
            </h3>
            <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between font-bold text-slate-700 border-b border-slate-200 pb-2">
                <span>Flood Control Room</span>
                <span className="text-academic-blue">1070</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 border-b border-slate-200 pb-2 pt-2">
                <span>Police Control Room</span>
                <span className="text-academic-blue">100</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 pt-2">
                <span>Disaster Management</span>
                <span className="text-academic-blue">108</span>
              </div>
            </div>
          </section>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const MainDashboard = ({ onNavigate }) => {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedSensorId, setSelectedSensorId] = useState(SENSORS[0].id);
  const [shuffledSensors, setShuffledSensors] = useState(SENSORS);
  const [zoomedSensor, setZoomedSensor] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const active = SENSORS.find(s => s.id === selectedSensorId);
    if (active) {
      const others = SENSORS.filter(s => s.id !== selectedSensorId);
      setShuffledSensors([active, ...others]);
    }
  }, [selectedSensorId]);

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

  const overallAlert = Object.values(sensorData).reduce((max, curr) => {
    const levels = { normal: 0, warning: 1, danger: 2, extreme: 3 };
    return levels[curr.alertLevel] > levels[max] ? curr.alertLevel : max;
  }, 'normal');

  return (
    <div className="min-h-screen flex flex-col pt-8">
      <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 flex-grow pb-24">
        <HeaderBar 
          connectionStatus={loading ? 'offline' : 'online'} 
          lastUpdateTime={lastUpdate}
          onAboutClick={() => setIsAboutOpen(true)}
          onNavigate={onNavigate}
          currentPage="dashboard"
        />

        {/* Top: Alert Status */}
        <AlertBanner alertLevel={overallAlert} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Visual Monitoring */}
          <div className="xl:col-span-8 space-y-8">
            {/* Live Chart Monitoring */}
            <div className="academic-panel p-6 group">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold font-serif text-academic-blue uppercase tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 group-hover:animate-pulse" /> TIME-SERIES HYDROLOGICAL ANALYSIS
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time water level trends with threshold forecasting</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SENSORS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSensorId(s.id)}
                      className={`auth-button ${selectedSensorId === s.id ? 'active' : ''}`}
                    >
                      {s.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[350px]">
                <LiveDataChart sensorId={selectedSensorId} sensorData={sensorData[selectedSensorId]} />
              </div>
            </div>

            <div className="h-[450px]">
              <InteractiveMap 
                sensorData={sensorData} 
                selectedSensor={selectedSensorId}
                onSensorClick={(id) => {
                  setSelectedSensorId(id);
                  setZoomedSensor(SENSORS.find(s => s.id === id));
                }}
              />
            </div>
          </div>

          {/* Right Column: Sidebar Monitoring Stack */}
          <div className="xl:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold font-serif text-academic-blue uppercase tracking-widest leading-none">Live Radar Nodes</h3>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Sync-Shuffle
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {shuffledSensors.map(s => (
                <SimpleIndicator 
                  key={s.id} 
                  sensor={s} 
                  data={sensorData[s.id]} 
                  active={selectedSensorId === s.id}
                  onClick={() => {
                    setSelectedSensorId(s.id);
                    setZoomedSensor(s);
                  }}
                />
              ))}
            </div>

            <QRRegistration />
            
          </div>
        </div>
      </div>

      {/* Overlays / Modals */}
      <InfoPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
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


export default MainDashboard;
