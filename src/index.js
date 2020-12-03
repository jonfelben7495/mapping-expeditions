import './style.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

function component() {
    const element = document.createElement('div');

    element.id = 'map';

    return element;
}

function initMap() {
    let map = L.map('map').setView({lon: 0, lat: 0}, 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    L.control.scale().addTo(map);
}

document.body.appendChild(component());
initMap()