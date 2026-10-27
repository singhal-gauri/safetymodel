/* ==========================================================================
   SafeWay - Women Safety Route Planner & Emergency Navigation System
   B.Tech First Year Project - Pure JavaScript File (script.js)
   Clean, Beginner-Friendly Code with Step-by-Step Comments
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. GLOBAL VARIABLES & STATE MANAGEMENT
   -------------------------------------------------------------------------- */

// Current active page tab ('livemap', 'routes', 'journey', 'contacts', 'helplines')
let currentPage = 'livemap';

// User's default / live GPS location (Defaults to Indiranagar, Bengaluru)
let userLocation = {
  lat: 12.9716,
  lng: 77.5946,
  address: "8th Main Rd, 100ft Corner, Indiranagar, Bengaluru"
};

// Selected route type: 'safe' (well-lit) or 'fast' (shortcut)
let selectedRoute = 'safe';

// Leaflet Map reference
let leafletMap = null;
let userMarker = null;
let facilityMarkersLayer = null;

// Journey Safety Timer variables
let journeyTimerInterval = null;
let journeyRemainingSeconds = 900; // 15 mins default (15 * 60 = 900s)
let journeyDurationMinutes = 15;
let isJourneyRunning = false;

// SOS Grace Period Countdown variables
let sosGraceInterval = null;
let sosGraceSeconds = 5;

// Web Audio API Siren variables
let audioContext = null;
let sirenOscillator = null;
let sirenGainNode = null;
let sirenPitchInterval = null;
let isSirenActive = false;
let isSirenMuted = false;

// Filter state for Nearby Places
let selectedCategory = 'all';
let selectedMaxRadius = 9999; // meters

/* --------------------------------------------------------------------------
   2. MOCK DATASETS (Realistic Facilities, Contacts, & Helplines)
   -------------------------------------------------------------------------- */

// Array of nearby emergency facilities
let nearbyFacilities = [
  {
    id: 1,
    name: "Indiranagar Police Station",
    type: "police",
    lat: 12.9732,
    lng: 77.5998,
    phone: "080-22942542",
    distance: 380, // meters
    status: "Open 24/7 • Armed Patrol on Duty",
    icon: "fa-shield-halved"
  },
  {
    id: 2,
    name: "Manipal Emergency Care Hospital",
    type: "hospital",
    lat: 12.9680,
    lng: 77.5910,
    phone: "080-25024444",
    distance: 620,
    status: "24/7 Trauma Center & Ambulance",
    icon: "fa-hospital"
  },
  {
    id: 3,
    name: "SafeStay 24/7 Women Transit Hub",
    type: "safehub",
    lat: 12.9745,
    lng: 77.5930,
    phone: "080-25251100",
    distance: 450,
    status: "Verified CCTV & Female Security Guard",
    icon: "fa-house-lock"
  },
  {
    id: 4,
    name: "Apollo 24/7 All-Night Pharmacy",
    type: "pharmacy",
    lat: 12.9705,
    lng: 77.5975,
    phone: "080-25289900",
    distance: 290,
    status: "Open All Night • Well Lit Entry",
    icon: "fa-prescription-bottle-medical"
  },
  {
    id: 5,
    name: "Ulsoor Lake Police Post (Pink Patrol)",
    type: "police",
    lat: 12.9780,
    lng: 77.6010,
    phone: "080-22942544",
    distance: 850,
    status: "Women Safety Hoysala Vehicle Stationed",
    icon: "fa-shield-halved"
  },
  {
    id: 6,
    name: "Chinmaya Mission Emergency Clinic",
    type: "hospital",
    lat: 12.9765,
    lng: 77.5895,
    phone: "080-25280449",
    distance: 980,
    status: "24/7 Casualty & Triage",
    icon: "fa-hospital"
  },
  {
    id: 7,
    name: "Metro Station Safe Zone Kiosk",
    type: "safehub",
    lat: 12.9752,
    lng: 77.5985,
    phone: "080-22969300",
    distance: 520,
    status: "Bangalore Metro Security Staffed",
    icon: "fa-house-lock"
  },
  {
    id: 8,
    name: "MedPlus 24x7 Night Chemist",
    type: "pharmacy",
    lat: 12.9660,
    lng: 77.5960,
    phone: "080-25298811",
    distance: 740,
    status: "Open 24/7 • Well-Lit Corner",
    icon: "fa-prescription-bottle-medical"
  }
];

