import './style.css'
import L from 'leaflet'
import { Draw } from 'leaflet-draw'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import Shadow from 'leaflet/dist/images/marker-shadow.png'
import {
    getLastMarkerSequence,
    getLastPlaceId,
    getLastSequenceOfRoute, sendExpedition,
    sendMarker,
    sendPlace,
    sendRoute
} from "./apiCalls";
import {loadExpeditionRoute} from "./expedition";


export function initDrawControl(map, markerIcon){
    let drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
        draw: {
          polygon: false,
          rectangle: false,
          circle: false,
          circlemarker: false
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    return drawnItems;
}

export function addDrawEventListener(map, drawnItems, expeditionId, isNewExpedition){
    const submitButton = document.getElementById('button-submit');
    map.on('draw:created', async function (e) {
        let type = e.layerType,
            layer = e.layer;
        layer.type = type;
        map.addLayer(layer);
        layer.addTo(drawnItems)
    });

    map.on('draw:drawstop', function (e) {
        submitButton.classList.remove("hide")
    })

    submitButton.addEventListener('click', async function () {
        let layers = drawnItems._layers;
        let lines = [], markers = [], lineCoordinates = [], markerCoordinates = [];

        sortLayers(markers, lines, layers);

        for (let i = 0; i < markers.length; i++) {
            markerCoordinates.push(markers[i]._latlng);
        }

        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i]._latlngs.length; j++) {
                lineCoordinates.push(lines[i]._latlngs[j]);
            }
        }

        if(isNewExpedition){
            await addNewExpedition(expeditionId, markerCoordinates, lineCoordinates, map)
        } else {
            await addToExistingExpedition(expeditionId, markerCoordinates, lineCoordinates, map)
        }
    })
}

async function addNewExpedition(expeditionId, markerCoordinates, lineCoordinates, map){
    let lastPlaceId = await getLastPlaceId();
    let lastMarkerSequence = 0;
    let lastRouteSequence = 0;
    let expeditionName = document.getElementById("newExpedition-name").value;
    let expeditionLeader = document.getElementById("newExpedition-leader").value;
    let expeditionStart = document.getElementById("newExpedition-startDate").value;
    let expeditionEnd = document.getElementById("newExpedition-endDate").value;

    await sendExpedition(expeditionId,expeditionName,expeditionLeader,expeditionStart,expeditionEnd);

    if(markerCoordinates.length > 0){
        for (let i = 0; i < markerCoordinates.length; i++){
            await sendPlace(lastPlaceId+i+1,"Place", markerCoordinates[i].lat, markerCoordinates[i].lng)
            await sendMarker(expeditionId, lastPlaceId+i+1, lastMarkerSequence+i+1)
        }
    }

    if(lineCoordinates.length > 0){
        for (let i = lastRouteSequence; i < lastRouteSequence + lineCoordinates.length; i++){
            await sendRoute(expeditionId, i + 1, lineCoordinates[i - lastRouteSequence].lat, lineCoordinates[i - lastRouteSequence].lng)
        }
    }

    await loadExpeditionRoute(expeditionId, map)
}

async function addToExistingExpedition(expeditionId, markerCoordinates, lineCoordinates, map){
    let lastMarkerSequence = await getLastMarkerSequence(expeditionId);
    let lastPlaceId = await getLastPlaceId()
    let lastRouteSequence = await getLastSequenceOfRoute(expeditionId);

    if(markerCoordinates.length > 0){
        for (let i = 0; i < markerCoordinates.length; i++){
            await sendPlace(lastPlaceId+i+1,"Place", markerCoordinates[i].lat, markerCoordinates[i].lng)
            await sendMarker(expeditionId, lastPlaceId+i+1, lastMarkerSequence+i+1)
        }
    }

    if(lineCoordinates.length > 0){
        for (let i = lastRouteSequence; i < lastRouteSequence + lineCoordinates.length; i++){
            await sendRoute(expeditionId, i + 1, lineCoordinates[i - lastRouteSequence].lat, lineCoordinates[i - lastRouteSequence].lng)
        }
    }

    await loadExpeditionRoute(expeditionId, map)
}

function sortLayers(markers, lines, layers){
    for (let i = 0; i < Object.keys(layers).length; i++) {
        if (Object.values(layers)[i].type === "marker") {
            markers.push(Object.values(layers)[i]);
        } else if (Object.values(layers)[i].type === "polyline") {
            lines.push(Object.values(layers)[i]);
        }
    }
}