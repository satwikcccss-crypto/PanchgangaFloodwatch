import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { SENSORS } from '../../config/sensors';
import { MAP_CONFIG } from '../../config/mapConfig';
import { getAlertConfig } from '../../config/alerts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

// Custom SVG sensor marker icon
const createMarkerIcon = (isSelected, color, alertLevel) => {
  const size = isSelected ? 52 : 38;
  const glow = isSelected ? `filter: drop-shadow(0 0 10px ${color}bb);` : '';
  const badge = alertLevel !== 'normal'
    ? `<div style="position:absolute;top:-5px;right:-5px;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;color:white;line-height:1;">!</div>`
    : '';
  const pulse = isSelected
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:3px solid ${color}88;animation:pulse-ring 1.5s ease-out infinite;"></div>`
    : '';

  return L.divIcon({
    className: 'custom-sensor-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="position:absolute;inset:0;background:${color};${glow};mask:url(/PanchgangaFloodwatch/water-level-sensor-2.svg) center/contain no-repeat;-webkit-mask:url(/PanchgangaFloodwatch/water-level-sensor-2.svg) center/contain no-repeat;"></div>
        ${badge}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    tooltipAnchor: [0, -size],
  });
};

const FlyToSensor = ({ selectedSensorId }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedSensorId) {
      const sensor = SENSORS.find(s => s.id === selectedSensorId);
      if (sensor) map.flyTo([sensor.location.lat, sensor.location.lng], 13, { duration: 1.5 });
    }
  }, [selectedSensorId, map]);
  return null;
};

const InteractiveMap = ({ sensorData, selectedSensor, onSensorClick }) => {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        zoomControl={false}
        className="h-full w-full z-10 grayscale-[0.2] contrast-[1.1]"
      >
        <LayersControl position="topright">
          {Object.entries(MAP_CONFIG.mapLayers).map(([key, layer], index) => (
            <BaseLayer 
              key={key} 
              checked={index === 0} 
              name={layer.name}
            >
              <TileLayer
                url={layer.url}
                attribution={layer.attribution}
                subdomains={layer.subdomains || ['a', 'b', 'c']}
                maxZoom={18}
              />
            </BaseLayer>
          ))}
        </LayersControl>

        <FlyToSensor selectedSensorId={selectedSensor} />

        {SENSORS.map((sensor) => {
          const data = sensorData?.[sensor.id];
          const alertLevel = data?.alertLevel || 'normal';
          const alertConfig = getAlertConfig(alertLevel);
          const isSelected = selectedSensor === sensor.id;

          return (
            <Marker
              key={sensor.id}
              position={[sensor.location.lat, sensor.location.lng]}
              icon={createMarkerIcon(isSelected, alertConfig.color, alertLevel)}
              eventHandlers={{
                click: () => onSensorClick?.(sensor.id),
              }}
            >
              <Tooltip 
                direction="top" 
                offset={[0, -20]} 
                opacity={1} 
                className="custom-map-tooltip"
              >
                <div className="tooltip-plate min-w-[140px]">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-tight">
                        {sensor.name}
                      </h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">RWL-{sensor.id.toUpperCase()} • {sensor.river}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-800 tabular-nums">
                      {data?.waterLevel?.toFixed(2) || '--'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">m MSL</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${alertConfig.color === '#10b981' ? 'text-emerald-500' : 'text-amber-500'}`}>
                       {data?.rateOfChange > 0 ? 'RISING' : 'STABLE'}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: alertConfig.color }} />
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default React.memo(InteractiveMap);
