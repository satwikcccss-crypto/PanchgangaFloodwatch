import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BasinAnalyticsChart = ({ history, dangerLevels, markerColor = '#0f4c81' }) => {
  const chartData = useMemo(() => {
    if (!history || history.length < 2) return { labels: [], datasets: [] };

    // Format labels (Time)
    const labels = history.map(h => {
      const date = new Date(h.timestamp);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    });

    // Extract water levels
    const waterLevels = history.map(h => h.waterLevel);
    
    // Calculate Rate of Change (m/hr) - simplified assuming ~10min intervals (6 pts/hr)
    const rateOfChange = history.map((h, i) => {
      if (i === 0) return 0;
      const delta = h.waterLevel - history[i-1].waterLevel;
      return (delta * 6).toFixed(3); // Rough conversion to m/hr
    });

    return {
      labels,
      datasets: [
        {
          label: 'Stage (m MSL)',
          data: waterLevels,
          borderColor: markerColor,
          backgroundColor: `${markerColor}20`,
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Warning',
          data: Array(labels.length).fill(dangerLevels?.warning),
          borderColor: '#eab308',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Danger',
          data: Array(labels.length).fill(dangerLevels?.danger),
          borderColor: '#f97316',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Extreme',
          data: Array(labels.length).fill(dangerLevels?.extreme),
          borderColor: '#ef4444',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        }
      ]
    };
  }, [history, markerColor]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
          color: '#64748b',
          font: { size: 10, weight: '700' },
          boxWidth: 12,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        callbacks: {
            label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                    label += context.parsed.y + (context.datasetIndex === 0 ? ' m' : ' m/hr');
                }
                return label;
            }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 9, family: 'JetBrains Mono' }, maxRotation: 0 }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { size: 9, family: 'JetBrains Mono' } }
      }
    }
  };

  return <Chart type="line" data={chartData} options={options} />;
};

export default BasinAnalyticsChart;