// Array of user's trusted emergency contacts (Default initial list)
let emergencyContacts = [
  {
    name: "Sunita Sharma (Mom)",
    phone: "+91 98450 12345",
    relation: "Parent",
    isPrimary: true
  },
  {
    name: "Rajesh Sharma (Dad)",
    phone: "+91 98450 67890",
    relation: "Parent",
    isPrimary: false
  },
  {
    name: "Priya Nair (Roommate)",
    phone: "+91 97421 99887",
    relation: "Friend",
    isPrimary: false
  },
  {
    name: "Aditya Sharma (Brother)",
    phone: "+91 99002 44332",
    relation: "Sibling",
    isPrimary: false
  }
];

// Official 24/7 verified emergency helplines
const helplinesData = [
  {
    number: "112",
    title: "National Emergency Number",
    desc: "Single emergency number for Police, Fire, and Ambulance across India.",
    color: "#ef4444",
    icon: "fa-phone-volume"
  },
  {
    number: "1091",
    title: "Women Dedicated Helpline",
    desc: "24x7 dedicated emergency assistance for women in distress.",
    color: "#ec4899",
    icon: "fa-person-dress"
  },
  {
    number: "100",
    title: "Police Control Room (PCR)",
    desc: "Direct cellular dispatch to state police patrol vehicles.",
    color: "#3b82f6",
    icon: "fa-shield-halved"
  },
  {
    number: "102",
    title: "Ambulance Medical Services",
    desc: "Free 24/7 government emergency medical dispatch.",
    color: "#10b981",
    icon: "fa-truck-medical"
  },
  {
    number: "1090",
    title: "Women Power Line (Anti-Harassment)",
    desc: "Complaints and immediate intervention for stalkers or harassment.",
    color: "#8b5cf6",
    icon: "fa-handshake-angle"
  },
  {
    number: "181",
    title: "National Women Helpline (NCW)",
    desc: "Toll-free 24-hour national helpline by Ministry of Women and Child.",
    color: "#f59e0b",
    icon: "fa-building-columns"
  }
];

/* --------------------------------------------------------------------------
   3. APP INITIALIZATION (Runs when webpage loads)
   -------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', function () {
  console.log("SafeWay System Initialized - 1st Year B.Tech Project");

  // Load saved contacts from localStorage if present
  let savedContacts = localStorage.getItem('safeway_contacts');
  if (savedContacts) {
    try {
      emergencyContacts = JSON.parse(savedContacts);
    } catch (e) {
      console.warn("Could not parse saved contacts:", e);
    }
  }

  // Initialize UI Components
  initLeafletMap();
  renderPlacesList();
  renderEmergencyContacts();
  renderHelplinesGrid();
  updateContactCountBadge();
});

/* --------------------------------------------------------------------------
   4. NAVIGATION TAB SWITCHER
   -------------------------------------------------------------------------- */
function showPage(pageName) {
  currentPage = pageName;

  // 1. Hide all page sections
  let pages = document.querySelectorAll('.page-section');
  pages.forEach(function (sec) {
    sec.classList.remove('active');
  });

  // 2. Remove 'active' class from all tab buttons
  let tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(function (tab) {
    tab.classList.remove('active');
  });

  // 3. Show target page section
  let targetSection = document.getElementById('page-' + pageName);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // 4. Highlight target tab button
  let targetTab = document.getElementById('tab-' + pageName);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // 5. If switching to live map, trigger Leaflet re-calculation of container size
  if (pageName === 'livemap' && leafletMap) {
    setTimeout(function () {
      leafletMap.invalidateSize();
    }, 200);
  }
}

/* --------------------------------------------------------------------------
   5. INTERACTIVE LEAFLET MAP & GPS SENSING
   -------------------------------------------------------------------------- */
