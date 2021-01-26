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
import {
    createAddToExpeditionButton,
    createNewExpeditionButton, createNewExpeditionForm,
    createNewPlaceForm,
    createSubmitButton
} from "./interface";
import {getLastExpeditionId} from "./apiCalls";
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

async function initApp(mapid, appid){
    createApp(appid);
    createMapObject(mapid, appid);
    let mapObject = initMapObject(mapid);
    createInterface(mapObject, appid, 'interface')
    createInfoContainer(appid);
    let lastExpeditionId = await getLastExpeditionId();

    for (let i = 1; i <= lastExpeditionId; i++) {
        loadExpedition(i, mapObject)
    }
}

function createApp(id){
    const app = document.createElement('div');
    app.id = id;
    document.body.appendChild(app);
}

function createInfoContainer(appid){
    const container = document.createElement('div');
    container.id = "info-container";

    const expContainer = document.createElement('div');
    expContainer.id = "info-container-exp";

    const placeContainer = document.createElement('div');
    placeContainer.id = "info-container-place";

    const infoExpName = document.createElement('h2');
    infoExpName.classList.add("info-container-exp-name");

    const infoExpStart = document.createElement('p');
    infoExpStart.classList.add("info-container-exp-start");

    const infoExpEnd = document.createElement('p');
    infoExpEnd.classList.add("info-container-exp-end");

    const infoExpLeader = document.createElement('p');
    infoExpLeader.classList.add("info-container-exp-leader");

    const infoPlaceName = document.createElement('h2');
    infoPlaceName.classList.add("info-container-place-name");

    const infoPlaceSeq = document.createElement('p');
    infoPlaceSeq.classList.add("info-container-place-seq");

    const infoPlaceDate = document.createElement('p');
    infoPlaceDate.classList.add("info-container-place-date");

    const infoPlaceText = document.createElement('p');
    infoPlaceText.classList.add("info-container-place-text");

    const infoPlaceSrc = document.createElement('p');
    infoPlaceSrc.classList.add("info-container-place-src");

    const infoPlaceImages = document.createElement('div');
    infoPlaceImages.classList.add("info-container-place-images");

    expContainer.appendChild(infoExpName)
    expContainer.appendChild(infoExpStart)
    expContainer.appendChild(infoExpEnd)
    expContainer.appendChild(infoExpLeader)
    placeContainer.appendChild(infoPlaceName)
    placeContainer.appendChild(infoPlaceSeq)
    placeContainer.appendChild(infoPlaceDate)
    placeContainer.appendChild(infoPlaceText)
    placeContainer.appendChild(infoPlaceSrc)
    placeContainer.appendChild(infoPlaceImages)

    container.appendChild(expContainer);
    container.appendChild(placeContainer);

    const app = document.getElementById(appid);
    app.appendChild(container);
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
    const submitButton = createSubmitButton('button-submit', 'Speichern');
    const newExpeditionForm = createNewExpeditionForm();
    const newPlaceForm = createNewPlaceForm();
    const forms = document.createElement('div');
    forms.id = "forms"
    forms.appendChild(newExpeditionForm)
    forms.appendChild(newPlaceForm)

    const app = document.getElementById(appid);
    userInterface.appendChild(newExpButton);
    userInterface.appendChild(addToExpButton);
    userInterface.appendChild(submitButton);
    userInterface.appendChild(forms);
    app.appendChild(userInterface)
}

function initMapObject(id){
    let map = L.map(id, {worldCopyJump: true}).setView({lon: 0, lat: 0}, 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 2,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    let southWest = L.latLng(-90, -Infinity),
        northEast = L.latLng(90, Infinity);
    let bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
    });

    L.control.scale().addTo(map);

    return map;
}

await initApp('map', 'application')