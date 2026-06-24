import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { SENSORS } from '../../config/sensors';
import { MAP_CONFIG } from '../../config/mapConfig';
import { getAlertConfig } from '../../config/alerts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

// Custom SVG sensor marker icon (inline SVG for Leaflet compatibility)
const createMarkerIcon = (isSelected, color, alertLevel) => {
  const size = isSelected ? 52 : 38;
  const shadow = isSelected ? `filter: drop-shadow(0 0 8px ${color}aa);` : '';
  const badge = alertLevel !== 'normal'
    ? `<div style="position:absolute;top:-5px;right:-5px;width:13px;height:13px;border-radius:50%;background:${color};border:2px solid white;font-size:8px;font-weight:900;color:white;display:flex;align-items:center;justify-content:center;line-height:1;">!</div>`
    : '';
  const pulse = isSelected
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:3px solid ${color}66;animation:pulse-ring 1.5s ease-out infinite;pointer-events:none;"></div>`
    : '';

  return L.divIcon({
    className: 'custom-sensor-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <svg style="${shadow}" width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="${color}">
          <path d="M624.64 204.8l0.04096 98.38592c17.2032-11.264 32.3584-16.50688 53.57568-16.50688 25.3952 0 43.54048 7.3728 64.9216 22.1184l9.74848 6.92224 5.07904 3.39968c8.02816 5.16096 13.96736 7.70048 21.99552 9.33888 16.42496 3.2768 37.6832-4.05504 64.75776-25.8048l51.28192 63.8976c-44.35968 35.6352-88.71936 50.91328-132.17792 42.1888-22.44608-4.5056-38.58432-12.45184-57.83552-25.84576l-9.50272-6.71744c-8.92928-6.144-12.36992-7.5776-18.26816-7.5776-4.096 0-7.33184 1.59744-18.2272 9.99424l-2.62144 1.96608c-11.96032 9.25696-22.24128 16.09728-32.768 20.84864l0.04096 65.61792c17.2032-11.264 32.3584-16.50688 53.57568-16.50688 25.3952 0 43.54048 7.3728 64.9216 22.1184l9.74848 6.92224 5.07904 3.39968c8.02816 5.16096 13.96736 7.70048 21.99552 9.33888 16.42496 3.2768 37.6832-4.05504 64.75776-25.8048l51.28192 63.8976c-44.35968 35.6352-88.71936 50.91328-132.17792 42.1888-22.44608-4.5056-38.58432-12.45184-57.83552-25.84576l-9.50272-6.71744c-8.92928-6.144-12.36992-7.5776-18.26816-7.5776-4.096 0-7.33184 1.59744-18.2272 9.99424l-2.62144 1.96608c-11.96032 9.25696-22.24128 16.09728-32.768 20.84864l0.04096 65.61792c17.2032-11.264 32.3584-16.50688 53.57568-16.50688 25.3952 0 43.54048 7.3728 64.9216 22.1184l9.74848 6.92224 5.07904 3.39968c8.02816 5.16096 13.96736 7.70048 21.99552 9.33888 16.42496 3.2768 37.6832-4.05504 64.75776-25.8048l51.28192 63.8976c-44.35968 35.6352-88.71936 50.91328-132.17792 42.1888-22.44608-4.5056-38.58432-12.45184-57.83552-25.84576l-9.50272-6.71744c-8.92928-6.144-12.36992-7.5776-18.26816-7.5776-4.096 0-7.33184 1.59744-18.2272 9.99424l-2.62144 1.96608c-11.96032 9.25696-22.24128 16.09728-32.768 20.84864V778.24h-245.76v-44.89216a92.20096 92.20096 0 0 1-27.97568 3.93216c-25.3952 0-43.54048-7.33184-64.9216-22.1184l-9.74848-6.92224-5.07904-3.39968a58.5728 58.5728 0 0 0-21.99552-9.33888c-16.42496-3.2768-37.6832 4.096-64.75776 25.8048L133.12 657.408c44.35968-35.6352 88.71936-50.91328 132.13696-42.1888 22.48704 4.5056 38.62528 12.45184 57.87648 25.84576l9.50272 6.71744c8.92928 6.18496 12.32896 7.5776 18.26816 7.5776 4.096 0 7.29088-1.55648 18.2272-9.95328l2.58048-2.048c2.4576-1.8432 4.87424-3.6864 7.20896-5.3248v-68.52608a92.20096 92.20096 0 0 1-28.01664 3.93216c-25.3952 0-43.54048-7.33184-64.9216-22.1184l-9.74848-6.92224-5.07904-3.39968a58.5728 58.5728 0 0 0-21.99552-9.33888c-16.42496-3.2768-37.6832 4.096-64.75776 25.8048L133.12 493.568c44.35968-35.6352 88.71936-50.91328 132.13696-42.1888 22.48704 4.5056 38.62528 12.45184 57.87648 25.84576l9.50272 6.71744c8.92928 6.18496 12.32896 7.5776 18.26816 7.5776 4.096 0 7.29088-1.55648 18.2272-9.95328l2.58048-2.048c2.4576-1.8432 4.87424-3.6864 7.20896-5.3248V405.62688a92.20096 92.20096 0 0 1-28.01664 3.93216c-25.3952 0-43.54048-7.33184-64.9216-22.1184l-9.74848-6.92224-5.07904-3.39968a58.5728 58.5728 0 0 0-21.99552-9.33888c-16.42496-3.2768-37.6832 4.096-64.75776 25.8048L133.12 329.728c44.35968-35.6352 88.71936-50.91328 132.13696-42.1888 22.48704 4.5056 38.62528 12.45184 57.87648 25.84576l9.50272 6.71744c8.92928 6.18496 12.32896 7.5776 18.26816 7.5776 4.096 0 7.29088-1.55648 18.2272-9.95328l2.58048-2.048c2.4576-1.8432 4.87424-3.6864 7.20896-5.3248L378.88 204.8h245.76z m-81.92 81.92h-81.92v40.96h40.96v81.92h-40.96v40.96h40.96v81.92h-40.96v40.96h40.96v81.92h-40.96v40.96h81.92V286.72z"/>
        </svg>
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