function initLeafletMap() {
  let mapContainer = document.getElementById('leaflet-map');
  if (!mapContainer) return;

  // Create Leaflet map centered at user location
  leafletMap = L.map('leaflet-map', {
    zoomControl: true,
    attributionControl: false
  }).setView([userLocation.lat, userLocation.lng], 15);

  // Add CartoDB Dark Matter tile layer for custom dark mode aesthetic
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(leafletMap);

  // Add Live User GPS Marker (Sky Blue pulsing circle)
  let userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position:relative; width:24px; height:24px;">
        <div style="position:absolute; width:24px; height:24px; border-radius:50%; background:rgba(56,189,248,0.4); animation:haloPulse 2s infinite;"></div>
        <div style="position:absolute; top:4px; left:4px; width:16px; height:16px; border-radius:50%; background:#0284c7; border:3px solid #ffffff; box-shadow:0 0 10px #38bdf8;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
    .addTo(leafletMap)
    .bindPopup(`<strong>Your Live GPS Location</strong><br>${userLocation.address}`);

  // Create layer group for facilities markers
  facilityMarkersLayer = L.layerGroup().addTo(leafletMap);

  // Render facility markers on map
  drawFacilityMarkers();
}

function drawFacilityMarkers() {
  if (!facilityMarkersLayer) return;
  facilityMarkersLayer.clearLayers();

  const colorMap = {
    police: '#3b82f6',   // Blue
    hospital: '#ef4444', // Red
    safehub: '#10b981',  // Green
    pharmacy: '#06b6d4'  // Cyan
  };

  nearbyFacilities.forEach(function (facility) {
    // Check if matches category filter
    if (selectedCategory !== 'all' && facility.type !== selectedCategory) {
      return;
    }
    // Check if matches radius filter
    if (facility.distance > selectedMaxRadius) {
      return;
    }

    let color = colorMap[facility.type] || '#38bdf8';

    let marker = L.circleMarker([facility.lat, facility.lng], {
      radius: 9,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    });

    let popupContent = `
      <div style="font-family:sans-serif; min-width:180px;">
        <strong style="color:${color}; font-size:14px;">${facility.name}</strong><br>
        <span style="font-size:12px; color:#475569;">${facility.status}</span><br>
        <div style="margin-top:6px; font-size:12px; font-weight:600;">Distance: ${facility.distance}m</div>
        <a href="tel:${facility.phone}" style="display:inline-block; margin-top:8px; background:${color}; color:#fff; padding:4px 10px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold;">
          📞 Call ${facility.phone}
        </a>
      </div>
    `;

    marker.bindPopup(popupContent);
    facilityMarkersLayer.addLayer(marker);
  });
}

