import React, { useState } from 'react';
import MainDashboard from './components/Dashboard/MainDashboard';
import RadarNetwork from './components/RadarNetwork/RadarNetwork';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="bg-cream min-h-screen">
      {currentPage === 'dashboard' ? (
        <MainDashboard onNavigate={setCurrentPage} />
      ) : (
        <RadarNetwork onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
