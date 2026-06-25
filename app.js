const ws = new WebSocket('ws://localhost:3000');

// Elemen DOM
const statusSpan = document.getElementById('connection-status');
const dragDistance = document.getElementById('drag-distance');
const dragSpeed = document.getElementById('drag-speed');
const dragTime = document.getElementById('drag-time');
const currentLapSpan = document.getElementById('current-lap');
const lapCurrentTime = document.getElementById('lap-current-time');
const lapList = document.getElementById('lap-list');
const liveCoords = document.getElementById('live-coords');

// Inisialisasi Peta menggunakan Leaflet.js
const map = L.map('map').setView([-6.2088, 106.8456], 15); // Koordinat contoh (Jakarta)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const marker = L.marker([-6.2088, 106.8456]).addTo(map);

ws.onopen = () => {
    statusSpan.innerText = 'Connected';
    statusSpan.style.color = 'green';
};

ws.onclose = () => {
    statusSpan.innerText = 'Disconnected';
    statusSpan.style.color = 'red';
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Pembaruan Mode Drag Meter
    if (data.type === 'drag') {
        dragDistance.innerText = data.distance;
        dragSpeed.innerText = data.speed;
        dragTime.innerText = data.time;
    }

    // Pembaruan Mode Lap Timer
    if (data.type === 'lap') {
        currentLapSpan.innerText = data.lapNumber;
        lapCurrentTime.innerText = data.lapTime;
        
        if(data.isCompleted) {
            if(lapList.innerHTML.includes('Belum ada data lap')) {
                lapList.innerHTML = '';
            }
            const li = document.createElement('li');
            li.innerText = `Lap ${data.lapNumber}: ${data.lapTime}`;
            lapList.appendChild(li);
        }
    }

    // Pembaruan Mode Maps & GPS Tracking
    if (data.type === 'gps') {
        const lat = data.latitude;
        const lng = data.longitude;
        
        liveCoords.innerText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        marker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
    }
};