// Request real GPS coordinates from browser Geolocation API
function detectLiveGPS() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser. Using simulated Bengaluru coordinates.");
    return;
  }

  showToast("Scanning GPS satellites for your real location...");

  navigator.geolocation.getCurrentPosition(
    function (position) {
      userLocation.lat = parseFloat(position.coords.latitude.toFixed(5));
      userLocation.lng = parseFloat(position.coords.longitude.toFixed(5));
      userLocation.address = "Live Verified GPS Location";

      // Update UI elements
      document.getElementById('liveLat').innerText = userLocation.lat;
      document.getElementById('liveLng').innerText = userLocation.lng;
      document.getElementById('emergencyCoords').innerText = `Lat: ${userLocation.lat}° N • Lng: ${userLocation.lng}° E • Accuracy: ±${Math.round(position.coords.accuracy)}m`;
      document.getElementById('gpsAccuracyTag').innerText = `Accuracy: ±${Math.round(position.coords.accuracy)}m`;
      document.getElementById('liveAddressText').innerText = "Live Verified Mobile Coordinates (GPS Active)";

      // Recalculate distance to nearby facilities
      nearbyFacilities.forEach(function (f) {
        f.distance = Math.round(calculateDistanceInMeters(userLocation.lat, userLocation.lng, f.lat, f.lng));
      });

      // Recenter map
      if (leafletMap && userMarker) {
        leafletMap.setView([userLocation.lat, userLocation.lng], 16);
        userMarker.setLatLng([userLocation.lat, userLocation.lng]);
        drawFacilityMarkers();
      }

      renderPlacesList();
      showToast("Live GPS Coordinates Acquired Successfully!");
    },
    function (error) {
      console.warn("Geolocation error:", error.message);
      showToast("GPS Permission Denied. Running in Bengaluru Simulation Mode.");
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// Simple Haversine formula to calculate distance between coordinates
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  let R = 6371e3; // Earth radius in meters
  let φ1 = lat1 * Math.PI / 180;
  let φ2 = lat2 * Math.PI / 180;
  let Δφ = (lat2 - lat1) * Math.PI / 180;
  let Δλ = (lon2 - lon1) * Math.PI / 180;

  let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function recenterMap() {
  if (leafletMap) {
    leafletMap.setView([userLocation.lat, userLocation.lng], 15);
    showToast("Map centered on your location");
  }
}

function shareLiveGPS() {
  let shareUrl = `https://safeway.app/track?lat=${userLocation.lat}&lng=${userLocation.lng}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(function () {
      showToast("Live GPS tracking link copied to clipboard!");
    }).catch(function () {
      prompt("Copy your live tracking link:", shareUrl);
    });
  } else {
    prompt("Copy your live tracking link:", shareUrl);
  }
}

/* --------------------------------------------------------------------------
   6. NEARBY FACILITIES FILTER & RENDERING
   -------------------------------------------------------------------------- */
function filterPlaces(category) {
  selectedCategory = category;

  // Update button active state
  let filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (btn) {
    btn.classList.remove('active');
    if (btn.innerText.toLowerCase().includes(category) || (category === 'all' && btn.innerText === 'All')) {
      btn.classList.add('active');
    }
  });

  renderPlacesList();
  drawFacilityMarkers();
}

function filterRadius(maxDist) {
  selectedMaxRadius = maxDist;

  let radiusBtns = document.querySelectorAll('.radius-btn');
  radiusBtns.forEach(function (btn) {
    btn.classList.remove('active');
    if (maxDist === 9999 && btn.innerText === 'All') btn.classList.add('active');
    if (maxDist === 500 && btn.innerText.includes('500m')) btn.classList.add('active');
    if (maxDist === 1000 && btn.innerText.includes('1km')) btn.classList.add('active');
    if (maxDist === 2500 && btn.innerText.includes('2.5km')) btn.classList.add('active');
  });

  renderPlacesList();
  drawFacilityMarkers();
}

function renderPlacesList() {
  let container = document.getElementById('placesListContainer');
  if (!container) return;

  // Filter facilities based on selected category & radius
  let filtered = nearbyFacilities.filter(function (facility) {
    let matchesCat = (selectedCategory === 'all' || facility.type === selectedCategory);
    let matchesDist = (facility.distance <= selectedMaxRadius);
    return matchesCat && matchesDist;
  });

  // Sort by distance (closest first)
  filtered.sort(function (a, b) {
    return a.distance - b.distance;
  });

  document.getElementById('placesCountBadge').innerText = `${filtered.length} Places Found`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:#94a3b8;">
        <i class="fa-solid fa-circle-question" style="font-size:28px; margin-bottom:8px;"></i>
        <p>No emergency facilities found matching this filter.</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(function (f) {
    html += `
      <div class="place-card" onclick="focusFacilityOnMap(${f.lat}, ${f.lng})">
        <div class="place-icon ${f.type}">
          <i class="fa-solid ${f.icon}"></i>
        </div>
        <div class="place-details">
          <div class="place-title">${f.name}</div>
          <div class="place-meta">
            <span><i class="fa-solid fa-location-dot"></i> ${f.distance}m</span>
            <span>&bull;</span>
            <span class="text-green">${f.status.split('•')[0]}</span>
          </div>
        </div>
        <a href="tel:${f.phone}" class="call-btn-mini" onclick="event.stopPropagation()">
          <i class="fa-solid fa-phone"></i> Call
        </a>
      </div>
    `;
  });

  container.innerHTML = html;
}

function focusFacilityOnMap(lat, lng) {
  if (leafletMap) {
    leafletMap.setView([lat, lng], 17);
  }
}

/* --------------------------------------------------------------------------
   7. SAFE ROUTE PLANNER (SAFE VS FAST DIRECT ROUTE)
   -------------------------------------------------------------------------- */
function selectRouteOption(type) {
  selectedRoute = type;

  let cardSafe = document.getElementById('card-route-safe');
  let cardFast = document.getElementById('card-route-fast');
  let navBtn = document.getElementById('startRouteNavBtn');
  let safeSvgPath = document.getElementById('svgSafeRoute');
  let fastSvgPath = document.getElementById('svgFastRoute');
  let flowSvgPath = document.getElementById('svgFlowAnimation');
  let scoreText = document.getElementById('safetyScoreText');
  let scoreNumber = document.getElementById('safetyScoreNumber');

  if (type === 'safe') {
    // Highlight Safe Route Card
    cardSafe.classList.add('active');
    cardFast.classList.remove('active');

    // Update SVG Paths
    safeSvgPath.setAttribute('stroke', '#10b981');
    safeSvgPath.setAttribute('stroke-width', '8');
    fastSvgPath.setAttribute('stroke', '#7f1d1d');
    fastSvgPath.setAttribute('stroke-width', '4');

    // Set animation along the safe route
    flowSvgPath.setAttribute('d', 'M 220 490 L 280 490 L 380 490 L 380 340 L 520 340 L 520 220 L 660 220 L 780 160');

    // Update Navbar Safety Score
    scoreText.innerText = "High Safety Zone • 96% Well-Lit";
    scoreNumber.innerText = "98%";

    // Update Start Button
    navBtn.className = "btn btn-emerald btn-lg w-100";
    navBtn.innerHTML = '<i class="fa-solid fa-location-arrow"></i> Start Journey on Safest Route (18 mins)';
  } else {
    // Highlight Fast Direct Route Card
    cardFast.classList.add('active');
    cardSafe.classList.remove('active');

    // Update SVG Paths
    fastSvgPath.setAttribute('stroke', '#ef4444');
    fastSvgPath.setAttribute('stroke-width', '8');
    safeSvgPath.setAttribute('stroke', '#064e3b');
    safeSvgPath.setAttribute('stroke-width', '4');

    // Set animation along the fast route
    flowSvgPath.setAttribute('d', 'M 220 490 L 340 410 L 440 380 L 580 290 L 700 230 L 780 160');

    // Update Navbar Safety Score
    scoreText.innerText = "Caution • 42% Well-Lit Shortcut";
    scoreNumber.innerText = "58%";

    // Update Start Button
    navBtn.className = "btn btn-red btn-lg w-100";
    navBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Start Journey on Direct Route (12 mins)';
  }
}

function startJourneyFromRoute() {
  let minutes = (selectedRoute === 'safe') ? 18 : 12;
  setTimerDuration(minutes);
  showPage('journey');
  startJourneyTimer();
}

/* --------------------------------------------------------------------------
   8. JOURNEY SAFETY TIMER & AUTOMATED CHECK-IN
   -------------------------------------------------------------------------- */
function setTimerDuration(mins) {
  journeyDurationMinutes = mins;
  journeyRemainingSeconds = mins * 60;
  document.getElementById('customTimerInput').value = mins;
  updateTimerDisplay();

  // Update preset buttons styling
  let presetBtns = document.querySelectorAll('.preset-time-buttons .btn');
  presetBtns.forEach(function (btn) {
    btn.classList.remove('active');
    if (btn.innerText.startsWith(mins + ' ')) {
      btn.classList.add('active');
    }
  });
}

function updateTimerDisplay() {
  let mins = Math.floor(journeyRemainingSeconds / 60);
  let secs = journeyRemainingSeconds % 60;
  let formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  document.getElementById('journeyClockDigits').innerText = formatted;
  document.getElementById('headerTimerDisplay').innerText = formatted;
}

function startJourneyTimer() {
  let customVal = parseInt(document.getElementById('customTimerInput').value);
  if (!isNaN(customVal) && customVal > 0) {
    journeyRemainingSeconds = customVal * 60;
  }

  isJourneyRunning = true;
  updateTimerDisplay();

  // Show active controls and hide idle setup controls
  document.getElementById('journeySetupControls').style.display = 'none';
  document.getElementById('journeyActiveControls').style.display = 'block';
  document.getElementById('headerTimerPill').style.display = 'flex';
  document.getElementById('journeyStatusTag').innerText = 'ACTIVE MONITORING';
  document.getElementById('journeyStatusTag').className = 'badge badge-emerald';

  // Clear existing timer if any
  if (journeyTimerInterval) clearInterval(journeyTimerInterval);

  // Start 1-second countdown interval
  journeyTimerInterval = setInterval(function () {
    if (journeyRemainingSeconds > 0) {
      journeyRemainingSeconds--;
      updateTimerDisplay();
    } else {
      // TIMER EXPIRED WITHOUT CHECK-IN! TRIGGER AUTO-ALERT
      clearInterval(journeyTimerInterval);
      isJourneyRunning = false;
      onJourneyTimerExpired();
    }
  }, 1000);

  showToast(`Safety Timer Started: ${Math.floor(journeyRemainingSeconds / 60)} minutes remaining.`);
}

function extendTimerMinutes(extraMins) {
  journeyRemainingSeconds += (extraMins * 60);
  updateTimerDisplay();
  showToast(`Extended travel time by +${extraMins} mins.`);
}

function checkInSafely() {
  if (journeyTimerInterval) clearInterval(journeyTimerInterval);
  isJourneyRunning = false;

  // Reset controls to standby
  document.getElementById('journeySetupControls').style.display = 'block';
  document.getElementById('journeyActiveControls').style.display = 'none';
  document.getElementById('headerTimerPill').style.display = 'none';
  document.getElementById('journeyStatusTag').innerText = 'STANDBY';
  document.getElementById('journeyStatusTag').className = 'badge badge-secondary';

  setTimerDuration(15);

  // Show Safe Arrival Banner
  document.getElementById('arrivalSuccessBanner').style.display = 'flex';
  setTimeout(function () {
    document.getElementById('arrivalSuccessBanner').style.display = 'none';
  }, 8000);

  showToast("Safe arrival confirmed! Emergency contacts notified.");
}

function cancelJourneyTimer() {
  if (confirm("Are you sure you want to cancel the journey safety timer?")) {
    if (journeyTimerInterval) clearInterval(journeyTimerInterval);
    isJourneyRunning = false;

    document.getElementById('journeySetupControls').style.display = 'block';
    document.getElementById('journeyActiveControls').style.display = 'none';
    document.getElementById('headerTimerPill').style.display = 'none';
    document.getElementById('journeyStatusTag').innerText = 'STANDBY';
    document.getElementById('journeyStatusTag').className = 'badge badge-secondary';

    setTimerDuration(15);
    showToast("Journey safety timer cancelled.");
  }
}

// Function triggered when timer reaches 00:00 without user check-in
function onJourneyTimerExpired() {
  document.getElementById('journeyAlertBanner').style.display = 'flex';
  document.getElementById('headerTimerPill').style.display = 'none';
  document.getElementById('journeyStatusTag').innerText = 'TIME EXPIRED';
  document.getElementById('journeyStatusTag').className = 'badge badge-red';

  // Play distress alarm sound to wake up user/surroundings
  startSirenSound();
  showToast("CRITICAL: Timer expired! Emergency contacts alerted.");
}

function dismissJourneyAlert() {
  document.getElementById('journeyAlertBanner').style.display = 'none';
  stopSirenSound();
  checkInSafely();
}

/* --------------------------------------------------------------------------
   9. EMERGENCY CONTACTS (CRUD OPERATIONS)
   -------------------------------------------------------------------------- */
function renderEmergencyContacts() {
  let container = document.getElementById('contactsListContainer');
  if (!container) return;

  container.innerHTML = '';

  emergencyContacts.forEach(function (contact, index) {
    let initial = contact.name.charAt(0).toUpperCase();

    let card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
      <div class="contact-avatar">${initial}</div>
      <div class="contact-details">
        <div class="contact-name">
          ${contact.name}
          ${contact.isPrimary ? '<span class="badge badge-emerald">Primary Guardian</span>' : ''}
          <span class="badge badge-secondary">${contact.relation}</span>
        </div>
        <div class="contact-phone"><i class="fa-solid fa-phone"></i> ${contact.phone}</div>
      </div>
      <div class="contact-actions">
        <a href="tel:${contact.phone}" class="btn btn-secondary" style="padding:6px 12px; font-size:0.8rem;">
          <i class="fa-solid fa-phone"></i> Call
        </a>
        <button class="btn btn-danger" style="padding:6px 10px;" onclick="deleteContact(${index})" title="Delete Contact">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  updateContactCountBadge();
}

function updateContactCountBadge() {
  let badge = document.getElementById('contactCount');
  if (badge) {
    badge.innerText = emergencyContacts.length;
  }
}

function openAddContactModal() {
  if (emergencyContacts.length >= 5) {
    alert("You have reached the limit of 5 trusted contacts for fast cellular broadcast.");
    return;
  }
  document.getElementById('addContactModal').style.display = 'flex';
}

function closeAddContactModal() {
  document.getElementById('addContactModal').style.display = 'none';
  document.getElementById('addContactForm').reset();
}

function saveNewContact(event) {
  event.preventDefault();

  let name = document.getElementById('inputContactName').value.trim();
  let phone = document.getElementById('inputContactPhone').value.trim();
  let relation = document.getElementById('inputContactRelation').value;

  if (!name || !phone) {
    alert("Please enter both Name and Phone Number.");
    return;
  }

  // Add new contact object
  emergencyContacts.push({
    name: name,
    phone: phone,
    relation: relation,
    isPrimary: (emergencyContacts.length === 0)
  });

  // Save to browser localStorage
  localStorage.setItem('safeway_contacts', JSON.stringify(emergencyContacts));

  renderEmergencyContacts();
  closeAddContactModal();
  showToast(`Added ${name} to your trusted emergency circle.`);
}

function deleteContact(index) {
  let contact = emergencyContacts[index];
  if (confirm(`Remove ${contact.name} from your trusted emergency circle?`)) {
    emergencyContacts.splice(index, 1);
    localStorage.setItem('safeway_contacts', JSON.stringify(emergencyContacts));
    renderEmergencyContacts();
    showToast("Contact removed.");
  }
}

/* --------------------------------------------------------------------------
   10. 24/7 HELPLINES DIRECTORY
   -------------------------------------------------------------------------- */
function renderHelplinesGrid() {
  let container = document.getElementById('helplinesGrid');
  if (!container) return;

  let html = '';
  helplinesData.forEach(function (h) {
    html += `
      <div class="helpline-card">
        <div class="helpline-top">
          <div class="helpline-icon" style="background:${h.color}22; color:${h.color};">
            <i class="fa-solid ${h.icon}"></i>
          </div>
          <div class="helpline-info">
            <h4>${h.title}</h4>
            <p>${h.desc}</p>
          </div>
        </div>
        <div class="helpline-bottom">
          <div class="helpline-number">${h.number}</div>
          <a href="tel:${h.number}" class="helpline-call-btn">
            <i class="fa-solid fa-phone"></i> Call Now
          </a>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* --------------------------------------------------------------------------
   11. ONE-TAP SOS EMERGENCY SYSTEM & GRACE PERIOD
   -------------------------------------------------------------------------- */
function startSOSCountdown() {
  // Open 5-second grace countdown modal
  document.getElementById('sosGraceModal').style.display = 'flex';
  sosGraceSeconds = 5;
  document.getElementById('graceCountdownNumber').innerText = sosGraceSeconds;

  // Clear any existing countdown
  if (sosGraceInterval) clearInterval(sosGraceInterval);

  sosGraceInterval = setInterval(function () {
    sosGraceSeconds--;
    document.getElementById('graceCountdownNumber').innerText = sosGraceSeconds;

    if (sosGraceSeconds <= 0) {
      clearInterval(sosGraceInterval);
      activateFullSOS();
    }
  }, 1000);
}

function cancelSOSGrace() {
  if (sosGraceInterval) clearInterval(sosGraceInterval);
  document.getElementById('sosGraceModal').style.display = 'none';
  showToast("SOS Trigger Cancelled (False Alarm Aborted).");
}

function activateFullSOS() {
  if (sosGraceInterval) clearInterval(sosGraceInterval);
  document.getElementById('sosGraceModal').style.display = 'none';

  // Show Fullscreen Active Emergency Overlay
  document.getElementById('emergencyOverlay').style.display = 'flex';

  // Start High-Decibel Web Audio Siren
  startSirenSound();

  // Try optional mock Java server SOS trigger
  sendSosToJavaServer();

  showToast("EMERGENCY SOS DISPATCHED: Telemetry broadcasted to Police & Contacts!");
}

function deescalateEmergency() {
  document.getElementById('emergencyOverlay').style.display = 'none';
  stopSirenSound();
  showToast("Emergency de-escalated. Siren stopped.");
}

// Optional fetch to notify local SafeWayServer.java if it is running
function sendSosToJavaServer() {
  try {
    fetch('/api/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: userLocation.lat,
        lng: userLocation.lng,
        timestamp: new Date().toISOString()
      })
    }).then(res => res.json()).then(data => {
      console.log("Java Server SOS Response:", data);
    }).catch(err => {
      // Safe to ignore if Java server is not running
      console.log("Java server not active (static mode active)");
    });
  } catch (e) {
    // Ignore error
  }
}

