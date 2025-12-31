import { useState, useEffect, useRef } from "react";
import {
  Pause,
  Play,
  MapIcon,
  ImageIcon,
  Maximize,
  Sliders,
  AlertTriangle,
  Plane,
  VolumeX,
  Users
} from "lucide-react";
import AudioMixer from "../AudioMixer";
import MapView from "./MapView";
import WindowView from "./WindowView";
import { speakPilot } from "../../utils/helpers";

const FlyingMode = ({ origin, destination, duration, missionGoal, squadCode, currentPlaneId, onFinish, segmentInfo }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState("MAP");
  const [pilotVoice] = useState(true);
  const [audioPanelOpen, setAudioPanelOpen] = useState(false);
  const pipWindowRef = useRef(null);
  const { currentSegment, totalSegments, isBreak } = segmentInfo || {};

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const togglePiP = async () => {
    if (!window.documentPictureInPicture) {
      alert("Picture-in-Picture not supported on this browser.");
      return;
    }
    try {
      if(pipWindowRef.current) {
          pipWindowRef.current.close();
          return;
      }
      const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 250, height: 120 });
      pipWindowRef.current = pipWindow;

      const style = document.createElement("style");
      style.textContent = `
        body { background: #0f172a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; height: 100vh; margin: 0; }
        h1 { font-size: 48px; margin: 0; }
        p { color: #10b981; margin: 0; font-weight: bold; letter-spacing: 2px; }
      `;
      pipWindow.document.head.appendChild(style);
      
      pipWindow.document.body.innerHTML = `
        <h1>${fmt(timeLeft)}</h1>
        <p>${paused ? "HOLDING" : "FLYING"}</p>
      `;

      pipWindow.addEventListener("pagehide", () => {
          pipWindowRef.current = null;
      });
    } catch(e) { console.error(e); }
  };
  const handleEmergencyLanding = () => {
    if (confirm("Requesting Emergency Landing? This will end your session early.")) {
      const totalSecs = duration * 60;
      const elapsedSecs = totalSecs - timeLeft;
      const elapsedMins = Math.floor(elapsedSecs / 60);
      const actualMinutes = Math.max(0, elapsedMins);
      if (pilotVoice) {
        speakPilot("Emergency landing initiated. Session terminated.");
      }
      
      onFinish(actualMinutes, false);
    }
  };

  useEffect(() => {
    if (!pilotVoice || paused) return;
    const totalSecs = duration * 60;
    const elapsed = totalSecs - timeLeft;
    if (elapsed === 2) {
        speakPilot("Cabin crew, arm doors and cross check. Focus mode engaged. Good luck.");
    }
    if (Math.abs(timeLeft - (totalSecs / 2)) < 1) {
        speakPilot("Cruising altitude reached. You are doing great. Stay focused.");
    }
    if (timeLeft === 600 && totalSecs > 600) {
        speakPilot("We are beginning our descent. 10 minutes remaining. Wrap up your final tasks.");
    }
  }, [timeLeft, duration, pilotVoice, paused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                setPaused(p => !p);
                break;
            case 'KeyM':
                setMuted(m => !m);
                break;
            case 'KeyP':
                togglePiP();
                break;
            case 'Escape':
                handleEmergencyLanding();
                break;
            default: break;
        }
    };
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (paused || timeLeft <= 0) {
      if (timeLeft <= 0) onFinish(duration, true);
      if(pipWindowRef.current) {
        const doc = pipWindowRef.current.document;
        if(doc) {
            const h1 = doc.querySelector('h1');
            const p = doc.querySelector('p');
            if(h1) h1.textContent = fmt(timeLeft);
            if(p) {
                p.textContent = paused ? "HOLDING" : "FLYING";
                p.style.color = paused ? "#f59e0b" : "#10b981";
            }
        }
      }
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        const totalSecs = duration * 60;
        const elapsed = totalSecs - next;
        setProgress(elapsed / totalSecs);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, timeLeft, duration, onFinish]);

  useEffect(() => {
    if(pipWindowRef.current) {
        const doc = pipWindowRef.current.document;
        if(doc) {
            const h1 = doc.querySelector('h1');
            if(h1) h1.textContent = fmt(timeLeft);
        }
    }
  }, [timeLeft]);

  useEffect(() => {
    if (paused || timeLeft <= 0) {
      if (timeLeft <= 0) {
        onFinish(duration, true);
      }
      
      if(pipWindowRef.current) {
        const doc = pipWindowRef.current.document;
        if(doc) {
            const h1 = doc.querySelector('h1');
            const p = doc.querySelector('p');
            if(h1) h1.textContent = fmt(Math.max(0, timeLeft));
            if(p) {
                p.textContent = paused ? "HOLDING" : "FLYING";
                p.style.color = paused ? "#f59e0b" : "#10b981";
            }
        }
      }
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(id);
          return 0;
        }
        const totalSecs = duration * 60;
        const elapsed = totalSecs - next;
        setProgress(elapsed / totalSecs);
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [paused, timeLeft, duration, onFinish]);

  return (
    <div className="fixed inset-0 bg-black z-50 font-sans">
      <div className="absolute inset-0 z-0">
        {mode === "MAP" ? <MapView origin={origin} destination={destination} progress={progress} /> : <WindowView />}
      </div>
      {muted && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg pointer-events-none z-50 flex items-center gap-2">
              <VolumeX className="w-3 h-3" /> AUDIO MUTED
          </div>
      )}
      {paused && (
        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900/90 border-2 border-amber-500 p-8 rounded-2xl text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-pulse">
            <Pause className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-mono font-bold text-amber-500 tracking-widest mb-2">HOLDING PATTERN</h2>
            <p className="text-slate-400 font-mono text-sm">FLIGHT PAUSED - MAINTAINING ALTITUDE</p>
          </div>
        </div>
      )}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-50">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl text-white pointer-events-auto shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-mono font-bold">{origin.iata}</span>
              <Plane className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-mono font-bold text-amber-500">{destination.iata}</span>
            </div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                FL 2916 • {Math.round(progress * 100)}% COMPLETE
                {segmentInfo && (
                  <span className="ml-2 text-amber-500">
                    SEG {currentSegment}/{totalSegments} {isBreak ? "(BREAK)" : "(WORK)"}
                  </span>
                )}
              </div>
            {missionGoal && <div className="mt-2 text-xs font-bold text-amber-500 uppercase tracking-wider bg-black/20 px-2 py-1 rounded">Obj: {missionGoal}</div>}
            {squadCode && (
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/30">
                    <Users className="w-3 h-3" /> SQUAD: {squadCode}
                </div>
            )}
        </div>
        <div className="pointer-events-auto flex flex-col items-center gap-4">
            <div className={`bg-slate-900/80 backdrop-blur-xl border ${paused ? "border-amber-500" : "border-slate-700"} px-10 py-4 rounded-2xl flex flex-col items-center shadow-2xl transition-all`}>
                <div className="text-5xl font-mono font-bold text-white tracking-widest tabular-nums">{fmt(timeLeft)}</div>
                <div className={`text-xs font-bold uppercase tracking-[0.2em] mt-1 ${paused ? "text-amber-500 animate-pulse" : "text-slate-500"}`}>{paused ? "HOLDING" : "TIME REMAINING"}</div>
            </div>
            <button onClick={() => setPaused(!paused)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-all border border-slate-600 hover:border-amber-500 shadow-lg">
              {paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />} {paused ? "RESUME COURSE" : "PAUSE FLIGHT"}
            </button>
        </div>
        <div className="pointer-events-auto flex flex-col gap-2 items-end">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-1 rounded-xl flex shadow-xl">
              <button onClick={() => setMode("MAP")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === "MAP" ? "bg-amber-500 text-slate-900" : "text-slate-300 hover:bg-slate-800"}`}><MapIcon className="w-4 h-4" /> Map</button>
              <button onClick={() => setMode("WINDOW")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === "WINDOW" ? "bg-amber-500 text-slate-900" : "text-slate-300 hover:bg-slate-800"}`}><ImageIcon className="w-4 h-4" /> Win</button>
            </div>
            <div className="flex gap-2">
              <button onClick={togglePiP} className="p-3 rounded-xl border bg-slate-900/80 text-white border-slate-700/50 hover:bg-slate-800 transition-all shadow-lg" title="Pop Out"><Maximize className="w-5 h-5" /></button>
              <button onClick={() => setAudioPanelOpen(!audioPanelOpen)} className={`p-3 rounded-xl border transition-all shadow-lg ${audioPanelOpen ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-slate-900/80 text-white border-slate-700/50 hover:bg-slate-800"}`}><Sliders className="w-5 h-5" /></button>
            </div>
              <AudioMixer
                isOpen={audioPanelOpen}
                isPaused={paused}
                isMuted={muted}
                currentPlane={currentPlaneId}
                onClose={() => setAudioPanelOpen(false)}
              />
            </div>
      </div>

      <div className="absolute bottom-10 w-full flex justify-center pointer-events-none z-50">
        <button onClick={handleEmergencyLanding} className="pointer-events-auto group flex items-center gap-3 bg-red-950/80 hover:bg-red-900 border border-red-500/30 hover:border-red-500 backdrop-blur-md px-8 py-4 rounded-full text-red-100 font-bold transition-all shadow-2xl">
          <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" /> EMERGENCY LANDING
        </button>
      </div>
    </div>
  );
};

export default FlyingMode;