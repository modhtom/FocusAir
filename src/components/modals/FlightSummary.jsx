import { Plane, Share2, Home } from "lucide-react";

const FlightSummary = ({ type, minutes, miles, flightData, onHome }) => {
    const isCompleted = type === 'COMPLETED';
    const handleShare = async () => {
        const text = `I just flew ${Math.round(miles)} miles from ${flightData.origin} to ${flightData.destination} on FocusAir(fa.modhtom.com) while focusing on "${flightData.goal || 'Deep Work'}". #productivity #focusair`;
            navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 animate-in zoom-in duration-500">
        <div className="max-w-sm w-full bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className={`p-6 text-center border-b-4 border-dashed border-slate-200 ${isCompleted ? 'bg-amber-500' : 'bg-red-500'}`}>
                <div className="text-xs font-bold tracking-[0.3em] uppercase text-slate-900/50 mb-2">BOARDING PASS</div>
                <h2 className="text-3xl font-black uppercase italic">{isCompleted ? "MISSION ACCOMPLISHED" : "FLIGHT DIVERTED"}</h2>
            </div>

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="text-center">
                        <div className="text-4xl font-mono font-bold">{flightData.origin}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Origin</div>
                    </div>
                    <Plane className="w-6 h-6 text-slate-300" />
                    <div className="text-center">
                        <div className="text-4xl font-mono font-bold">{flightData.destination}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Dest</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-dashed border-slate-200 py-4">
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Focus Time</div>
                        <div className="text-xl font-bold">{minutes}m</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Miles Earned</div>
                        <div className="text-xl font-bold">+{Math.floor(miles)}</div>
                    </div>
                    <div className="col-span-2">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Mission Goal</div>
                        <div className="text-lg font-mono truncate">{flightData.goal || "Work"}</div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleShare} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button onClick={onHome} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Home className="w-4 h-4" /> Return
                    </button>
                </div>
            </div>

            <div className="absolute top-28 -left-3 w-6 h-6 bg-slate-950 rounded-full"></div>
            <div className="absolute top-28 -right-3 w-6 h-6 bg-slate-950 rounded-full"></div>
        </div>
        </div>
    )
}

export default FlightSummary;