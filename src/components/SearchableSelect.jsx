import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Shuffle } from "lucide-react";
import CoachMark from "./CoachMark";

const SearchableSelect = ({ options, value, onChange, placeholder, disabled, label, showCoachMark, onRandom }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = useMemo(() => {
    if (!query) return options.slice(0, 50);
    const lowerQ = query.toLowerCase();
    return options.filter((opt) => opt.city?.toLowerCase().includes(lowerQ) || opt.iata?.toLowerCase().includes(lowerQ)).slice(0, 50);
  }, [options, query]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex justify-between items-center mb-1">
        {label && <label className="text-xs font-bold text-slate-500 uppercase block">{label}</label>}
        {showCoachMark && <span className="text-[10px] text-amber-500 font-bold animate-pulse">Start Here</span>}
      </div>
      <div className="flex gap-2">
        <div
            className={`relative flex-1 flex items-center bg-slate-800 border ${isOpen ? "border-amber-500 ring-1 ring-amber-500" : "border-slate-700"} rounded-xl p-3 cursor-pointer transition-all`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
        >
            {showCoachMark && <CoachMark />}
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
            type="text"
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500 disabled:cursor-not-allowed"
            placeholder={value ? `${value.city} (${value.iata})` : placeholder}
            value={isOpen ? query : value ? `${value.city} (${value.iata})` : ""}
            onChange={(e) => setQuery(e.target.value)}
            onClick={() => !isOpen && setIsOpen(true)}
            disabled={disabled}
            />
            {value && !isOpen && (
            <button onClick={(e) => { e.stopPropagation(); onChange(null); }} className="p-1 hover:bg-slate-700 rounded-full">
                <X className="w-4 h-4 text-slate-400" />
            </button>
            )}
        </div>
        {onRandom && (
            <button onClick={onRandom} className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-amber-500 hover:text-amber-500 transition-all text-slate-400" title="Random Airport">
                <Shuffle className="w-5 h-5" />
            </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl max-h-64 overflow-y-auto shadow-2xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.iata}
                className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800/50 flex justify-between items-center"
                onClick={() => { onChange(opt); setIsOpen(false); setQuery(""); }}
              >
                <div>
                  <div className="text-white font-medium">{opt.city}</div>
                  <div className="text-xs text-slate-500">{opt.name}</div>
                </div>
                <div className="bg-slate-800 px-2 py-1 rounded text-amber-500 font-mono font-bold text-xs">{opt.iata}</div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">No airports found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;