/* --------------------------------------------------------------------------
   12. WEB AUDIO API SYNTHESIZER (HIGH-DECIBEL EMERGENCY SIREN)
   -------------------------------------------------------------------------- */
function startSirenSound() {
  if (isSirenMuted) return;

  try {
    // Initialize Web Audio Context
    let AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    if (isSirenActive) return;

    // Create Oscillator and Gain (Volume) Nodes
    sirenOscillator = audioContext.createOscillator();
    sirenGainNode = audioContext.createGain();

    sirenOscillator.type = 'sawtooth'; // Piercing siren tone
    sirenOscillator.frequency.value = 650; // Starting at 650 Hz
    sirenGainNode.gain.value = 0.25; // Safe comfortable master volume

    sirenOscillator.connect(sirenGainNode);
    sirenGainNode.connect(audioContext.destination);

    sirenOscillator.start();
    isSirenActive = true;

    // Toggle frequency up and down every 350ms (Two-tone emergency siren)
    let highPitch = true;
    sirenPitchInterval = setInterval(function () {
      if (sirenOscillator && audioContext) {
        let now = audioContext.currentTime;
        let targetFreq = highPitch ? 980 : 620;
        sirenOscillator.frequency.cancelScheduledValues(now);
        sirenOscillator.frequency.linearRampToValueAtTime(targetFreq, now + 0.3);
        highPitch = !highPitch;
      }
    }, 350);

  } catch (err) {
    console.warn("Web Audio API not supported or blocked by browser policy:", err);
  }
}

