import { useState } from "react";
import {
  Plane,
  MapIcon,
  Target,
  Maximize,
  Keyboard,
  Headphones,
  Rocket,
  Globe,
  Coffee
} from "lucide-react";

const FlightSchoolModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  if (!isOpen) return null;

  const slides = [
    { title: "Welcome Aboard", icon: Plane, content: "FocusAir is a productivity flight simulator. Plan your deep work sessions as real-world flights.", color: "text-emerald-400" },
    { title: "Flight Planning", icon: MapIcon, content: "Select a destination based on your focus time. Use 'Connecting Flights' for long sessions (Pomodoro style).", color: "text-amber-500" },
    { title: "Flight Planning", icon: MapIcon, content: "Select an Origin and Destination. Use the 'Shuffle' button for a random adventure, or search for specific cities.", color: "text-amber-500" },
    { title: "Flexible Sessions", icon: Coffee, content: "Use 'Custom Schedule' to set multiple work/break periods. Perfect for Pomodoro technique or custom study schedules.", color: "text-green-400" },
    { title: "The Mission", icon: Target, content: "Define your session goal (e.g., 'Coding', 'Reading') and add a specific objective to keep you on track.", color: "text-red-400" },
    { title: "The Cockpit", icon: Maximize, content: "Switch views or Pop Out the HUD. Use Spacebar to Pause, 'M' to Mute, and 'Esc' for Emergency Landing.", color: "text-blue-400" },
    { title: "Pro Controls",icon: Keyboard,content: "Master the flight deck with shortcuts: 'Space' to Pause, 'M' to Mute, 'P' for Pop-out mode, and 'Esc' for Emergency Landing.",color: "text-pink-400"},
    { title: "Immersion", icon: Headphones, content: "Block distractions with the Audio Mixer. Combine Brown Noise (Cabin) with Rain or Ocean sounds for focus.", color: "text-cyan-400" },
    { title: "Fleet & Layovers", icon: Rocket, content: "Spend miles in the Hangar to unlock faster jets like the Concorde. Faster planes earn miles quicker!", color: "text-cyan-400" },
    { title: "Career & Passport", icon: Globe, content: "Collect stamps for every new country you visit. Rank up from Cadet to Commander by earning miles.", color: "text-purple-400" }
  ];

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  const handleNext = () => {
    if (step < slides.length - 1) setStep(s => s + 1);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${((step + 1) / slides.length) * 100}%` }} />
        </div>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-6 border-2 border-slate-700 shadow-xl ${currentSlide.color}`}>
            <Icon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono uppercase tracking-wide">{currentSlide.title}</h2>
          <p className="text-slate-400 leading-relaxed mb-8 h-24 flex items-center justify-center">{currentSlide.content}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:text-white transition-colors">Skip</button>
            <button onClick={handleNext} className="flex-[2] py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-lg">
              {step === slides.length - 1 ? "Start Flying" : "Next"}
            </button>
          </div>
        </div>
        <div className="flex justify-center gap-2 pb-6">
          {slides.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-amber-500 w-4" : "bg-slate-700"}`} />)}
        </div>
      </div>
    </div>
  );
};

export default FlightSchoolModal;