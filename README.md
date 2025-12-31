# FocusAir

**FocusAir** is a gamified productivity tool that turns your deep work sessions into real-world flights. Instead of a boring countdown timer, you "book a ticket," board a plane, and fly across a real satellite map while you work.

> **⚠️ Note:** This entire application (Code, UI, Logic) was generated using **Prompt Engineering** with Large Language Models.

## Key Features

### **Flight Planning & Custom Scheduling**
* **Smart Route Calculation:** Automatically finds airports matching your desired flight duration from 28,000+ real-world airports
* **Flexible Multi-Segment Flights:** Create custom work/break schedules with multiple segments
* **Smart Break Planning:** Automatically finds appropriate airports for layovers along your route
* **Real-World Geography:** Distance calculations based on actual Earth coordinates using Haversine formula

### **Flight Simulator & Immersion**
* **Live Satellite Map:** Tracks your plane in real-time over realistic 3D earth view with day/night cycles (Terminator layer)
* **Dynamic Aircraft:** Plane icon rotates to match actual bearing between cities
* **Window View:** Switch to a photorealistic "Porthole" view for distraction-free focus
* **Audio Mixer:** Custom soundscapes (Brown Noise, Rain, Ocean, Cafe) with individual volume controls
* **Pilot Announcements:** Text-to-Speech audio cues coach you through your session
* **Picture-in-Picture Mode:** Pop-out timer that stays visible while you work in other applications

### **Gamification & Progression**
* **The Hangar:** Earn miles to upgrade your fleet from a **Cessna 172** to a **Gulfstream G650** or **Concorde** (each with unique speed multipliers)
* **Pilot Ranking System:** Progress from Cadet to Commander based on flight hours
* **Passport System:** Collect digital stamps for every new country you visit
* **Flight Logbook:** Detailed analytics of your focus sessions with category breakdowns
* **Mileage Economy:** Earn miles based on actual distance flown and plane speed multipliers

### **Interactive Experience**
* **Seat Selection:** Choose your seat on a realistic 737-800 cabin layout
* **Pre-Flight Checklist:** Ritual-based preparation (DND mode, water, goal setting)
* **Emergency Landing:** Graceful session termination with partial mileage rewards
* **Keyboard Shortcuts:** Spacebar to pause, M to mute, P for PiP mode, Esc for emergency landing
* **Wingman Mode:** (Coming soon) Shared flights with friends using squad codes

## **New Multi-Segment Flight System**

### **Flexible Pomodoro & Custom Schedules**
* **Equal Parts Mode:** Automatically splits your session into equal work segments with breaks
* **Custom Scheduling:** Define any number of work/break periods with custom durations
* **Smart Break Locations:** Finds appropriate airports for layovers along your flight path
* **Segment Tracking:** Each work and break segment recorded independently in your logbook

### **How It Works:**
1. **Plan Your Route:** Set total flight duration (10-600 minutes)
2. **Enable Custom Schedule:** Toggle multi-segment planning
3. **Configure Segments:** Set work durations and break lengths
4. **Automatic Routing:** System finds airports for breaks along your route
5. **Fly & Focus:** Complete each segment with automatic transitions

## **Technical Implementation**

### **Core Algorithms**
* **Haversine Distance Calculation:** Accurate Earth-surface distance between airports
* **Great Circle Navigation:** Plane follows shortest path (great circle route)
* **Bearing Calculation:** Determines correct plane rotation angle
* **Linear Interpolation:** Smooth plane movement along flight path
* **Airport Matching:** Finds destinations matching desired flight time based on current aircraft speed

### **Error Handling & Edge Cases**
* **Negative Time Prevention:** Guards against timer underflow
* **Partial Completion:** Correctly calculates mileage for interrupted sessions
* **Geographic Validation:** Handles invalid coordinates and missing data
* **Audio Context Management:** Graceful handling of browser audio restrictions

## **Data & Analytics**

