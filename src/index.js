import './style.css'
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl;
import { Draw } from 'leaflet-draw'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import Shadow from 'leaflet/dist/images/marker-shadow.png'
import {addDrawEventListener, initDrawControl} from "./draw";
import {loadExpedition} from "./expedition";
import {createSubmitButton} from "./interface";
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function initApp(id){
    createMapObject(id);
    createInterface()
    let mapObject = initMapObject(id);
    let drawnItems = initDrawControl(mapObject);
    addDrawEventListener(mapObject, drawnItems);

    loadExpedition(1, mapObject)
}

function createMapObject(id){
    const mapObject = document.createElement('div');
    mapObject.id = id;
    document.body.appendChild(mapObject);
}

function createInterface(){
    createSubmitButton('button-submit', 'Speichern')
}

function initMapObject(id){
    let map = L.map(id, {worldCopyJump: true}).setView({lon: 0, lat: 0}, 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 2,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    L.control.scale().addTo(map);

    return map;
}

initApp('map')