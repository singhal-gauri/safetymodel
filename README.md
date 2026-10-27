# SafeWay: Women Safety Route Planner & Emergency Navigation System
### B.Tech First-Year Engineering Mini-Project
**Technology Stack:** HTML5, CSS3, JavaScript (Vanilla ES6), Core Java (HTTP Server)

---

## 📌 1. Project Abstract & Overview

Personal transit safety—particularly for women navigating unfamiliar or late-night routes—remains a paramount concern in urban centers. Traditional navigation applications optimize exclusively for the **fastest travel time**, frequently routing commuters through unlit alleys, secluded alleys, or areas with zero surveillance.

**SafeWay** is a smart, beginner-friendly web application designed as a 1st-year B.Tech engineering mini-project. It solves this issue by prioritizing **safety metrics over mere transit speed**. The system offers:
1. **Interactive Dark-Mode Radar Map:** Uses Leaflet.js with real-time GPS telemetry and nearby emergency points of interest (Police stations, 24/7 hospitals, safe transit shelters, night pharmacies).
2. **Multi-Criteria Route Comparison:** Visualizes the "Safest Well-Lit Route" (96% street lighting, 14 CCTV poles) versus the "Fastest Direct Route" (42% lighting).
3. **Fail-Safe Journey Safety Timer:** Automatically triggers distress protocols if the user does not confirm safe arrival before the countdown expires.
4. **One-Tap Emergency SOS:** Features a 5-second false-alarm grace countdown and a native Web Audio API acoustic distress siren.
5. **Trusted Emergency Circle:** Stores up to 5 guardians with 1-tap live GPS sharing.
6. **Core Java Backend Server (`SafeWayServer.java`):** Demonstrates full-stack concepts using built-in Java networking.

---

## 📂 2. Project Directory Structure

```text
safeway-app/
├── index.html           # Main semantic HTML5 webpage structure
├── style.css            # Clean, responsive CSS3 stylesheet (Dark mode theme)
├── script.js            # Pure JavaScript application logic (DOM, Map, Timer, Audio)
├── SafeWayServer.java   # Lightweight Core Java HTTP server (com.sun.net.httpserver)
└── README.md            # Comprehensive project documentation & viva guide
```

---

## 🛠️ 3. Technologies Used & Why

| Technology | Purpose in Project | Why Chosen for 1st Year B.Tech |
| :--- | :--- | :--- |
| **HTML5** | Semantic structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<dialog>`) | Standard industry baseline; zero build tools needed. |
| **CSS3** | Modern dark-mode styling, Flexbox, Grid, CSS animations | Highly responsive layout without relying on bulky CSS frameworks. |
| **JavaScript (ES6)** | DOM manipulation, Geolocation API, Web Audio API, LocalStorage | Teaches fundamental event-driven programming and asynchronous timers. |
| **Leaflet.js** | Interactive mapping library with CartoDB Dark Matter tiles | 100% free, open-source, and does not require paid Google Maps API billing. |
| **Core Java** | Static file serving & `/api/sos` backend endpoint | Fulfills academic Java lab curriculum requirements using standard JDK classes. |

---

## 🚀 4. How to Run the Project

### Method 1: Instant Browser Launch (Zero Installation Required)
No software installation or server needed! Simply double-click `index.html` on any computer:
1. Open File Explorer and navigate to `safeway-app/`.
2. Double-click **`index.html`** (or right-click -> *Open with Google Chrome / Microsoft Edge / Firefox*).
3. The entire web application will run instantly with all features active.

---

### Method 2: Running via Core Java Backend Server (College Lab Demo)
If your college instructor or viva examiner requires running via Java:
1. Open a terminal or command prompt in the `safeway-app` directory.
2. Compile the Java server:
   ```bash
   javac SafeWayServer.java
   ```
3. Run the Java server:
   ```bash
   java SafeWayServer
   ```
4. You will see the server startup banner:
   ```text
   =================================================================
      SAFEWAY: WOMEN SAFETY NAVIGATION SYSTEM - JAVA BACKEND SERVER 
   =================================================================
    [STATUS] Server successfully started!
    [PORT]   Running at: http://localhost:8080
   =================================================================
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
6. When an SOS alert is triggered, the Java server will log live emergency alerts in the terminal console in real-time!

---

## 🌟 5. Key System Modules & Features

### 🗺️ Module 1: Live Location & Nearby Radar (`#page-livemap`)
- **Live GPS Sensing:** Calls `navigator.geolocation.getCurrentPosition()` to fetch genuine device latitude and longitude.
- **Nearby Facilities Directory:** Displays verified Police Stations, 24/7 Hospitals, Safe Shelters, and Night Pharmacies.
- **Dynamic Distance Calculation:** Employs the mathematical **Haversine Formula** to compute real-time straight-line distances from the user.
- **Filter Bar:** Filter places by category ("Police", "Hospital", etc.) or radius (<500m, <1km, <2.5km).

