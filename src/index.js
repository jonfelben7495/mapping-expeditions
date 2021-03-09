import './style.css'
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl;
import { Draw } from 'leaflet-draw'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import Shadow from 'leaflet/dist/images/marker-shadow.png'
import {addDrawEventListener, drawAllExpeditions, initDrawControl} from "./draw";
import {loadExpedition} from "./expedition";
import {
    createAddToExpeditionButton, createCancelButton, createExplanationText,
    createNewExpeditionButton, createNewExpeditionForm,
    createNewPlaceForm,
    createSubmitButton
} from "./interface";
import {getLastExpeditionId} from "./apiCalls";
import {getColorForExpedition} from "./utilities";
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * Initiates the apps and creates all features.
 * @param {string} mapid - ID of the map container
 * @param {string} appid - ID of the whole application container
 */
async function initApp(mapid, appid){
    createApp(appid);
    createMapObject(mapid, appid);
    let mapObject = initMapObject(mapid);
    let lastExpeditionId = await getLastExpeditionId();
    let addedExpeditions = await drawAllExpeditions(lastExpeditionId, mapObject)

    createInterface(mapObject, appid, 'interface', addedExpeditions)
    createInfoContainer(appid);

    createLegend(mapObject, addedExpeditions)
}

/**
 * Creates a container for the whole app.
 * @param {string} id - ID of the whole application container
 */
function createApp(id){
    const app = document.createElement('div');
    app.id = id;
    document.body.appendChild(app);
}

/**
 * Creates a container for the info container, in which information regarding expeditions and markers can be displayed.
 * @param {string} appid - ID of the whole application container
 */
function createInfoContainer(appid){
    const container = document.createElement('div');
    container.id = "info-container";
    container.classList.add("hide")

    const close = document.createElement('span');
    close.classList.add("info-container-close");
    close.innerHTML = "&times;"
    close.addEventListener("click", function (){
        container.classList.add("hide")
    })

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

    container.appendChild(close)
    container.appendChild(expContainer);
    container.appendChild(placeContainer);

    const app = document.getElementById(appid);
    app.appendChild(container);
}

/**
 * Creates a map object and appends it to the app.
 * @param {string} mapid - ID of the map container
 * @param {string} appid - ID of the whole app container
 */
function createMapObject(mapid, appid){
    const mapObject = document.createElement('div');
    mapObject.id = mapid;

    const app = document.getElementById(appid);
    app.appendChild(mapObject);
}

/**
 * Creates the user interface, which can be used to add or edit expeditions.
 * @param {Object} map - the leaflet map object
 * @param {string} appid - ID of the whole app container
 * @param {string} interfaceid - ID of the interface container
 * @param {array} expeditions - Array of all loaded expeditions
 */
function createInterface(map, appid, interfaceid, expeditions){
    const userInterface = document.createElement('div');
    userInterface.id = interfaceid;
    const newExpButton = createNewExpeditionButton('button-newExpedition', 'Add new expedition', map, interfaceid);
    const addToExpButton = createAddToExpeditionButton('button-addToExpedition', 'Edit existing expedition', map, interfaceid, expeditions)
    const cancelButton = createCancelButton('button-cancel', 'Cancel', map)
    const submitButton = createSubmitButton('button-submit', 'Save');
    const explanation = createExplanationText();
    const newExpeditionForm = createNewExpeditionForm();
    const newPlaceForm = createNewPlaceForm();
    const imagesForms = document.createElement('div');
    imagesForms.id = "images-forms"
    imagesForms.classList.add("hide")
    const forms = document.createElement('div');
    forms.id = "forms"
    forms.appendChild(newExpeditionForm)
    forms.appendChild(newPlaceForm)
    forms.appendChild(imagesForms)

    const app = document.getElementById(appid);
    userInterface.appendChild(newExpButton);
    userInterface.appendChild(addToExpButton);
    userInterface.appendChild(cancelButton);
    userInterface.appendChild(submitButton);
    userInterface.appendChild(explanation)
    userInterface.appendChild(forms);
    app.appendChild(userInterface)
}

/**
 * Creates and fills the legend of the map.
 * @param {Object} map - the leaflet map object
 * @param {array} expeditions - Array of all loaded expeditions
 */
function createLegend(map, expeditions){
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend')

        for (let i = 0; i < expeditions.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColorForExpedition(expeditions[i][1].expId - 1) + '"></i> ' + expeditions[i][1].expName + '<br/>';
        }

        return div;
    };

    legend.addTo(map)
}

/**
 * Updates the content of the legend of the map.
 * @param {Object} map - the leaflet map object
 * @param {array} expeditions - Array of all loaded expeditions
 */
export function updateLegend(map, expeditions){
    let legend = document.getElementsByClassName("legend")[0];
    for (let i = 0; i < expeditions.length; i++) {
        legend.innerHTML +=
            '<i style="background:' + getColorForExpedition(expeditions[i][1].expId - 1) + '"></i> ' + expeditions[i][1].expName + '<br/>';
    }
}

/**
 * Initiates the leaflet map object.
 * @param {string} id - The id of the container into which the map will be rendered.
 */
function initMapObject(id){
    let map = L.map(id, {worldCopyJump: true, editable: true}).setView({lon: 0, lat: 10}, 3);

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