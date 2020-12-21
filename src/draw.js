import './style.css'
import L from 'leaflet'
import { Draw } from 'leaflet-draw'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import Shadow from 'leaflet/dist/images/marker-shadow.png'
import {getLastSequenceOfRoute, sendRoute} from "./apiCalls";
import {loadExpeditionRoute} from "./expedition";

export function initDrawControl(map){
    let drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    return drawnItems;
}

export function addDrawEventListener(map, drawnItems){
    map.on(L.Draw.Event.CREATED, async function (e) {
        let activeExpedition = 1;
        let lastSequence = await getLastSequenceOfRoute(activeExpedition);

        let type = e.layerType,
            layer = e.layer;
        map.addLayer(layer);
        layer.addTo(drawnItems)
        for (let i = lastSequence; i < lastSequence + layer._latlngs.length; i++) {
            sendRoute(activeExpedition, i + 1, layer._latlngs[i - lastSequence].lat, layer._latlngs[i - lastSequence].lng)
        }
        loadExpeditionRoute(activeExpedition, map)
    });
}