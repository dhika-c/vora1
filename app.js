const ws = new WebSocket('ws://localhost:3000'); // Sesuaikan dengan URL server backend Anda jika online

// Elemen DOM yang baru
const connectionStatus = document.getElementById('connection-status');
const connectionIndicator = document.getElementById('connection-indicator');
const dragDistance = document.getElementById('drag-distance');
const dragSpeed = document.getElementById('drag-speed');
const dragTime = document.getElementById('drag-time');
const currentLapSpan = document.getElementById('current-lap');
const lapCurrentTime = document.getElementById('lap-current-time');
const lapList = document.getElementById('lap-list');
const latVal = document.getElementById('lat-val');
const lngVal = document.getElementById('lng-val');

// Inisialisasi Peta Leaflet
const map = L.map('map').setView([-6.2088, 106.8456], 15); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const marker = L.marker([-6.2088, 106.8456]).addTo(map);

ws.onopen = () => {
    connectionStatus.innerText = 'Tersambung';
    connectionStatus.className = 'text-emerald-400 font-semibold';
    connectionIndicator.className = 'w-4 h-4 rounded-full bg-emerald-500 animate-pulse';
};

ws.onclose = () => {
    connectionStatus.innerText = 'Terputus';
    connectionStatus.className = 'text-red-400 font-semibold';
    connectionIndicator.className = 'w-4 h-4 rounded-full bg-red-500';
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Mode Drag Meter
    if (data.type === 'drag') {
        dragDistance.innerText = data.distance;
        dragSpeed.innerText = data.speed;
        dragTime.innerText = data.time;
    }

    // Mode Lap Timer
    if (data.type === 'lap') {
        currentLapSpan.innerText = data.lapNumber;
        lapCurrentTime.innerText = data.lapTime;
        
        if(data.isCompleted) {
            if(lapList.innerHTML.includes('Belum ada data lap')) {
                lapList.innerHTML = '';
            }
            const li = document.createElement('li');
            li.className = "flex justify-between bg-slate-950 px-3 py-2 rounded-lg font-mono text-sm border border-slate-800";
            li.innerHTML = `<span>LAP ${data.lapNumber}</span> <span class="text-emerald-400 font-bold">${data.lapTime}</span>`;
            lapList.appendChild(li);
        }
    }

    // Mode Maps & GPS
    if (data.type === 'gps') {
        const lat = data.latitude;
        const lng = data.longitude;
        
        latVal.innerText = lat.toFixed(5);
        lngVal.innerText = lng.toFixed(5);
        
        marker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
    }
};
