import './style.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
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

function initMap() {
    let map = L.map('map', {worldCopyJump: true}).setView({lon: 0, lat: 0}, 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 2,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    L.control.scale().addTo(map);

    return map;
}

async function getData() {
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/test.php?q=1");
    return result;
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

async function loadExpedition(map) {
    let data = await getData()
    data = JSON.parse(data);
    data.sort(compareBySequence);

    let markers = []
    for (let i = 0; i < data.length; i++) {
        let marker = L.marker([data[i].latitude, data[i].longitude], {icon: myIcon}).addTo(map)
        marker.bindPopup(data[i].name)
        markers.push(marker)
    }

    let coordinates = [];
    let crossDateLine;
    for (let i = 0; i < data.length; i++) {
        coordinates.push([data[i].latitude, data[i].longitude])
        if(data[i+1]) {
            let long1 = parseFloat(data[i].longitude);
            let long2 = parseFloat(data[i+1].longitude);
            let diff = long1 - long2;
            if (Math.abs(diff) > 180) {
                let latitude = calculateLatForDateline(data[i], data[i+1])
                coordinates.push([latitude, -180])
                coordinates.push([latitude, 180])
                crossDateLine = i+2;
            }
        }
    }

    if (crossDateLine !== "") {
        let coordinates2 = coordinates.slice(crossDateLine)
        coordinates = coordinates.slice(0, crossDateLine)
        coordinates = [coordinates, coordinates2]
    }

    let polyline = L.polyline(coordinates, {color: 'red'}).addTo(map)

    copyAllLayers(map, coordinates)
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

function copyAllLayers(map, coordinates){
    map.eachLayer(function (layer){
        if (layer._latlng){
            L.marker([layer._latlng.lat,layer._latlng.lng+360], {icon: myIcon}).addTo(map)
            L.marker([layer._latlng.lat,layer._latlng.lng-360], {icon: myIcon}).addTo(map)
        }
        if (layer._path) {
            let coordinatesPlus360 = [];
            let coordinatesMinus360 = [];
            if(Array.isArray(coordinates)) {
                for (let i=0; i < coordinates.length; i++){
                    let plus360 = JSON.parse(JSON.stringify(coordinates[i]));
                    plus360 = copyPath(plus360, 360)

                    let minus360 = JSON.parse(JSON.stringify(coordinates[i]));
                    minus360 = copyPath(minus360, -360)

                    coordinatesPlus360.push(plus360);
                    coordinatesMinus360.push(minus360);
                }
                L.polyline(coordinatesPlus360, {color: 'red'}).addTo(map)
                L.polyline(coordinatesMinus360, {color: 'red'}).addTo(map)
            }
        }


    })
}

function copyPath(array, addLong) {
    for (let i=0; i < array.length; i++){
        array[i][1] = parseFloat(array[i][1]) + addLong;
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
let map = initMap();
loadExpedition(map)