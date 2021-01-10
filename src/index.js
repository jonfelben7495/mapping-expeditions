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
import {createAddToExpeditionButton, createNewExpeditionButton, createSubmitButton} from "./interface";
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function initApp(mapid, appid){
    createApp(appid);
    createMapObject(mapid, appid);
    let mapObject = initMapObject(mapid);
    createInterface(mapObject, appid, 'interface')

    loadExpedition(1, mapObject)
}

function createApp(id){
    const app = document.createElement('div');
    app.id = id;
    document.body.appendChild(app);
}

function createMapObject(mapid, appid){
    const mapObject = document.createElement('div');
    mapObject.id = mapid;

    const app = document.getElementById(appid);
    app.appendChild(mapObject);
}

function createInterface(map, appid, interfaceid){
    const userInterface = document.createElement('div');
    userInterface.id = interfaceid;
    const newExpButton = createNewExpeditionButton('button-newExpedition', 'Neue Expedition anlegen', map, interfaceid);
    const addToExpButton = createAddToExpeditionButton('button-addToExpedition', 'Zu bestehender Expedition hinzufügen', map, interfaceid)
    const submitButton = createSubmitButton('button-submit', 'Speichern')

    const app = document.getElementById(appid);
    userInterface.appendChild(newExpButton);
    userInterface.appendChild(addToExpButton);
    userInterface.appendChild(submitButton);
    app.appendChild(userInterface)
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

initApp('map', 'application')