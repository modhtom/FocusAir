import { useState, useMemo } from "react";
import {
  X,
  BookOpen,
  User,
  Edit2,
  PieChart,
  Plane,
  BarChart3,
  Cloud,
  Globe,
  Stamp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2
} from "lucide-react";
import { GET_RANK } from "../utils/constants";

const LogbookView = ({ profile, logs, onUpdateProfile, onClose }) => {
  const [activeTab, setActiveTab] = useState("HISTORY");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const stats = useMemo(() => {
    const totalMiles = logs.reduce((acc, log) => acc + log.milesEarned, 0);
    const totalMinutes = logs.reduce((acc, log) => acc + log.durationFlown, 0);
    const categoryMap = {};
    const countries = new Set();
    
    logs.forEach(log => {
      if(!categoryMap[log.category]) categoryMap[log.category] = 0;
      categoryMap[log.category] += log.durationFlown;
      if(log.destinationCountry) countries.add(log.destinationCountry);
    });
    
    return {
        miles: Math.round(totalMiles),
        hours: (totalMinutes / 60).toFixed(1),
        count: logs.length,
        categories: categoryMap,
        visitedCountries: Array.from(countries)
    };
  }, [logs]);
  const currentRank = GET_RANK(parseFloat(stats.hours));
  const handleSaveProfile = () => {
    onUpdateProfile({ ...profile, name: tempName });
    setIsEditing(false);
  };
  const handleReset = () => {
    if(confirm("⚠ FACTORY RESET: This will delete all your flight history, profile data, and rank. Are you absolutely sure?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest">
            <BookOpen className="w-6 h-6" /> PILOT'S LOGBOOK
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <Plane className="w-64 h-64 text-slate-700 rotate-[-15deg]" />
          </div>
          <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-amber-500 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left z-10">
              <div className="flex items-center justify-center md:justify-start gap-3">
                {isEditing ? (
                  <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="bg-slate-800 text-2xl font-bold text-white px-2 rounded border border-amber-500 outline-none w-full md:w-auto" autoFocus />
                ) : (
                  <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                )}
                {isEditing ? (
                  <button onClick={handleSaveProfile} className="text-xs bg-amber-500 text-slate-900 px-2 py-1 rounded font-bold">SAVE</button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                )}
              </div>
              <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <span className="text-amber-500 font-mono font-bold uppercase text-sm tracking-widest">{currentRank}</span>
              </div>
              <p className="text-slate-400 text-sm">Member since {new Date(profile.joinedDate).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-4 z-10">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-white">{stats.hours}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Flight Hrs</div>
              </div>
              <div className="w-[1px] bg-slate-800 h-10"></div>
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-white">{stats.miles}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Miles</div>
              </div>
          </div>
        </div>

        <div className="flex gap-4 border-b border-slate-800 overflow-x-auto">
          <button onClick={() => setActiveTab("HISTORY")} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === "HISTORY" ? "border-amber-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>Flight History</button>
          <button onClick={() => setActiveTab("ANALYTICS")} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === "ANALYTICS" ? "border-amber-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>Analytics</button>
          <button onClick={() => setActiveTab("PASSPORT")} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === "PASSPORT" ? "border-amber-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>Passport</button>
          <div className="ml-auto"><button disabled className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-not-allowed px-3 py-1 bg-slate-900 rounded border border-slate-800 whitespace-nowrap"><Cloud className="w-3 h-3" /> CLOUD SYNC (PRO)</button></div>
        </div>

        <div className="min-h-[300px]">
          {activeTab === "HISTORY" && (
            <div className="space-y-3">
              {logs.length === 0 && <div className="text-center py-10 text-slate-500">No flights recorded yet. Time to take off!</div>}
              {[...logs].reverse().map((log) => (
                <div key={log.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${log.status === "LANDED" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {log.status === "LANDED" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg flex items-center gap-2">
                          {log.origin} <ArrowRight className="w-3 h-3 text-slate-500" /> {log.destination}
                          {log.segment && (
                            <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                              {log.isBreak ? `Break ${log.segment}` : `Segment ${log.segment}`}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {new Date(log.date).toLocaleDateString()} • {log.category}
                          {log.breakDuration > 0 && ` • Break: ${log.breakDuration}m`}
                        </div>
                        {log.goal && <div className="text-[10px] text-amber-500 mt-1 uppercase font-bold tracking-wider">Target: {log.goal}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono font-bold">+{Math.round(log.milesEarned)} mi</div>
                      <div className="text-xs text-slate-500">{log.durationFlown} min</div>
                    </div>
                  </div>
                  {log.segment === 1 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                      Multi-segment flight • {logs.filter(l =>
                        l.date === log.date &&
                        l.origin === log.origin &&
                        l.goal === log.goal
                      ).length} segments
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "ANALYTICS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><PieChart className="w-4 h-4"/> Activity Breakdown</h3>
                  <div className="space-y-3">
                      {Object.keys(stats.categories).map(cat => (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1"><span className="text-white">{cat}</span><span className="text-slate-400 font-mono">{stats.categories[cat]}m</span></div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{ width: `${(stats.categories[cat] / (stats.hours * 60)) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                      {Object.keys(stats.categories).length === 0 && <span className="text-slate-500 text-sm">No data available.</span>}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Career Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="text-2xl font-mono text-white">{stats.count}</div><div className="text-xs text-slate-500 uppercase">Total Flights</div></div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="text-2xl font-mono text-emerald-400">{(stats.miles / 24901).toFixed(2)}x</div><div className="text-xs text-slate-500 uppercase">Earth Orbits</div></div>
                  </div>
                </div>
            </div>
          )}

          {activeTab === "PASSPORT" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.visitedCountries.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No stamps yet.</p>
                            <p className="text-sm">Fly to new countries to fill your passport!</p>
                        </div>
                    ) : (
                        stats.visitedCountries.map((country) => (
                            <div key={country} className="aspect-square bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500 transition-colors p-2">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-500 to-transparent"></div>
                                <Stamp className="w-8 h-8 text-slate-600 mb-2 opacity-50 group-hover:text-amber-500 group-hover:opacity-100 transition-all" />
                                <div className="text-2xl font-black text-slate-400 uppercase tracking-widest font-mono" style={{ transform: `rotate(${Math.random() * 20 - 10}deg)` }}>
                                    {country}
                                </div>
                                <div className="text-[10px] text-slate-600 mt-2 font-mono">{new Date().getFullYear()}</div>
                            </div>
                        ))
                    )}
                </div>
        )}
        </div>
        <div className="pt-10 border-t border-slate-800 flex justify-center">
            <button onClick={handleReset} className="flex items-center gap-2 text-red-900 bg-red-950/20 hover:bg-red-950/50 border border-red-900/50 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all">
                <Trash2 className="w-4 h-4" /> Factory Reset App
            </button>
        </div>
      </div>
    </div>
  );
};

export default LogbookView;