### 🛣️ Module 2: Safe Route Planner (`#page-routes`)
- **Interactive SVG Vector Map:** Shows a detailed road network with streetlights, commercial hubs, and park alleys.
- **Route 1 - Safest Route (Emerald Green):** 96% lighting index, 14 CCTVs, 4 safe hubs along the path, ETA 18 mins.
- **Route 2 - Fastest Direct Shortcut (Crimson Red):** 42% lighting index, only 3 CCTVs, cuts through unlit alleys, ETA 12 mins.
- Users can click between both routes to inspect safety parameters before embarking.

### ⏰ Module 3: Journey Safety Timer & Auto Check-In (`#page-journey`)
- Commuters set an estimated walking duration (e.g., 15 minutes).
- Active countdown digits display in the navbar and journey tab.
- Prominent **"I Have Arrived Safely [Check In]"** button.
- **Fail-Safe Mechanism:** If the countdown reaches `00:00` without a safe check-in, SafeWay automatically triggers an emergency alert banner and sounds an acoustic alarm siren.

### 🧑‍🤝‍🧑 Module 4: Trusted Emergency Circle (`#page-contacts`)
- Allows saving up to 5 emergency guardians (Name, Phone number, Relationship).
- Saved contacts persist across browser refreshes via `localStorage`.
- Includes a **"Share Live GPS"** button that copies a real-time tracking link to the user's clipboard.

### 📞 Module 5: 24/7 Verified Helplines (`#page-helplines`)
- Quick speed-dial cards for:
  - **112** (National Emergency Services)
  - **1091** (Dedicated Women Helpline)
  - **100** (Police Control Room)
  - **102** (Ambulance Services)
  - **1090** (Women Power Line)
  - **181** (National Women Helpline)

### 🚨 Module 6: One-Tap SOS with 5-Second Grace & Acoustic Siren
- Floating circular red SOS button with continuous radial pulsing rings.
- **5-Second Grace Countdown:** Gives user 5 seconds to cancel in case of accidental touches.
- **Web Audio API Distress Siren:** Uses JavaScript's built-in `AudioContext` and `OscillatorNode` to produce a high-decibel two-tone distress siren (620 Hz – 980 Hz) directly through the device speaker without needing any external MP3 sound files!
- **Fullscreen Emergency Overlay:** Shows current GPS telemetry and direct speed-dial actions.

---

## 🎓 6. College Viva-Voce Questions & Model Answers

### Q1: What is the primary problem your project solves?
> **Answer:** Traditional GPS navigation applications (like Google Maps) only optimize for travel duration or shortest distance. SafeWay provides safety-first navigation for women and vulnerable commuters by evaluating environmental safety factors like street lighting percentage, CCTV surveillance density, and proximity to 24/7 emergency shelters.

### Q2: Why did you write this in plain HTML, CSS, and JavaScript rather than heavy frameworks?
> **Answer:** Plain HTML5, CSS3, and JavaScript are lightweight, have zero external dependencies, require no compilation build step (like Node.js or Vite), and run natively in any modern web browser immediately. This makes the application universally accessible on low-end devices and emergency browsers.

### Q3: How do you calculate the distance to nearby facilities in JavaScript?
> **Answer:** We use the **Haversine Formula**, which calculates the great-circle distance between two geographic coordinates on a sphere using spherical trigonometry:
> 
> $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
> 
> Where $R$ is the Earth's radius (6,371 km), $\varphi$ is latitude, and $\lambda$ is longitude.

### Q4: How does the emergency siren work without loading an MP3 audio file?
> **Answer:** We utilized the HTML5 **Web Audio API** (`window.AudioContext`). An `OscillatorNode` generates a mathematical sawtooth sound wave, and an interval alternates its frequency between 620 Hz and 980 Hz every 350 milliseconds. This synthesizes a realistic two-tone emergency alarm directly in the browser's audio processing engine without requiring internet bandwidth or audio downloads.

### Q5: How does the Java backend integrate with the frontend?
> **Answer:** The frontend sends asynchronous HTTP requests (`fetch('/api/sos', { method: 'POST', body: ... })`). Our Java server (`SafeWayServer.java`) uses `com.sun.net.httpserver.HttpServer` to listen on port 8080. When it receives the POST request, the `SosAlertHandler` extracts the JSON coordinates and prints an emergency dispatch notice in the console.

### Q6: How do you save the user's emergency contacts?
> **Answer:** We use the browser's `window.localStorage` API. The contacts array is serialized into a JSON string using `JSON.stringify()` and stored under the key `'safeway_contacts'`. When the page reloads, `JSON.parse()` retrieves the contacts.

---

## 👥 Authors & Academic Details
- **Project Name:** SafeWay: Women Safety Route Planner & Emergency Navigation System
- **Course:** B.Tech Computer Science & Engineering (1st Year)
- **Subject:** Engineering Mini-Project / Web Technologies Lab
