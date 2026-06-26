const ws = new WebSocket('ws://localhost:3000'); 

// Elemen DOM
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

// 1. Inisialisasi Peta Leaflet dengan tema gelap agar garis warna menyala
const map = L.map('map').setView([-6.2088, 106.8456], 17); // Zoom diperbesar agar garis terlihat jelas

// Menggunakan basemap CartoDB Dark Matter agar mirip background Matplotlib yang kontras
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

const marker = L.marker([-6.2088, 106.8456]).addTo(map);

// Variabel untuk menyimpan titik kordinat sebelumnya (mirip logika segments di Python)
let previousLatLng = null;

// 2. Fungsi Colormap (Meniru profil 'Plasma' di Matplotlib)
function getSpeedColor(speed) {
    // Sesuaikan rentang batas kecepatan (km/jam) ini dengan top speed kendaraan Anda
    if (speed > 120) return '#f0f921'; // Kuning (Sangat Cepat)
    if (speed > 95)  return '#fdca26'; // Oranye Terang
    if (speed > 70)  return '#fb9f3a'; // Oranye
    if (speed > 50)  return '#ed7953'; // Merah Muda / Coral
    if (speed > 30)  return '#cc4678'; // Magenta
    if (speed > 15)  return '#9c179e'; // Ungu
    return '#0d0887';                  // Biru Tua (Lambat / Berhenti)
}

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

    // 3. Mode Maps & GPS (Visualisasi Jalur Berwarna)
    if (data.type === 'gps') {
        const lat = data.latitude;
        const lng = data.longitude;
        const speed = data.speed; // Pastikan data JSON dari mikrokontroler menyertakan parameter 'speed'
        
        const currentLatLng = [lat, lng];

        latVal.innerText = lat.toFixed(5);
        lngVal.innerText = lng.toFixed(5);
        
        marker.setLatLng(currentLatLng);
        map.panTo(currentLatLng);

        // Gambar segmen garis dari titik sebelumnya ke titik saat ini
        if (previousLatLng) {
            L.polyline([previousLatLng, currentLatLng], {
                color: getSpeedColor(speed), // Warnai berdasarkan kecepatan
                weight: 8,                   // Ketebalan garis (mirip linewidth di Python)
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map);
        }
        
        // Simpan titik saat ini sebagai titik awal untuk data berikutnya
        previousLatLng = currentLatLng;
    }
};
