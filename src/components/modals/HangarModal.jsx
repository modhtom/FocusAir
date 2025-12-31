import {
  Rocket,
  X,
  Plane,
  ShoppingBag,
  CheckCircle2
} from "lucide-react";
import { PLANES } from "../../utils/constants";

const HangarModal = ({ isOpen, onClose, profile, onUpdateProfile }) => {
  if (!isOpen) return null;

  const buyPlane = (plane) => {
    if (profile.balance >= plane.cost) {
      if (confirm(`Purchase ${plane.name} for ${plane.cost} miles?`)) {
        onUpdateProfile({
          ...profile,
          balance: profile.balance - plane.cost,
          unlockedPlanes: [...profile.unlockedPlanes, plane.id]
        });
      }
    } else {
      alert("Insufficient funds! Fly more to earn miles.");
    }
  };

  const equipPlane = (planeId) => {
    onUpdateProfile({ ...profile, currentPlane: planeId });
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Rocket className="text-amber-500"/> THE HANGAR</h2>
          <div className="flex items-center gap-4">
              <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 font-mono text-emerald-400 font-bold">
                {Math.floor(profile.balance).toLocaleString()} MI
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
          {PLANES.map(plane => {
            const isUnlocked = profile.unlockedPlanes.includes(plane.id);
            const isEquipped = profile.currentPlane === plane.id;
            return (
              <div key={plane.id} className={`relative p-6 rounded-2xl border-2 transition-all ${isEquipped ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                  {isEquipped && <div className="absolute top-4 right-4 text-amber-500"><CheckCircle2/></div>}
                  <div className="h-32 flex items-center justify-center mb-4">
                    <Plane className={`w-20 h-20 ${isUnlocked ? 'text-white' : 'text-slate-600'}`} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{plane.name}</h3>
                  <div className="text-xs text-emerald-400 font-mono mb-4">{plane.speedMultiplier}x SPEED BOOST</div>
                  <p className="text-slate-400 text-sm mb-6 h-10">{plane.desc}</p>
                  
                  {isUnlocked ? (
                    <button
                      onClick={() => equipPlane(plane.id)}
                      disabled={isEquipped}
                      className={`w-full py-3 rounded-xl font-bold ${isEquipped ? 'bg-slate-700 text-slate-400 cursor-default' : 'bg-white text-slate-900 hover:bg-amber-500 hover:text-white'}`}
                    >
                      {isEquipped ? 'EQUIPPED' : 'EQUIP JET'}
                    </button>
                  ) : (
                    <button
                      onClick={() => buyPlane(plane)}
                      className="w-full py-3 rounded-xl font-bold bg-slate-700 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4"/> BUY {plane.cost.toLocaleString()}
                    </button>
                  )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default HangarModal;