import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import TerminatorLayer from '../TerminatorLayer';
import { interpolatePosition, calculateBearing } from '../../utils/calculations';

const MapUpdater = ({ center }) => {
  const map = useMap();
  const lastCenter = useRef(center);
  const lastUpdate = useRef(null);

  useEffect(() => {
    if (lastUpdate.current === null) {
      lastUpdate.current = Date.now();
    }
    const now = Date.now();
    const dist = Math.sqrt(Math.pow(center[0] - lastCenter.current[0], 2) + Math.pow(center[1] - lastCenter.current[1], 2));
    if (dist > 0.5 || (now - lastUpdate.current > 5000)) {
      map.panTo(center, { animate: true, duration: 1 });
      lastCenter.current = center;
      lastUpdate.current = now;
    }
  }, [center, map]);
  return null;
};

const MapView = ({ origin, destination, progress }) => {
  const currentPos = interpolatePosition(origin, destination, progress);
  const angle = calculateBearing(origin.lat, origin.lon, destination.lat, destination.lon);

  const planeIcon = L.divIcon({
    html: `
      <div style="transform: rotate(${angle}deg); transition: transform 0.5s linear; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5));">
        <svg viewBox="0 0 512 512" width="48" height="48" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
          <path d="M248 16 C238 16 230 24 230 34 L230 220 L96 260 C84 264 84 280 96 284 L230 324 L230 470 C230 488 282 488 282 470 L282 324 L416 284 C428 280 428 264 416 260 L282 220 L282 34 C282 24 274 16 264 16 Z"/>
          <path d="M64 256 L230 300 L230 340 L48 288 C32 284 32 268 48 264 Z"/>
          <path d="M448 256 L282 300 L282 340 L464 288 C480 284 480 268 464 264 Z"/>
          <path d="M210 420 L256 380 L302 420 L256 440 Z"/>
        </svg>
      </div>
    `,
    className: "bg-transparent",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  return (
    <div className="h-full w-full relative">
      <MapContainer center={currentPos} zoom={5} className="h-full w-full bg-slate-950" zoomControl={false} scrollWheelZoom={true} doubleClickZoom={true} dragging={true}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
        <TerminatorLayer />
        <Polyline positions={[[origin.lat, origin.lon], [destination.lat, destination.lon]]} color="#f59e0b" weight={3} opacity={0.8} dashArray="10, 10" />
        <Marker position={currentPos} icon={planeIcon} />
        <MapUpdater center={currentPos} />
      </MapContainer>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-[500]"></div>
    </div>
  );
};

export default MapView;