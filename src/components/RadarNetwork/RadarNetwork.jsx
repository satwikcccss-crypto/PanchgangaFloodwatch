import React, { useState, useEffect } from 'react';
import HeaderBar from '../Dashboard/HeaderBar';
import { EngineeringGauge, ZoomedGauge } from '../WaterGauge/EngineeringGauge';
import { fetchAllSensors } from '../../services/thingspeakAPI';
import { SENSORS } from '../../config/sensors';
import { motion } from 'framer-motion';
import { LayoutGrid, Info } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col pt-8">
      <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 flex-grow pb-24">
        <HeaderBar 
          connectionStatus={loading ? 'offline' : 'online'} 
          lastUpdateTime={lastUpdate}
          onAboutClick={() => {}} // Could add about modal here too
          onNavigate={onNavigate}
          currentPage="network"
        />

        <div className="mt-8 mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-serif text-academic-blue uppercase tracking-tight flex items-center gap-3">
              <LayoutGrid className="w-6 h-6" /> RADAR SENSOR GRID • TRIAL PHASE
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Institutional monitoring network for Panchganga basin RTDAS nodes
            </p>
          </div>
          

        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-6"
        >
          {SENSORS.map(s => (
            <EngineeringGauge 
              key={s.id} 
              sensor={s} 
              data={sensorData[s.id]} 
              onClick={() => setZoomedSensor(s)}
            />
          ))}
        </motion.div>
        
        {/* Trial Basis Disclaimer removed */}
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
