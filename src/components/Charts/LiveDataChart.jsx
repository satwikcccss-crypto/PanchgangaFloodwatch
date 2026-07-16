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

const LiveDataChart = ({ sensorId, data }) => {
  const activeSensor = SENSORS.find(s => s.id === sensorId);
  const activeData = data?.history || [];

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
    const sensorColor = activeSensor?.markerColor || '#0ea5e9'; // Default blue

    return {
      labels,
      datasets: [
        {
          label: `Stage (m MSL)`,
          data: waterLevels,
          borderColor: sensorColor,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, `${sensorColor}60`); // 37% opacity
            gradient.addColorStop(1, `${sensorColor}00`); // 0% opacity
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: sensorColor,
          pointHoverBorderWidth: 2,
          tension: 0.1, // Sharp lines, less curve
          fill: true,
        },
        {
          label: 'Warning',
          data: Array(labels.length).fill(activeSensor?.dangerLevels.warning),
          borderColor: '#eab308',
          borderWidth: 1.2,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Danger',
          data: Array(labels.length).fill(activeSensor?.dangerLevels.danger),
          borderColor: '#f97316',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Extreme',
          data: Array(labels.length).fill(activeSensor?.dangerLevels.extreme),
          borderColor: '#ef4444',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        }
      ],
    };
  }, [activeData, activeSensor]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Instant load, true analytical style
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#334155',
          font: { size: 11, family: 'JetBrains Mono', weight: '500' },
          boxWidth: 10,
          usePointStyle: false, // Square analytical legends
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f1f5f9',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 0, // Sharp corners
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        titleFont: { family: 'JetBrains Mono', size: 12, weight: 'normal' },
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(3) + ' m';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { 
          color: '#f1f5f9', // Very subtle solid lines
          drawBorder: true,
          borderColor: '#cbd5e1',
        },
        ticks: { color: '#64748b', font: { size: 10, family: 'JetBrains Mono' }, maxRotation: 0, maxTicksLimit: 8 }
      },
      y: {
        grid: { 
          color: '#f1f5f9',
          drawBorder: true,
          borderColor: '#cbd5e1',
        },
        ticks: { 
          color: '#64748b', 
          font: { size: 11, family: 'JetBrains Mono' },
          callback: function(value) {
            return value.toFixed(2) + 'm';
          }
        },
        suggestedMin: activeSensor ? activeSensor.dangerLevels.warning - 2 : 0,
      }
    }
  }), [activeSensor]);

  return (
    <div className="w-full h-full bg-white rounded-none p-5 border border-slate-300 relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-5 flex flex-col z-20 pointer-events-none">
        <h3 className="text-slate-800 font-mono font-bold text-sm tracking-wider uppercase">Real-Time Telemetry</h3>
        <span className="text-slate-500 font-mono text-xs">SENSOR: {activeSensor?.shortName.toUpperCase()} / UNIT: METERS (MSL)</span>
      </div>
      {!activeData || activeData.length === 0 ? (
         <div className="h-full flex flex-col items-center justify-center text-slate-400 relative z-10">
            <Clock className="w-6 h-6 mb-2 animate-spin-slow opacity-50" />
            <span className="text-xs uppercase tracking-widest font-mono">
              Awaiting Feed...
            </span>
         </div>
      ) : (
        <div className="relative z-10 w-full h-full mt-8">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveDataChart);