### **Flight Logging**
* Each segment (work or break) recorded independently
* Country tracking for passport stamps
* Category-based time tracking
* Goal achievement monitoring
* Mileage earned with plane speed multipliers

### **Statistics**
* Total flight hours and miles
* Category distribution (Work, Study, Coding, etc.)
* Earth orbits completed (based on 24,901 mile circumference)
* Rank progression tracking

## **User Interface**

### **Three-Step Flight Planning**
1. **Route Selection:** Choose origin and destination (or let the system suggest routes)
2. **Mission Configuration:** Set focus category and specific goal
3. **Seat Selection & Boarding:** Choose your seat and complete pre-flight checks

### **Multiple Views**
* **Wizard Mode:** Flight planning interface
* **Flying Mode:** Live map with progress tracking
* **Window Mode:** Distraction-free porthole view
* **Logbook Mode:** Analytics and passport
* **Hangar Mode:** Plane upgrades and purchases
* **Summary Mode:** Post-flight recap with shareable results

## **Tech Stack**

* **Framework:** React 18 + Vite
* **Styling:** Tailwind CSS
* **Maps:** Leaflet + React-Leaflet + Esri Satellite Tiles
* **Icons:** Lucide React
* **Audio:** Web Audio API with cross-fade mixing
* **Persistence:** LocalStorage (No backend required)
* **Date/Time:** Native JavaScript Date API
* **Math:** Custom geographic calculations

## **File Structure**

```text
src/
├── App.jsx                    # Main application component
├── components/
│   ├── modals/
│   │   ├── FlightSchoolModal.jsx  # Interactive tutorial
│   │   ├── HangarModal.jsx        # Plane purchase/upgrade
│   │   ├── FlightSummary.jsx      # Post-flight receipt
│   │   └── BreakPlanner.jsx       # Multi-segment scheduling
│   ├── flight/
│   │   ├── FlyingMode.jsx         # Main flying interface
│   │   ├── MapView.jsx            # Live satellite map
│   │   └── WindowView.jsx         # Distraction-free view
│   ├── LogbookView.jsx            # Analytics & passport
│   ├── SearchableSelect.jsx       # Airport search component
│   ├── AudioMixer.jsx             # Sound mixing controls
│   ├── TerminatorLayer.jsx        # Day/night cycle overlay
│   └── CoachMark.jsx              # UI tutorial indicators
├── utils/
│   ├── constants.js               # Configuration & data
│   ├── calculations.js            # Geographic math functions
│   └── helpers.js                 # Utility functions
└── hooks/
    └── useLocalStorage.js         # Persistent state management
```

## **Keyboard Shortcuts**

- **Space**: Pause/Resume flight 
- **M**: Mute/Unmute audio 
- **P**: Toggle Picture-in-Picture mode 
- **Esc**: Emergency Landing (end session) 

## **Future Roadmap**

### **Planned Features**
- **Cloud Sync:** Backup flight data across devices
- **Social Features:** Share flights, compete with friends
- **Weather Effects:** Dynamic weather based on location
- **Achievements:** Badges for milestones and streaks
- **Flight Replays:** Review past sessions on map

### **Technical Improvements**
- Progressive Web App (PWA) support
- WebSocket-based real-time updates
- 3D globe rendering with Three.js
- Offline airport database caching

## **Limitations & Known Issues**

* **Large Dataset:** 28,000+ airports may cause slight initial load delay
* **Mobile Experience:** Optimized for desktop but functional on mobile
* **Timezone Handling:** Uses local browser timezone for all calculations

## **License**

**This project is for Personal & Non-Commercial use only.**
Distributed under the **CC BY-NC 4.0** License. You are free to fork and modify it for your own learning or use, but you **cannot** sell it, use it for paid services, or monetize it without permission.

## **Acknowledgments**

* Airport data from [mwgg/Airports](https://github.com/mwgg/Airports)
* Satellite imagery from [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9)
* Sound effects from [SoundJay](https://www.soundjay.com/)

---

**Happy Flying! ✈️**