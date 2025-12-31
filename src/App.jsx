import { useState, useEffect, useMemo } from "react";
import {
  Plane,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Briefcase,
  User,
  QrCode,
  X,
  BookOpen,
  HelpCircle,
  Rocket,
  Coffee,
} from "lucide-react";
import FlightSchoolModal from "./components/modals/FlightSchoolModal";
import HangarModal from "./components/modals/HangarModal";
import SearchableSelect from "./components/SearchableSelect";
import LogbookView from "./components/LogbookView";
import FlyingMode from "./components/flight/FlyingMode";
import FlightSummary from "./components/modals/FlightSummary";
import {PLANES, CHECKLIST_ITEMS, PLANE_SPEED_MPH, ROWS_TOTAL} from "./utils/constants";
import { calculateDistance } from "./utils/calculations";
import BreakPlanner from "./components/BreakPlanner";

export default function FocusAir() {
  const [view, setView] = useState("WIZARD");
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('fa_profile');
    return saved ? JSON.parse(saved) : {
        name: "Pilot",
        joinedDate: new Date().toISOString(),
        balance: 0,
        unlockedPlanes: ['cessna'],
        currentPlane: 'cessna'
    };
  });
  
  const [flightLog, setFlightLog] = useState(() => {
    const saved = localStorage.getItem('fa_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [showTutorial, setShowTutorial] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [showHangar, setShowHangar] = useState(false);

  useEffect(() => { localStorage.setItem('fa_profile', JSON.stringify(profile)) }, [profile]);
  useEffect(() => { localStorage.setItem('fa_logs', JSON.stringify(flightLog)) }, [flightLog]);
  useEffect(() => {
    const onboarded = localStorage.getItem('focusAir_hasOnboarded');
    if (!onboarded) setShowTutorial(true);
    else setHasOnboarded(true);
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('focusAir_hasOnboarded', 'true');
    setHasOnboarded(true);
    setShowTutorial(false);
  };

  const [step, setStep] = useState(1);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startAirport, setStartAirport] = useState(null);
  const [manualDest, setManualDest] = useState(null);
  const [duration, setDuration] = useState(60);
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [scenario, setScenario] = useState("Work");
  const [customTag, setCustomTag] = useState("");
  const [missionGoal, setMissionGoal] = useState("");
  const [scenariosList, setScenariosList] = useState(["Work", "Study", "Coding", "Reading", "Meeting"]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [flightResult, setFlightResult] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [breakLocations, setBreakLocations] = useState([]);
  const [isMultiSegment, setIsMultiSegment] = useState(false);

  let [checklist, setChecklist] = useState({
      0: false, //DND
      1: false, //Water
      2: false  //Goal
  });
  
  let isChecklistComplete = Object.values(checklist).every(v => v);
  const [squadCode, setSquadCode] = useState("");
  const [isJoiningSquad, setIsJoiningSquad] = useState(false);
  const [squadConnected, setSquadConnected] = useState(false);

  const occupiedSeats = useMemo(() => {
    const occupied = new Set();
    const cols = ["A", "B", "C", "D", "E", "F"];
    for (let r = 1; r <= ROWS_TOTAL; r++) {
      cols.forEach((c) => { if (Math.random() > 0.55) occupied.add(`${r}${c}`); });
    }
    return occupied;
  }, []);

  useEffect(() => {
    const fetchAirports = async () => {
      const cached = localStorage.getItem("fa_airports_cache");
      if (cached) {
        setAirports(JSON.parse(cached));
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("https://raw.githubusercontent.com/mwgg/Airports/master/airports.json");
        const data = await res.json();
        const valid = Object.values(data).filter((ap) => ap.iata && ap.lat && ap.lon);
        setAirports(valid);
        setLoading(false);
        localStorage.setItem("fa_airports_cache", JSON.stringify(valid));
      } catch (e) { console.error(e); }
    };
    fetchAirports();
  }, []);

  const handleRandomOrigin = () => {
    if (airports.length > 0) {
        const random = airports[Math.floor(Math.random() * airports.length)];
        setStartAirport(random);
    }
  };

  const handleJoinSquad = (e) => {
      e.preventDefault();
      setIsJoiningSquad(true);
      setTimeout(() => {
          setIsJoiningSquad(false);
          setSquadConnected(true);
      }, 1500);
  };

  useEffect(() => {
    if (!startAirport || !airports.length) {
      setSuggestedRoutes([]);
      setBreakLocations([]);
      return;
    }
    
    if (manualDest) {
      const dist = calculateDistance(startAirport.lat, startAirport.lon, manualDest.lat, manualDest.lon);
      const calculatedDuration = Math.round((dist / PLANE_SPEED_MPH) * 60);
      setDuration(calculatedDuration);
      setSuggestedRoutes([]);
      setSelectedRoute({ airport: manualDest, dist: dist, diff: 0, accuracy: 100 });
      
      if (isMultiSegment && breaks.length > 0) {
        findBreakLocations(startAirport, manualDest, breaks);
      } else {
        setBreakLocations([]);
      }
      return;
    }
    
    const plane = PLANES.find(p => p.id === profile.currentPlane) || PLANES[0];
    const adjustedSpeed = PLANE_SPEED_MPH * plane.speedMultiplier;
    if (isMultiSegment && breaks.length > 0) {
      findMultiSegmentRoute(startAirport, duration, breaks, adjustedSpeed);
    } else {
      const targetDist = (duration / 60) * adjustedSpeed;
      const maxMargin = targetDist * 0.5;
      let candidates = airports
        .filter((ap) => ap.iata !== startAirport.iata)
        .map((ap) => {
          const dist = calculateDistance(startAirport.lat, startAirport.lon, ap.lat, ap.lon);
          return {
            airport: ap,
            dist,
            diff: Math.abs(dist - targetDist),
            accuracy: Math.max(0, 100 - (Math.abs(dist - targetDist) / targetDist) * 100)
          };
        })
        .filter((c) => c.diff <= maxMargin)
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 20);
      
      setSuggestedRoutes(candidates);
      setBreakLocations([]);
    }
  }, [startAirport, duration, manualDest, airports, profile.currentPlane, isMultiSegment, breaks]);

  const findBreakLocations = async (origin, finalDest, breaksConfig) => {
    if (!origin || !finalDest || !breaksConfig.length) return;
    
    const totalDist = calculateDistance(origin.lat, origin.lon, finalDest.lat, finalDest.lon);
    const totalWorkTime = breaksConfig.reduce((sum, b) => sum + b.workDuration, 0);
    
    const breakLocationsFound = [];
    let cumulativeDist = 0;
    
    for (let i = 0; i < breaksConfig.length; i++) {
      const breakConfig = breaksConfig[i];
      const segmentRatio = breakConfig.workDuration / totalWorkTime;
      const targetDist = cumulativeDist + (totalDist * segmentRatio);
      const nearest = findNearestAirportAlongRoute(origin, finalDest, targetDist);
      if (nearest) {
        breakLocationsFound.push({
          airport: nearest,
          distanceFromOrigin: targetDist,
          segment: i + 1,
          breakDuration: breakConfig.breakDuration
        });
      }
      cumulativeDist += totalDist * segmentRatio;
    }
    
    setBreakLocations(breakLocationsFound);
  };

  const findMultiSegmentRoute = (origin, totalDuration, breaksConfig, speed) => {
    const totalWorkTime = breaksConfig.reduce((sum, b) => sum + b.workDuration, 0);
    const totalBreakTime = breaksConfig.reduce((sum, b) => sum + b.breakDuration, 0);
    
    if (totalWorkTime + totalBreakTime > totalDuration) {
      const scaleFactor = totalDuration / (totalWorkTime + totalBreakTime);
      const adjustedBreaks = breaksConfig.map(b => ({
        ...b,
        workDuration: Math.floor(b.workDuration * scaleFactor),
        breakDuration: Math.floor(b.breakDuration * scaleFactor)
      }));
      setBreaks(adjustedBreaks);
      return;
    }
    
    const targetDist = (totalWorkTime / 60) * speed;
    const maxMargin = targetDist * 0.5;
    let candidates = airports
      .filter((ap) => ap.iata !== origin.iata)
      .map((ap) => {
        const dist = calculateDistance(origin.lat, origin.lon, ap.lat, ap.lon);
        return {
          airport: ap,
          dist,
          diff: Math.abs(dist - targetDist),
          accuracy: Math.max(0, 100 - (Math.abs(dist - targetDist) / targetDist) * 100)
        };
      })
      .filter((c) => c.diff <= maxMargin)
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 20);
    
    setSuggestedRoutes(candidates);
    if (candidates.length > 0 && selectedRoute) {
      findBreakLocations(origin, selectedRoute.airport, breaksConfig);
    }
  };

  const findNearestAirportAlongRoute = (origin, dest, targetDist) => {
    if (!origin || !dest || airports.length === 0) return null;

    let nearest = null;
    let minDiff = Infinity;
    for (const airport of airports) {
      if (airport.iata === origin.iata || airport.iata === dest.iata) continue;
      
      const distToOrigin = calculateDistance(origin.lat, origin.lon, airport.lat, airport.lon);
      const diff = Math.abs(distToOrigin - targetDist);
      
      if (diff < minDiff) {
        minDiff = diff;
        nearest = airport;
      }
    }
    
    return nearest;
  };

  const handleManualDestChange = (val) => setManualDest(val);
  const handleDurationChange = (e) => { setManualDest(null); setDuration(parseInt(e.target.value)); setSelectedRoute(null); };
  const handleAddScenario = (e) => {
    e.preventDefault();
    if (customTag && !scenariosList.includes(customTag)) { setScenariosList([...scenariosList, customTag]); setScenario(customTag); setCustomTag("");}
  };

  const [currentLeg, setCurrentLeg] = useState(1);
  const [onLayover, setOnLayover] = useState(false);
  const [layoverTimer, setLayoverTimer] = useState(900); // 15 mins
  useEffect(() => {
      if (!onLayover) return;
      const id = setInterval(() => {
          setLayoverTimer(t => {
              if (t <= 0) {
                  setOnLayover(false);
                  setCurrentLeg(2);
                  setView("FLYING");
                  return 0;
              }
              return t - 1;
          });
      }, 1000);
      return () => clearInterval(id);
  }, [onLayover]);

  const startSimulation = () => {
    setCurrentLeg(1);
    setOnLayover(false);
    
    if (isMultiSegment && breaks.length > 0 && breaks[0].position === 0) {
      setLayoverTimer(breaks[0].breakDuration * 60);
      setOnLayover(true);
      setView("LAYOVER");
    } else {
      setView("FLYING");
    }
  };

  const calculateSegments = (origin, finalDest, breakLocs, breakConfigs) => {
    const segments = [];
    let currentOrigin = origin;
    let segmentIndex = 0;
    
    for (let i = 0; i < breakConfigs.length; i++) {
      const breakConfig = breakConfigs[i];
      const breakLoc = breakLocs[i]?.airport || finalDest;
      
      segments.push({
        origin: currentOrigin,
        destination: breakLoc,
        duration: breakConfig.workDuration,
        isBreak: false,
        segmentIndex: segmentIndex++
      });
      
      if (breakConfig.breakDuration > 0) {
        segments.push({
          origin: breakLoc,
          destination: breakLoc,
          duration: breakConfig.breakDuration,
          isBreak: true,
          breakDuration: breakConfig.breakDuration,
          segmentIndex: segmentIndex++
        });
      }
      currentOrigin = breakLoc;
    }
    
    if (currentOrigin.iata !== finalDest.iata) {
      const remainingTime = duration - breakConfigs.reduce((sum, b) => sum + b.workDuration + b.breakDuration, 0);
      segments.push({
        origin: currentOrigin,
        destination: finalDest,
        duration: Math.max(remainingTime, 10), // Minimum 10 minutes
        isBreak: false,
        segmentIndex: segmentIndex
      });
    }
    
    return segments;
  };
  const handleFlightEnd = (minutesSpent, isSuccess, legDetails = null) => {
    const plane = PLANES.find(p => p.id === profile.currentPlane) || PLANES[0];
    let totalMilesFlown = 0;
    let segmentLogs = [];
    
    if (isMultiSegment && breakLocations.length > 0) {
      const allSegments = calculateSegments(startAirport, selectedRoute.airport, breakLocations, breaks);
      let segmentsToLog = [];
      if (isSuccess) {
        segmentsToLog = allSegments;
      } else if (legDetails && legDetails.currentLeg > 0) {
        const segmentsCompleted = legDetails.currentLeg - 1; // Subtract 1 because currentLeg starts at 1
        
        if (segmentsCompleted >= 0) {
          segmentsToLog = allSegments.slice(0, segmentsCompleted);
          if (segmentsCompleted < allSegments.length) {
            const currentSegment = allSegments[segmentsCompleted];
            if (currentSegment) {
              const segmentDist = calculateDistance(
                currentSegment.origin.lat,
                currentSegment.origin.lon,
                currentSegment.destination.lat,
                currentSegment.destination.lo
              );
              const plannedDuration = currentSegment.duration;
              const fractionCompleted = Math.min(minutesSpent / plannedDuration, 1);
              const actualSegmentMiles = (segmentDist * fractionCompleted) * plane.speedMultiplier;
              
              segmentLogs.push({
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                origin: currentSegment.origin.iata,
                destination: currentSegment.destination.iata,
                destinationCountry: currentSegment.destination.country || "Unknown",
                durationPlanned: plannedDuration,
                durationFlown: Math.min(minutesSpent, plannedDuration),
                category: scenario,
                goal: missionGoal,
                status: "DIVERTED",
                milesEarned: actualSegmentMiles,
                segment: segmentsCompleted + 1,
                isBreak: currentSegment.isBreak,
                breakDuration: currentSegment.breakDuration || 0
              });
              
              totalMilesFlown += actualSegmentMiles;
            }
          }
        }
      }
      
      segmentsToLog.forEach((segment, index) => {
        const segmentDist = calculateDistance(
          segment.origin.lat,
          segment.origin.lon,
          segment.destination.lat,
          segment.destination.lon
        );
        const segmentMiles = segmentDist * plane.speedMultiplier;
        totalMilesFlown += segmentMiles;
        
        segmentLogs.push({
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          origin: segment.origin.iata,
          destination: segment.destination.iata,
          destinationCountry: segment.destination.country || "Unknown",
          durationPlanned: segment.duration,
          durationFlown: segment.duration,
          category: scenario,
          goal: missionGoal,
          status: isSuccess ? "LANDED" : "DIVERTED",
          milesEarned: segmentMiles,
          segment: index + 1,
          isBreak: segment.isBreak,
          breakDuration: segment.breakDuration || 0
        });
      });
    } else {
      const dist = calculateDistance(startAirport.lat, startAirport.lon, selectedRoute.airport.lat, selectedRoute.airport.lon);
      const fractionCompleted = Math.min(minutesSpent / duration, 1);
      totalMilesFlown = (dist * fractionCompleted) * plane.speedMultiplier;
      
      segmentLogs.push({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        origin: startAirport.iata,
        destination: selectedRoute.airport.iata,
        destinationCountry: selectedRoute.airport.country || "Unknown",
        durationPlanned: duration,
        durationFlown: Math.min(minutesSpent, duration),
        category: scenario,
        goal: missionGoal,
        status: isSuccess ? "LANDED" : "DIVERTED",
        milesEarned: totalMilesFlown,
        segment: 1
      });
    }
    
    const milesToAdd = Math.max(0, totalMilesFlown);
    const newBalance = (profile.balance || 0) + milesToAdd;
    setProfile(prev => ({ ...prev, balance: newBalance }));
    setFlightLog(prev => [...prev, ...segmentLogs]);
    if (!isSuccess) {
      const flightData = {
        origin: startAirport.iata,
        destination: selectedRoute.airport.iata,
        goal: missionGoal,
        segments: segmentLogs
      };
      
      setFlightResult({
        type: 'DIVERTED',
        minutes: segmentLogs.reduce((sum, log) => sum + log.durationFlown, 0),
        miles: milesToAdd,
        flightData: flightData
      });
      setView("SUMMARY");
      return;
    }

    if (isMultiSegment && legDetails && legDetails.currentLeg < legDetails.totalLegs) {
      setCurrentLeg(legDetails.currentLeg + 1);

      const nextSegmentIndex = legDetails.currentLeg;
      const nextSegment = calculateSegments(startAirport, selectedRoute.airport, breakLocations, breaks)[nextSegmentIndex];
      if (nextSegment?.isBreak) {
        setLayoverTimer(nextSegment.breakDuration * 60);
        setOnLayover(true);
        setView("LAYOVER");
      } else {
        setView("FLYING");
      }
    } else {
      const flightData = {
        origin: startAirport.iata,
        destination: selectedRoute.airport.iata,
        goal: missionGoal,
        segments: segmentLogs
      };
      
      setFlightResult({
        type: 'COMPLETED',
        minutes: segmentLogs.reduce((sum, log) => sum + log.durationFlown, 0),
        miles: milesToAdd,
        flightData: flightData
      });
      setView("SUMMARY");
    }
  };

  if (view === "FLYING" && startAirport && selectedRoute) {
    const segments = calculateSegments(startAirport, selectedRoute.airport, breakLocations, breaks);
    const currentSegment = segments[currentLeg - 1];
    
    if (!currentSegment) {
      return null;
    }
    
    return (
      <FlyingMode
        origin={currentSegment.origin}
        destination={currentSegment.destination}
        duration={currentSegment.duration}
        missionGoal={missionGoal}
        squadCode={squadConnected ? squadCode : null}
        currentPlaneId={profile.currentPlane}
        onFinish={(minutesSpent, isSuccess) => handleFlightEnd(minutesSpent, isSuccess, {
          currentLeg,
          totalLegs: segments.length,
          segmentType: currentSegment.isBreak ? 'break' : 'work'
        })}
        segmentInfo={{
          currentSegment: currentLeg,
          totalSegments: segments.length,
          isBreak: currentSegment.isBreak
        }}
      />
    );
  }

  const resetApp = () => {
    setView("WIZARD");
    setStep(1);
    setFlightResult(null);
    setSelectedRoute(null);
    setStartAirport(null);
    setManualDest(null);
    setMissionGoal("");
    setSquadCode("");
    setSquadConnected(false);
    setIsMultiSegment(false);
    setBreaks([]);
    setBreakLocations([]);
    setCurrentLeg(1);
    setOnLayover(false);
    setChecklist({ 0: false, 1: false, 2: false });
  };

  if (loading) return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <h2 className="text-xl font-light">Initializing Flight Systems...</h2>
      </div>
  );
  
  if (view === "FLYING" && startAirport && selectedRoute) {
    const segments = calculateSegments(startAirport, selectedRoute.airport, breakLocations, breaks);
    const currentSegment = segments[currentLeg - 1];
    
    if (!currentSegment) return null;
    
    return (
      <FlyingMode
        origin={currentSegment.origin}
        destination={currentSegment.destination}
        duration={currentSegment.duration}
        missionGoal={missionGoal}
        squadCode={squadConnected ? squadCode : null}
        currentPlaneId={profile.currentPlane}
        onFinish={(minutesSpent, isSuccess) => handleFlightEnd(minutesSpent, isSuccess, {
          currentLeg,
          totalLegs: segments.length
        })}
        segmentInfo={{
          currentSegment: currentLeg,
          totalSegments: segments.length,
          isBreak: currentSegment.isBreak
        }}
      />
    );
  }

  if (view === "LAYOVER") {
    const currentBreak = breaks.find(() => {
      const segments = calculateSegments(startAirport, selectedRoute.airport, breakLocations, breaks);
      const segmentIndex = currentLeg - 1;
      return segments[segmentIndex]?.isBreak;
    });
    
    const breakDuration = currentBreak ? currentBreak.breakDuration * 60 : 900;
    const timeSpentInBreak = breakDuration - layoverTimer;
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl">
          <Coffee className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce"/>
          <h2 className="text-3xl font-bold text-white mb-2">Break Time</h2>
          <div className="text-sm text-slate-400 mb-4">
            Segment {currentLeg}/{calculateSegments(startAirport, selectedRoute.airport, breakLocations, breaks).length} completed
          </div>
          <div className="text-5xl font-mono font-bold text-emerald-400 my-6">
            {Math.floor(layoverTimer / 60)}:{String(layoverTimer % 60).padStart(2, '0')}
          </div>
          <p className="text-slate-400 mb-8">
            {currentLeg < breaks.length + 1 ?
              `Great job! Next segment starts in ${Math.floor(layoverTimer / 60)} minutes.` :
              "Final break before completing your mission!"
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setOnLayover(false);
                setCurrentLeg(prev => prev + 1);
                setView("FLYING");
              }}
              className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
            >
              SKIP BREAK & CONTINUE
            </button>
            <button
              onClick={() => {
                handleFlightEnd(Math.floor(timeSpentInBreak / 60), false, {
                  currentLeg,
                  totalLegs: calculateSegments(startAirport, selectedRoute.airport, breakLocations, breaks).length
                });
              }}
              className="w-full py-3 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              End Session Early (Emergency Landing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "SUMMARY" && flightResult) return (
      <FlightSummary
        type={flightResult.type}
        minutes={flightResult.minutes}
        miles={flightResult.miles}
        flightData={flightResult.flightData}
        onHome={resetApp}
      />
  );

  if (view === "LOGBOOK") return (
      <LogbookView profile={profile} logs={flightLog} onUpdateProfile={setProfile} onClose={() => setView("WIZARD")} />
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 pb-20 relative">
      <FlightSchoolModal isOpen={showTutorial} onClose={handleTutorialComplete} />
      <HangarModal
        isOpen={showHangar}
        onClose={() => setShowHangar(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />

      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest">
            <Plane className="w-6 h-6" /> FOCUS AIR <span className="text-xs text-slate-500 font-normal border border-slate-700 px-1 rounded">V1.0</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {step === 1 && (
                <>
                    <button onClick={() => setShowHangar(true)} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors">
                        <Rocket className="w-4 h-4" /> <span className="hidden sm:inline">HANGAR</span>
                    </button>
                    <button onClick={() => setView("LOGBOOK")} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors">
                        <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">LOGBOOK</span>
                    </button>
                </>
            )}
            <button onClick={() => setShowTutorial(true)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors" title="Open Flight School"><HelpCircle className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => <div key={i} className={`flex items-center gap-2 ${step === i ? "text-amber-500" : "text-slate-700"}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === i ? "bg-amber-500 text-slate-900" : "bg-slate-800"}`}>{i}</div>{i < 3 && <div className="w-4 h-[1px] bg-slate-800"></div>}</div>)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 mt-6">
        {step === 1 && (
          <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><MapPin className="text-amber-500" /> Flight Plan</h2>
                <div className="space-y-6">
                  <SearchableSelect
                    label="Origin Airport"
                    options={airports}
                    value={startAirport}
                    onChange={setStartAirport}
                    placeholder="Type to search (e.g. LHR)"
                    showCoachMark={hasOnboarded && flightLog.length === 0}
                    onRandom={handleRandomOrigin}
                  />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-slate-800 p-1 rounded-full border border-slate-700 z-10"><ArrowRight className="w-3 h-3 text-slate-500" /></div><div className="absolute w-full h-[1px] bg-slate-800"></div></div>
                  </div>
                  <SearchableSelect label="Destination (Optional)" options={airports} value={manualDest} onChange={handleManualDestChange} placeholder="Search specific destination..." disabled={!startAirport} />
                  <div className={`p-4 rounded-xl border transition-all ${manualDest ? "bg-slate-800/50 border-slate-700 opacity-50" : "bg-slate-800 border-amber-500/30"}`}>
                    <div className="flex justify-between mb-2"><label className="text-xs font-bold text-slate-400 uppercase">Flight Duration</label><span className="text-xs font-mono text-amber-500">{duration} min</span></div>
                    <input type="range" min="10" max="600" step="10" value={duration} onChange={handleDurationChange} disabled={!startAirport} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:cursor-not-allowed" />
                  </div>
                  {duration >= 60 && (
                      <div className="space-y-4">
                        <div
                          className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer"
                          onClick={() => setIsMultiSegment(!isMultiSegment)}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isMultiSegment ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}`}>
                            {isMultiSegment && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">Custom Schedule</div>
                            <div className="text-[10px] text-slate-400">Set multiple work/break periods</div>
                          </div>
                        </div>
                        
                        {isMultiSegment && (
                          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                            <BreakPlanner
                              totalDuration={duration}
                              breaks={breaks}
                              onBreaksChange={setBreaks}
                              availableBreakLocations={breakLocations}
                              onBreakLocationsChange={setBreakLocations}
                            />
                          </div>
                        )}
                      </div>
                )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              {startAirport && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex justify-between items-center"><span>Available Routes</span><span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{manualDest ? "1 Match (Specific)" : `${suggestedRoutes.length} Options`}</span></h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[500px]">
                    {manualDest && selectedRoute && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500 rounded-xl text-center py-10">
                        <CheckCircle2 className="w-8 h-8 text-amber-500 mx-auto mb-2" /><div className="text-xl font-bold text-white">{selectedRoute.airport.city}</div><div className="text-sm text-slate-400">{Math.round(selectedRoute.dist)} miles • {duration} mins</div>
                      </div>
                    )}
                    {!manualDest && suggestedRoutes.map((route) => (
                        <button key={route.airport.iata} onClick={() => setSelectedRoute(route)} className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group ${selectedRoute?.airport.iata === route.airport.iata ? "bg-amber-500 border-amber-600 text-slate-900 shadow-lg shadow-amber-500/20" : "bg-slate-800/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800"}`}>
                          <div className="flex items-center gap-4"><div className={`text-xl font-mono font-bold w-12 ${selectedRoute?.airport.iata === route.airport.iata ? "text-slate-900" : "text-slate-500"}`}>{route.airport.iata}</div><div><div className={`font-bold ${selectedRoute?.airport.iata === route.airport.iata ? "text-slate-900" : "text-white"}`}>{route.airport.city}</div><div className={`text-xs ${selectedRoute?.airport.iata === route.airport.iata ? "text-slate-800" : "text-slate-500"}`}>{route.airport.name}</div></div></div><div className="text-right"><div className={`text-xs font-mono ${selectedRoute?.airport.iata === route.airport.iata ? "text-slate-900" : "text-slate-400"}`}>{Math.round(route.dist)} mi</div></div>
                        </button>
                      ))}
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-800"><button disabled={!selectedRoute} onClick={() => setStep(2)} className="w-full py-4 bg-white hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2">Confirm Route <ArrowRight className="w-4 h-4" /></button></div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Briefcase className="text-amber-500" /> Session Goal</h2>
                <div className="flex flex-wrap gap-2 mb-4">{scenariosList.map((s) => <button key={s} onClick={() => setScenario(s)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${scenario === s ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}>{s}</button>)}</div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Specific Objective (Optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. Finish Chapter 4"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-sm focus:border-amber-500 outline-none text-white placeholder:text-slate-600"
                        value={missionGoal}
                        onChange={e => setMissionGoal(e.target.value)}
                    />
                </div>

                <div className="my-4 border-t border-slate-800"></div>

                <form onSubmit={handleAddScenario} className="relative"><input type="text" placeholder="+ Add New Tag" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-sm focus:border-amber-500 outline-none text-white" value={customTag} onChange={(e) => setCustomTag(e.target.value)} /></form>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Your Ticket</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Flight</span><span className="text-white font-mono">{startAirport.iata} <span className="text-amber-500">✈</span> {selectedRoute.airport.iata}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-white">{duration} min</span></div>
                  <div className="flex justify-between pt-3 border-t border-slate-800"><span className="text-slate-400">Seat</span><span className="text-amber-500 font-bold text-lg">{selectedSeat || "--"}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6"><button onClick={() => setStep(1)} className="py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Back</button><button disabled={!selectedSeat} onClick={() => setStep(3)} className="py-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Board Plane</button></div>
              </div>
            </div>
            
            <div className="lg:col-span-8 flex justify-center w-full">
              <div className="w-full overflow-x-auto pb-12">
                <div className="relative min-w-[340px] mx-auto w-max">
                  <div className="absolute top-[350px] -left-32 w-32 h-64 bg-slate-800 skew-y-[20deg] rounded-l-3xl border-l-4 border-slate-700 opacity-50 z-0"></div>
                  <div className="absolute top-[350px] -right-32 w-32 h-64 bg-slate-800 -skew-y-[20deg] rounded-r-3xl border-r-4 border-slate-700 opacity-50 z-0"></div>
                  <div className="relative z-10 w-[340px] bg-slate-200 text-slate-900 rounded-t-[10rem] rounded-b-[4rem] px-6 py-12 shadow-2xl border-x-8 border-t-8 border-slate-300 min-h-[800px]">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-2 bg-slate-400 rounded-full opacity-50"></div>
                    <div className="text-center mb-8 mt-4">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Boeing 737-800</div>
                      <div className="flex justify-center gap-8 mt-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-400 rounded-sm"></div> OCCUPIED</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-400 rounded-sm"></div> AVAILABLE</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {Array.from({ length: 4 }).map((_, i) => { const row = i + 1; return ( <div key={row} className="flex justify-between items-center mb-3 px-4"><div className="flex gap-2">{["A", "B"].map((col) => renderSeat(row, col, true))}</div><div className="text-[10px] font-mono text-slate-400 w-6 text-center">{row}</div><div className="flex gap-2">{["E", "F"].map((col) => renderSeat(row, col, true))}</div></div> ); })}
                      <div className="flex items-center gap-2 my-6 opacity-30"><div className="h-[1px] bg-slate-900 flex-1"></div><div className="text-[9px] uppercase font-bold">Economy</div><div className="h-[1px] bg-slate-900 flex-1"></div></div>
                      {Array.from({ length: 26 }).map((_, i) => { const row = i + 5; const isExitRow = row === 12 || row === 13; return ( <div key={row} className={`flex justify-between items-center mb-1 ${isExitRow ? "mb-6" : ""}`}><div className="flex gap-1">{["A", "B", "C"].map((col) => renderSeat(row, col, false))}</div><div className="text-[10px] font-mono text-slate-400 w-6 text-center">{row}</div><div className="flex gap-1">{["D", "E", "F"].map((col) => renderSeat(row, col, false))}</div></div> ); })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md mx-auto animate-in zoom-in duration-300 mt-10">
            <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="bg-amber-500 p-6 pb-10 relative">
                <div className="flex justify-between items-start"><div className="font-bold tracking-widest text-slate-900 flex items-center gap-2"><Plane className="w-5 h-5" /> FOCUS AIR</div><div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase">{selectedSeat && parseInt(selectedSeat) <= 4 ? "Business" : "Economy"}</div></div>
                <div className="mt-8 flex justify-between items-center">
                  <div className="text-center"><div className="text-4xl font-bold font-mono">{startAirport.iata}</div></div>
                  <div className="flex-1 px-4 flex flex-col items-center"><Plane className="w-6 h-6 rotate-90 mb-2 opacity-50" /><div className="w-full h-0.5 bg-slate-900/10 border-t border-dashed border-slate-900/30"></div><div className="text-xs font-bold mt-1 opacity-60">{duration} min</div></div>
                  <div className="text-center"><div className="text-4xl font-bold font-mono">{selectedRoute.airport.iata}</div></div>
                </div>
              </div>
              <div className="h-6 bg-amber-500 -mb-3 relative z-10"><div className="absolute -left-3 top-0 w-6 h-6 bg-slate-950 rounded-full"></div><div className="absolute -right-3 top-0 w-6 h-6 bg-slate-950 rounded-full"></div></div>
              <div className="bg-white p-6 pt-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div><div className="text-xs text-slate-400 uppercase font-bold">Passenger</div><div className="font-bold text-lg flex items-center gap-2"><User className="w-4 h-4 text-amber-500" /> {profile.name}</div></div>
                  <div><div className="text-xs text-slate-400 uppercase font-bold">Seat</div><div className="font-bold text-lg text-amber-600">{selectedSeat}</div></div>
                  <div className="col-span-2"><div className="text-xs text-slate-400 uppercase font-bold">Mission</div><div className="font-bold text-lg truncate bg-slate-100 p-2 rounded mt-1">{scenario}</div>
                  {missionGoal && <div className="text-xs text-slate-500 mt-1 italic">"{missionGoal}"</div>}
                  </div>
                </div>
                
                <div className="border-t border-dashed border-slate-200 pt-4">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">Wingman Mode (Coming Soon!)</div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Coming Soon!"
                            className="flex-1 bg-slate-100 border-none rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-widest outline-none focus:ring-2 focus:ring-amber-500"
                            value={squadCode}
                            onChange={(e) => setSquadCode(e.target.value.toUpperCase())}
                            disabled = {true}
                            // disabled={squadConnected}
                        />
                        <button
                            onClick={handleJoinSquad}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${squadConnected ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                            disabled = {true}
                            // disabled={!squadCode || squadConnected || isJoiningSquad}
                        >
                            {isJoiningSquad ? <Loader2 className="w-4 h-4 animate-spin"/> : squadConnected ? "LINKED" : "JOIN"}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Pre-Flight Checks</div>
                    {CHECKLIST_ITEMS.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => setChecklist(prev => ({...prev, [idx]: !prev[idx]}))}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist[idx] ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
                                {checklist[idx] && <CheckCircle2 className="w-3 h-3"/>}
                            </div>
                            {item}
                        </div>
                    ))}
                </div>
                <div className="border-t border-dashed border-slate-200 pt-6 flex items-center justify-between">
                  <QrCode className="w-24 h-24 text-slate-800 opacity-80" />
                  <div className="text-right space-y-2">
                      <button
                        className="mt-2 bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-slate-400/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={startSimulation}
                        disabled={!isChecklistComplete}
                      >
                          START FLIGHT
                      </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full text-center mt-6 text-slate-500 hover:text-white text-sm">Cancel & Return</button>
          </div>
        )}
      </main>
    </div>
  );

  function renderSeat(row, col, isBiz) {
    const id = `${row}${col}`;
    const isOccupied = occupiedSeats.has(id);
    const isSelected = selectedSeat === id;
    return (
      <button key={id} disabled={isOccupied} onClick={() => setSelectedSeat(id)} className={`relative rounded-sm border transition-all flex items-end justify-center pb-1 ${isBiz ? "w-10 h-10" : "w-8 h-8"} ${isOccupied ? "bg-slate-300 border-slate-300 cursor-not-allowed opacity-50" : isSelected ? "bg-amber-500 border-amber-600 z-10 scale-110 shadow-lg" : "bg-white border-slate-300 hover:bg-blue-50"}`}>
        <div className={`absolute top-0 w-full h-1/3 rounded-t-sm opacity-20 ${isSelected ? "bg-black" : "bg-slate-400"}`}></div>
        {isBiz && <div className="absolute bottom-0 -left-1 w-1 h-3/4 bg-slate-300 rounded-full"></div>}
        {isBiz && <div className="absolute bottom-0 -right-1 w-1 h-3/4 bg-slate-300 rounded-full"></div>}
        {isOccupied && <X className="w-4 h-4 text-slate-500" />}
        {!isOccupied && isSelected && <span className="text-[8px] font-bold text-slate-900">{id}</span>}
      </button>
    );
  }
}