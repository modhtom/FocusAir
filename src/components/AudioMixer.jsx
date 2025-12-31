import { useState, useEffect, useRef } from "react";
import { Sliders, Volume2, VolumeX } from "lucide-react";
import { AUDIO_SOURCES, PLANES } from "../utils/constants";

const AudioMixer = ({ isOpen, isPaused, isMuted, currentPlane}) => {
  const [volumes, setVolumes] = useState({ cabin: 0.025, rain: 0, ocean: 0, cafe: 0 });
  const [playing, setPlaying] = useState({ cabin: true, rain: false, ocean: false, cafe: false });
  const [audioBlocked, setAudioBlocked] = useState(false);
  const refs = useRef({});

  useEffect(() => {
    const planeData = PLANES.find(p => p.id === currentPlane) || PLANES[0];
    const sources = { ...AUDIO_SOURCES, cabin: planeData.sound };

    Object.keys(sources).forEach(key => {
        if (refs.current[key]) {
            if (key === 'cabin' && refs.current[key].src !== sources[key]) {
                refs.current[key].src = sources[key];
            }
        } else {
            const audio = new Audio(sources[key]);
            audio.loop = true;
            refs.current[key] = audio;
        }
    });
  }, [currentPlane]);

  useEffect(() => {
    Object.keys(AUDIO_SOURCES).forEach(key => {
      const audio = refs.current[key];
      if(!audio) return;
      
      if (isMuted) {
        audio.volume = 0;
      } else {
        audio.volume = isPaused ? volumes[key] * 0.1 : volumes[key];
      }

      if(playing[key]) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name === 'NotAllowedError') setAudioBlocked(true);
          });
        }
      } else {
        audio.pause();
      }
    });
  }, [volumes, playing, isPaused, isMuted]);

  useEffect(() => {
    return () => {
      Object.keys(refs.current).forEach(key => {
        const audio = refs.current[key];
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const enableAudio = () => {
    setAudioBlocked(false);
    Object.keys(playing).forEach(key => {
      if (playing[key]) {
        const audio = refs.current[key];
        audio.play().catch(e => console.warn("Still blocked", e));
      }
    });
  };

  return (
    <>
      {audioBlocked && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2000] animate-in fade-in zoom-in duration-300">
          <button onClick={enableAudio} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-2 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse flex items-center gap-2 border-2 border-white/20">
            <Volume2 className="w-5 h-5" /> TAP TO ENABLE AUDIO
          </button>
        </div>
      )}
      <div className={`absolute top-24 right-6 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-2xl transition-all duration-300 z-[2000] ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-2 mb-4 text-amber-500 border-b border-slate-800 pb-2">
          <Sliders className="w-4 h-4" /> <span className="text-sm font-bold uppercase tracking-widest">Cabin Mixer</span>
          {isMuted && <span className="text-[10px] bg-red-500/20 text-red-400 px-1 rounded ml-auto">MUTED</span>}
        </div>
        <div className="space-y-4">
          {Object.keys(AUDIO_SOURCES).map(key => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center">
                <button onClick={() => setPlaying(p => ({...p, [key]: !p[key]}))} className={`text-xs font-bold uppercase flex items-center gap-2 ${playing[key] ? 'text-white' : 'text-slate-500'}`}>
                  {playing[key] ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3" />} {key}
                </button>
                <span className="text-[10px] font-mono text-slate-500">{Math.round(volumes[key]*100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={volumes[key]} onChange={(e) => setVolumes(v => ({...v, [key]: parseFloat(e.target.value)}))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AudioMixer;