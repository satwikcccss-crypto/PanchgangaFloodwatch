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
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // 1. Initialize Advanced Security Shield
  useEffect(() => {
    const disableShield = initSecurityShield();
    return () => disableShield();
  }, []);

  // 2. Fetch and synchronize telemetry data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllSensors();
      setSensorData(data);
      setLastUpdate(new Date().toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch sensor data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 900000); // 15 minutes — RTDAS update cadence
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
