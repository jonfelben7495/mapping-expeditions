import './style.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import marker from 'leaflet/dist/images/marker-icon.png'
import Shadow from 'leaflet/dist/images/marker-shadow.png'

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
    console.log(data)
    var myIcon = L.icon({
        iconUrl: marker,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: Shadow,
        shadowSize: [41, 41]
    });

    let startMarker = L.marker([data[0].startlat, data[0].startlong], {icon: myIcon}).addTo(map)
    let endMarker = L.marker([data[0].endlat, data[0].endlong], {icon: myIcon}).addTo(map)

    startMarker.bindPopup(data[0].startplace + "<br/>Ausgangspunkt von: " + data[0].name)
    endMarker.bindPopup(data[0].endplace + "<br/>Endpunkt von: " + data[0].name)
}

document.body.appendChild(component());
let map = initMap();
loadExpedition(map)