function stopSirenSound() {
  if (sirenPitchInterval) {
    clearInterval(sirenPitchInterval);
    sirenPitchInterval = null;
  }

  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch (e) {}
    sirenOscillator = null;
  }

  isSirenActive = false;
}

function toggleSirenMute() {
  isSirenMuted = !isSirenMuted;
  let sirenIcon = document.getElementById('sirenIcon');
  let overlayBtnText = document.getElementById('overlaySirenBtnText');

  if (isSirenMuted) {
    stopSirenSound();
    if (sirenIcon) {
      sirenIcon.className = "fa-solid fa-volume-xmark";
    }
    if (overlayBtnText) {
      overlayBtnText.innerText = "Unmute Siren";
    }
    showToast("Distress siren muted.");
  } else {
    if (sirenIcon) {
      sirenIcon.className = "fa-solid fa-volume-high";
    }
    if (overlayBtnText) {
      overlayBtnText.innerText = "Mute Siren";
    }
    if (document.getElementById('emergencyOverlay').style.display === 'flex' ||
        document.getElementById('journeyAlertBanner').style.display === 'flex') {
      startSirenSound();
    }
    showToast("Distress siren enabled.");
  }
}

/* --------------------------------------------------------------------------
   13. TOAST NOTIFICATION UTILITY
   -------------------------------------------------------------------------- */
let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById('appToast');
  let text = document.getElementById('toastMessage');
  if (!toast || !text) return;

  text.innerText = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function () {
    toast.classList.remove('show');
  }, 3500);
}
