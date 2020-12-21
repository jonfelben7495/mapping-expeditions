import './style.css'
import L from 'leaflet'
import { Draw } from 'leaflet-draw'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import Shadow from 'leaflet/dist/images/marker-shadow.png'
import {addDrawEventListener, initDrawControl} from "./draw";
import {loadExpedition} from "./expedition";
let myIcon = L.icon({
    iconUrl: marker,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: Shadow,
    shadowSize: [41, 41]
});

function initApp(id){
    createMapObject(id);
    let mapObject = initMapObject(id);
    let drawnItems = initDrawControl(mapObject);
    addDrawEventListener(mapObject, drawnItems)

    loadExpedition(1, mapObject)
}

function createMapObject(id){
    const mapObject = document.createElement('div');
    mapObject.id = id;
    document.body.appendChild(mapObject);
}

function initMapObject(id){
    let map = L.map(id, {worldCopyJump: false}).setView({lon: 0, lat: 0}, 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 2,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    L.control.scale().addTo(map);

    return map;
}

initApp('map')