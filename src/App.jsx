import React, { useState, useEffect } from 'react';
import MainDashboard from './components/Dashboard/MainDashboard';
import RadarNetwork from './components/RadarNetwork/RadarNetwork';
import FloatingNavDock from './components/Dashboard/FloatingNavDock';
import { ZoomedGauge } from './components/WaterGauge/EngineeringGauge';
import { initSecurityShield } from './utils/security';
import { fetchAllSensors } from './services/thingspeakAPI';
import { SENSORS } from './config/sensors';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedSensorId, setSelectedSensorId] = useState(SENSORS[0].id);
  const [detailedSensor, setDetailedSensor] = useState(null);
  const [sensorData, setSensorData] = useState(() => {
    try {
      const cached = localStorage.getItem('panchganga_sensor_cache');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('panchganga_sensor_cache');
  });
  const [lastUpdate, setLastUpdate] = useState(() => {
    return localStorage.getItem('panchganga_sensor_last_update') || null;
  });
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // 1. Initialize Advanced Security Shield
  useEffect(() => {
    const disableShield = initSecurityShield();
    return () => disableShield();
  }, []);

  // 2. Fetch and synchronize telemetry data
  const loadData = async () => {
    // Only show global loading on first boot if no cache
    if (Object.keys(sensorData).length === 0) {
      setLoading(true);
    }
    
    try {
      const data = await fetchAllSensors();
      setSensorData(data);
      const currentTime = new Date().toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setLastUpdate(currentTime);
      setLoading(false);
      
      // Update cache
      localStorage.setItem('panchganga_sensor_cache', JSON.stringify(data));
      localStorage.setItem('panchganga_sensor_last_update', currentTime);
    } catch (err) {
      console.error('Failed to fetch sensor data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // 1 minute polling for near real-time updates
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  const handleOpenDetails = () => {
    const active = SENSORS.find(s => s.id === selectedSensorId);
    if (active) {
      setDetailedSensor(active);
    }
  };

  return (
    <div className="bg-cream min-h-screen pb-16 md:pb-0">
      {currentPage === 'dashboard' ? (
        <MainDashboard 
          onNavigate={setCurrentPage} 
          sensorData={sensorData}
          loading={loading}
          lastUpdate={lastUpdate}
          selectedSensorId={selectedSensorId}
          setSelectedSensorId={setSelectedSensorId}
          setDetailedSensor={setDetailedSensor}
          isAboutOpen={isAboutOpen}
          setIsAboutOpen={setIsAboutOpen}
        />
      ) : (
        <RadarNetwork 
          onNavigate={setCurrentPage} 
          sensorData={sensorData}
          loading={loading}
          lastUpdate={lastUpdate}
          setDetailedSensor={setDetailedSensor}
        />
      )}

      {/* Global Floating Navigation Panel */}
      <FloatingNavDock 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        selectedSensorId={selectedSensorId}
        onSensorSelect={setSelectedSensorId}
        onRefreshData={handleRefresh}
        onOpenDetails={handleOpenDetails}
      />

      {/* Global Zoomed Analytics Dialog */}
      {detailedSensor && (
        <ZoomedGauge
          sensor={detailedSensor}
          data={sensorData[detailedSensor.id]}
          onClose={() => setDetailedSensor(null)}
        />
      )}
    </div>
  );
}

export default App;
