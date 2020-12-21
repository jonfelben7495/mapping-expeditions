import './style.css'
import L from 'leaflet'
import { Draw } from 'leaflet-draw'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import Shadow from 'leaflet/dist/images/marker-shadow.png'
let myIcon = L.icon({
    iconUrl: marker,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: Shadow,
    shadowSize: [41, 41]
});

function component() {
    const element = document.createElement('div');

    element.id = 'map';

    return element;
}

async function initMap() {
    let map = L.map('map', {worldCopyJump: true}).setView({lon: 0, lat: 0}, 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 2,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    let drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    let lastSequence = await getLastSequenceOfRoute();

    map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
            layer = e.layer;
        map.addLayer(layer);
        layer.addTo(drawnItems)
        for (let i = lastSequence; i < lastSequence + layer._latlngs.length; i++) {
            sendRoute(i+1, layer._latlngs[i - lastSequence].lat,layer._latlngs[i - lastSequence].lng);
        }
        loadExpedition(map)
    });

    L.control.scale().addTo(map);

    return map;
}

async function getExpedition() {
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/loadExpedition.php?q=1");
    return result;
}

async function getExpeditionRoute() {
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/loadRoute.php?q=1");
    return result;
}

async function getLastSequenceOfRoute(){
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastSequence.php?q=1");
    result = JSON.parse(result)[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

async function sendRoute(seq, lat, lng){
    let obj = {
        "exp_id": 1,
        "sequence": seq,
        "lat": lat,
        "lng": lng
    }
    sendRequest("http://mapping-expeditions.de/api/saveRoute.php",obj)

}

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

async function sendRequest(url, data){
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data)
    })
    return response
}

async function loadExpedition(map) {
    let expeditionData = await getExpedition()
    let expeditionRoute = await getExpeditionRoute();
    expeditionData = JSON.parse(expeditionData);
    expeditionRoute = JSON.parse(expeditionRoute);
    expeditionData.sort(compareBySequence);
    expeditionRoute.sort(compareBySequence);

    let markers = []
    for (let i = 0; i < expeditionData.length; i++) {
        let marker = L.marker([expeditionData[i].latitude, expeditionData[i].longitude], {icon: myIcon}).addTo(map)
        marker.bindPopup(expeditionData[i].name + "<br/>" + expeditionData[i].sequence + ". Station von <i>" + expeditionData[i].exp_name + "</i>")
        markers.push(marker)
    }

    let expeditionCoordinates = [];
    let crossDateLine;
    for (let i = 0; i < expeditionData.length; i++) {
        expeditionCoordinates.push([expeditionData[i].latitude, expeditionData[i].longitude])
        if(expeditionData[i+1]) {
            let long1 = parseFloat(expeditionData[i].longitude);
            let long2 = parseFloat(expeditionData[i+1].longitude);
            let diff = long1 - long2;
            if (Math.abs(diff) > 180) {
                let latitude = calculateLatForDateline(expeditionData[i], expeditionData[i+1])
                expeditionCoordinates.push([latitude, -180])
                expeditionCoordinates.push([latitude, 180])
                crossDateLine = i+2;
            }
        }
    }

    if (crossDateLine !== "") {
        let expeditionCoordinates2 = expeditionCoordinates.slice(crossDateLine)
        expeditionCoordinates = expeditionCoordinates.slice(0, crossDateLine)
        expeditionCoordinates = [expeditionCoordinates, expeditionCoordinates2]
    }

    let expeditionRouteCoordinates = [];
    for (let i = 0; i < expeditionRoute.length; i++){
        expeditionRouteCoordinates.push([expeditionRoute[i].lat, expeditionRoute[i].lng]);
    }

    let polyline = L.polyline(expeditionRouteCoordinates, {color: 'red'}).addTo(map)

    copyAllLayers(map, expeditionCoordinates, expeditionRouteCoordinates)
}

function compareBySequence(a, b) {
    a = parseInt(a.sequence);
    b = parseInt(b.sequence);
    if ( a < b){
        return -1;
    }
    if ( a > b ){
        return 1;
    }
    return 0;
}

function copyAllLayers(map, coordinates, routeCoordinates){
    map.eachLayer(function (layer){
        if (layer._latlng){
            let markerPlus360 = L.marker([layer._latlng.lat,layer._latlng.lng+360], {icon: myIcon}).addTo(map)
            markerPlus360.bindPopup(layer._popup._content)
            let markerMinus360 = L.marker([layer._latlng.lat,layer._latlng.lng-360], {icon: myIcon}).addTo(map)
            markerMinus360.bindPopup(layer._popup._content)
        }
        if (layer._path) {
            let coordinatesPlus360 = [];
            let coordinatesMinus360 = [];
            if(Array.isArray(routeCoordinates)) {
                for (let i=0; i < routeCoordinates.length; i++){
                    let plus360 = JSON.parse(JSON.stringify(routeCoordinates[i]));
                    plus360 = copyPath(plus360, 360)

                    let minus360 = JSON.parse(JSON.stringify(routeCoordinates[i]));
                    minus360 = copyPath(minus360, -360)

                    coordinatesPlus360.push(plus360);
                    coordinatesMinus360.push(minus360);
                }
                L.polyline(coordinatesPlus360, {color: 'red'}).addTo(map)
                L.polyline(coordinatesMinus360, {color: 'red'}).addTo(map)
            } else {
                let plus360 = JSON.parse(JSON.stringify(routeCoordinates));
                plus360 = copyPath(plus360, 360)

                let minus360 = JSON.parse(JSON.stringify(routeCoordinates));
                minus360 = copyPath(minus360, -360)

                coordinatesPlus360.push(plus360);
                coordinatesMinus360.push(minus360);
            }
        }


    })
}

function copyPath(array, addLong) {
    for (let i=0; i < array.length; i++){
        array[i] = parseFloat(array[i]) + addLong;
    }
    return array;
}

function calculateLatForDateline(coordinate1, coordinate2){
    let x0 = Math.cos(coordinate1.longitude) * Math.sin(coordinate1.latitude);
    let y0 = Math.sin(coordinate1.longitude) * Math.sin(coordinate1.latitude);
    let z0 = Math.cos(coordinate1.latitude);
    let x1 = Math.cos(coordinate2.longitude) * Math.sin(coordinate2.latitude);
    let y1 = Math.sin(coordinate2.longitude) * Math.sin(coordinate2.latitude);
    let z1 = Math.cos(coordinate2.latitude);
    let t = y1 / (y1-y0);
    let x = t * x0 + (1-t) * x1;
    let z = t * z0 + (1-t) * z1;
    return Math.atan(z / x);
}

document.body.appendChild(component());
let map = await initMap();
loadExpedition(map)