import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import Terminator from 'leaflet-terminator';

const TerminatorLayer = () => {
  const map = useMap();
  useEffect(() => {
    try {
      const t = new Terminator();
      t.addTo(map);
      return () => { if (map) map.removeLayer(t); };
    } catch (e) { console.warn("Terminator layer failed:", e); }
  }, [map]);
  return null;
};

export default TerminatorLayer;