import React, { useState, useEffect } from "react";
import { Plus, Trash2, Coffee, Clock, AlertCircle } from "lucide-react";

const BreakPlanner = ({totalDuration, onBreaksChange, availableBreakLocations,}) => {
  const [breakType, setBreakType] = useState("equal"); // "equal", "custom"
  const [numBreaks, setNumBreaks] = useState(1);
  const [customBreaks, setCustomBreaks] = useState([
    { id: 1, workDuration: 45, breakDuration: 15 }
  ]);

  useEffect(() => {
    if (breakType === "equal" && totalDuration > 0) {
      const workDuration = Math.floor(totalDuration / (numBreaks + 1));
      const breakDuration = 15;
      const newBreaks = Array.from({ length: numBreaks }, (_, i) => ({
        id: i + 1,
        workDuration,
        breakDuration,
        position: workDuration * (i + 1)
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomBreaks(newBreaks);
      onBreaksChange(newBreaks);
    }
  }, [numBreaks, breakType, totalDuration, onBreaksChange]);

  const addBreak = () => {
    const newBreak = {
      id: customBreaks.length + 1,
      workDuration: 45,
      breakDuration: 15,
      position: customBreaks.reduce((sum, b) => sum + b.workDuration + (b.breakDuration || 0), 0) + 45
    };
    const updatedBreaks = [...customBreaks, newBreak];
    setCustomBreaks(updatedBreaks);
    onBreaksChange(updatedBreaks);
  };

  const removeBreak = (id) => {
    const updatedBreaks = customBreaks.filter(b => b.id !== id);
    setCustomBreaks(updatedBreaks);
    onBreaksChange(updatedBreaks);
  };

  const updateBreak = (id, field, value) => {
    const updatedBreaks = customBreaks.map(b =>
      b.id === id ? { ...b, [field]: parseInt(value) || 0 } : b
    );
    setCustomBreaks(updatedBreaks);
    onBreaksChange(updatedBreaks);
  };

  const totalWorkTime = customBreaks.reduce((sum, b) => sum + b.workDuration, 0);
  const totalBreakTime = customBreaks.reduce((sum, b) => sum + b.breakDuration, 0);
  const totalTime = totalWorkTime + totalBreakTime;
  const isValid = totalTime <= totalDuration;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Clock className="w-4 h-4" />
        <span>Total Flight: {totalDuration} min</span>
        <span className="text-amber-500">•</span>
        <span>Work: {totalWorkTime} min</span>
        <span className="text-emerald-500">•</span>
        <span>Break: {totalBreakTime} min</span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setBreakType("equal")}
          className={`flex-1 py-2 rounded-lg border text-sm font-bold ${breakType === "equal" ? "bg-amber-500 text-slate-900 border-amber-500" : "border-slate-700 text-slate-400"}`}
        >
          Equal Parts
        </button>
        <button
          onClick={() => setBreakType("custom")}
          className={`flex-1 py-2 rounded-lg border text-sm font-bold ${breakType === "custom" ? "bg-amber-500 text-slate-900 border-amber-500" : "border-slate-700 text-slate-400"}`}
        >
          Custom
        </button>
      </div>

      {breakType === "equal" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-400">Number of breaks:</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setNumBreaks(num)}
                  className={`w-10 h-10 rounded-lg border text-sm font-bold ${numBreaks === num ? "bg-amber-500 text-slate-900 border-amber-500" : "border-slate-700 text-slate-400"}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-2">Schedule Preview:</div>
            <div className="space-y-2">
              {customBreaks.map((breakItem, index) => (
                <div key={breakItem.id} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white">Work: {breakItem.workDuration} min</div>
                    {availableBreakLocations[index] && (
                      <div className="text-xs text-emerald-400">
                        Break at: {availableBreakLocations[index].airport?.city} ({availableBreakLocations[index].airport?.iata})
                      </div>
                    )}
                  </div>
                  <div className="text-emerald-500 flex items-center gap-1">
                    <Coffee className="w-4 h-4" />
                    {breakItem.breakDuration} min
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm mt-4">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  {customBreaks.length + 1}
                </div>
                <div className="text-white">Final: {customBreaks[customBreaks.length - 1]?.workDuration || 45} min</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {customBreaks.map((breakItem, index) => (
              <div key={breakItem.id} className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-white font-bold">Segment {index + 1}</div>
                  {customBreaks.length > 1 && (
                    <button
                      onClick={() => removeBreak(breakItem.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Work Duration (min)</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={breakItem.workDuration}
                      onChange={(e) => updateBreak(breakItem.id, 'workDuration', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Break Duration (min)</label>
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={breakItem.breakDuration}
                      onChange={(e) => updateBreak(breakItem.id, 'breakDuration', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
                {availableBreakLocations[index] && (
                  <div className="mt-3 text-xs text-emerald-400">
                    Break airport: {availableBreakLocations[index].airport?.city} ({availableBreakLocations[index].airport?.iata})
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addBreak}
            className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Break
          </button>
        </div>
      )}

      {!isValid && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          Total time ({totalTime}min) exceeds flight duration ({totalDuration}min)
        </div>
      )}
    </div>
  );
};

export default BreakPlanner;