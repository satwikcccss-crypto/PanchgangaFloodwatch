import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { BarChart3, Clock, ChevronDown } from 'lucide-react';
import { SENSORS } from '../../config/sensors';
import { fetchHistoricalData } from '../../services/thingspeakAPI';
import { getAlertConfig } from '../../config/alerts';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LiveDataChart = ({ sensorId, sensorData }) => {
  const [historicalData, setHistoricalData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch historical data when sensorId changes
  useEffect(() => {
    if (!sensorId) return;
    
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchHistoricalData(sensorId, 60);
        setHistoricalData(prev => ({ ...prev, [sensorId]: data }));
      } catch (err) {
        console.error('Chart data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
    const interval = setInterval(loadHistory, 120000);
    return () => clearInterval(interval);
  }, [sensorId]);

  const activeSensor = SENSORS.find(s => s.id === sensorId);
  const activeData = historicalData[sensorId] || [];

  // Chart configuration
  const chartData = useMemo(() => {
    if (!activeData.length) return { labels: [], datasets: [] };

    const labels = activeData.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      });
    });

    const waterLevels = activeData.map(d => d.waterLevel);
    const sensorColor = activeSensor?.markerColor || '#0ea5e9';

    return {
      labels,
      datasets: [
        {
          label: `Stage (m MSL)`,
          data: waterLevels,
          borderColor: sensorColor,
          backgroundColor: `${sensorColor}10`,
          borderWidth: 2.5,
          pointRadius: 2,
          pointBackgroundColor: sensorColor,
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Warning',
          data: Array(labels.length).fill(activeSensor?.dangerLevels.warning),
          borderColor: '#eab308',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Danger',
          data: Array(labels.length).fill(activeSensor?.dangerLevels.danger),
          borderColor: '#f97316',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        }
      ],
    };
  }, [activeData, activeSensor]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#64748b',
          font: { size: 10, weight: '600' },
          boxWidth: 8,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: { family: 'JetBrains Mono' },
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, family: 'JetBrains Mono' } }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 10, family: 'JetBrains Mono' } },
        suggestedMin: activeSensor ? activeSensor.dangerLevels.warning - 2 : 0,
      }
    }
  }), [activeSensor]);

  return (
    <div className="w-full h-full">
      {loading && activeData.length === 0 ? (
         <div className="h-full flex items-center justify-center text-slate-400">
            <span className="text-xs uppercase tracking-widest font-bold">Initializing Analytical Feed...</span>
         </div>
      ) : activeData.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="h-full flex items-center justify-center text-slate-300">
          <span className="text-xs uppercase tracking-widest font-bold">Awaiting Telemetry Data</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveDataChart);
