import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShieldAlert, Activity, Map as MapIcon,
  Phone, Globe, Info, BookOpen, AlertCircle,
  Radio, Clock
} from 'lucide-react';
import HeaderBar from './HeaderBar';
import InteractiveMap from '../Map/InteractiveMap';
import { EngineeringGauge, ZoomedGauge, SimpleIndicator } from '../WaterGauge/EngineeringGauge';
import LiveDataChart from '../Charts/LiveDataChart';
import QRRegistration from '../Alerts/QRRegistration';
import AlertBanner from '../Alerts/AlertBanner';
import GaugeWidget from '../WaterGauge/GaugeWidget';
import { fetchAllSensors } from '../../services/thingspeakAPI';
import { SENSORS } from '../../config/sensors';
import { getAlertConfig, calculateBasinRisk } from '../../config/alerts';

const MainDashboard = ({ onNavigate }) => {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedSensorId, setSelectedSensorId] = useState(SENSORS[0].id);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [detailedSensor, setDetailedSensor] = useState(null);

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

  const basinRisk = calculateBasinRisk(sensorData);

  return (
    <div className="min-h-screen flex flex-col pt-8 bg-cream">
       <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 flex-grow pb-8">
          
          <HeaderBar 
            connectionStatus={loading ? 'offline' : 'online'}
            lastUpdateTime={lastUpdate}
            onAboutClick={() => setIsAboutOpen(true)}
            onNavigate={onNavigate}
            currentPage="dashboard"
          />

          <div className="mt-4 space-y-6">
            <AlertBanner alertLevel={basinRisk.level} triggers={basinRisk.triggers} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Map & Chart */}
              <div className="xl:col-span-8 space-y-6">
                 <div className="academic-panel h-[600px] overflow-hidden relative group">
                   <InteractiveMap
                     sensorData={sensorData}
                     selectedSensor={selectedSensorId}
                     onSensorClick={(id) => {
                        setSelectedSensorId(id);
                        setDetailedSensor(SENSORS.find(s => s.id === id));
                     }}
                   />
                 </div>

                 <div className="academic-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-sm font-bold text-academic-blue uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-5 h-5" /> Time-Series Stage Analysis
                       </h3>
                       <div className="flex gap-2">
                          {SENSORS.map(s => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSensorId(s.id)}
                              className={`auth-button ${selectedSensorId === s.id ? 'active' : ''}`}
                            >
                              {s.shortName}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="h-[300px]">
                       <LiveDataChart sensorId={selectedSensorId} data={sensorData[selectedSensorId]} />
                    </div>
                 </div>
              </div>

              {/* Right Column: Gauges & Sidebar */}
              <div className="xl:col-span-4 space-y-4">
                 <div className="flex items-center justify-between px-1 mb-1">
                    <h3 className="text-[10px] font-black font-serif text-academic-blue uppercase tracking-widest">
                       Live Station Gauges
                    </h3>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded shadow-sm flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> RTDAS
                    </div>
                 </div>

                 <div className="flex flex-col gap-3">
                    {SENSORS.map(s => (
                       <GaugeWidget
                         key={s.id}
                         sensor={s}
                         data={sensorData[s.id]}
                         active={selectedSensorId === s.id}
                         onClick={() => {
                           setSelectedSensorId(s.id);
                           setDetailedSensor(s);
                         }}
                       />
                    ))}
                 </div>

                 <QRRegistration />
              </div>
            </div>
          </div>
       </div>

       <DisclaimerFooter />
       <InfoPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
       
       {detailedSensor && (
          <ZoomedGauge
            sensor={detailedSensor}
            data={sensorData[detailedSensor.id]}
            onClose={() => setDetailedSensor(null)}
          />
       )}
    </div>
  );
};

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

export default MainDashboard;
