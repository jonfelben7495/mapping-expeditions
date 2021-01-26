import L from "leaflet";
import {getExpeditionMarkers, getExpeditionRoute, getImages} from "./apiCalls";
import {buildImagePath, calculateLatForDateline, compareBySequence, concatArray, copyPath} from "./utilities";
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

export async function loadExpedition(exp_id, map){
    let expeditionMarkers = await loadExpeditionMarkers(exp_id, map);
    let expeditionRoute = await loadExpeditionRoute(exp_id, map);
    copyExpeditionMarkers(expeditionMarkers, map)
    copyExpeditionRoute(expeditionRoute, map)
}

async function loadExpeditionMarkers(exp_id, map) {
    let expeditionMarkers = await getExpeditionMarkers(exp_id)
    expeditionMarkers = JSON.parse(expeditionMarkers);
    expeditionMarkers.sort(compareBySequence);

    let markers = [];
    for (let i = 0; i < expeditionMarkers.length; i++) {
        let marker = L.marker([expeditionMarkers[i].latitude, expeditionMarkers[i].longitude], {icon: myIcon}).addTo(map)
        let images = [];
        if(expeditionMarkers[i].hasImages === "1"){
            images = await getImages(exp_id, expeditionMarkers[i].placeid);
            images = JSON.parse(images)
        }
        marker.on('click', function(){
            const infoPlaceName = document.querySelector(".info-container-place-name");
            const infoPlaceSeq = document.querySelector(".info-container-place-seq");
            const infoPlaceDate = document.querySelector(".info-container-place-date");
            const infoPlaceText = document.querySelector(".info-container-place-text");
            const infoPlaceSrc = document.querySelector(".info-container-place-src");
            const infoPlaceImages = document.querySelector(".info-container-place-images");

            let placeDate = new Date(expeditionMarkers[i].date).toLocaleDateString('de-DE')

            showExpeditionInfo(expeditionMarkers[i])

            infoPlaceName.innerHTML = expeditionMarkers[i].name
            infoPlaceSeq.innerHTML = expeditionMarkers[i].sequence + ". Station von <i>" + expeditionMarkers[i].exp_name + "</i>"
            infoPlaceDate.innerHTML = "Datum: " + placeDate;
            infoPlaceText.innerHTML = expeditionMarkers[i].place_info;
            infoPlaceSrc.innerHTML = "Quelle: " + expeditionMarkers[i].place_info_src;

            infoPlaceImages.innerHTML = "";
            if(images.length > 0){
                for (let j = 0; j < images.length; j++){
                    let image = document.createElement('img');
                    image.src = buildImagePath(exp_id, expeditionMarkers[i].sequence, images[j].file_name)
                    infoPlaceImages.appendChild(image)
                }
            }
        })
        markers.push(marker)
    }

    return markers;
}

export async function loadExpeditionRoute(exp_id, map) {
    let expeditionRoute = await getExpeditionRoute(exp_id);
    expeditionRoute = JSON.parse(expeditionRoute);
    expeditionRoute.sort(compareBySequence);

    let expeditionRouteCoordinates = [];
    let crossDateLine;
    for (let i = 0; i < expeditionRoute.length; i++){
        expeditionRouteCoordinates.push([expeditionRoute[i].lat, expeditionRoute[i].lng]);
        if(expeditionRoute[i+1]) {
            let long1 = parseFloat(expeditionRoute[i].lng);
            let long2 = parseFloat(expeditionRoute[i+1].lng);
            let diff = long1 - long2;
            if (Math.abs(diff) > 180) {
                let latitude = calculateLatForDateline(expeditionRoute[i], expeditionRoute[i+1])
                expeditionRouteCoordinates.push([latitude, -180])
                expeditionRouteCoordinates.push([latitude, 180])
                crossDateLine = i+2;
            }
        }
    }

    if (crossDateLine !== "" && crossDateLine !== undefined) {
        let expeditionCoordinates2 = expeditionRouteCoordinates.slice(crossDateLine)
        expeditionRouteCoordinates = expeditionRouteCoordinates.slice(0, crossDateLine)
        expeditionRouteCoordinates = [expeditionRouteCoordinates, expeditionCoordinates2]
    }

    let polyline = L.polyline(expeditionRouteCoordinates, {color: 'red'}).addTo(map)

    return polyline;
}

function copyExpeditionMarkers(markers, map){
    for (let i = 0; i < markers.length; i++) {
        let markerPlus360 = L.marker([markers[i]._latlng.lat,markers[i]._latlng.lng+360], {icon: myIcon}).addTo(map)
        // markerPlus360.bindPopup(markers[i]._popup._content)
        let markerMinus360 = L.marker([markers[i]._latlng.lat,markers[i]._latlng.lng-360], {icon: myIcon}).addTo(map)
        // markerMinus360.bindPopup(markers[i]._popup._content)
    }
}

function copyExpeditionRoute(route, map) {
    let expeditionCoordinates = [];

    if (Array.isArray(route._latlngs[0])){
        for (let i = 0; i < route._latlngs.length; i++) {
            expeditionCoordinates.push(route._latlngs[i])
        }
    } else {
        for (let i = 0; i < route._latlngs.length; i++) {
            expeditionCoordinates.push([route._latlngs[i].lat, route._latlngs[i].lng])
        }
    }

    let coordinatesPlus360 = [];
    let coordinatesMinus360 = [];
    if(Array.isArray(expeditionCoordinates[0])) {
        for (let i=0; i < expeditionCoordinates.length; i++){
            coordinatesPlus360 = [];
            coordinatesMinus360 = [];
            for(let j=0; j<expeditionCoordinates[i].length; j++) {
                let plus360 = JSON.parse(JSON.stringify(expeditionCoordinates[i][j]));
                plus360 = copyPath(plus360, 360)

                let minus360 = JSON.parse(JSON.stringify(expeditionCoordinates[i][j]));
                minus360 = copyPath(minus360, -360)

                coordinatesPlus360.push(plus360);
                coordinatesMinus360.push(minus360);
            }
            L.polyline(coordinatesPlus360, {color: 'red'}).addTo(map)
            L.polyline(coordinatesMinus360, {color: 'red'}).addTo(map)
        }
    } else {
        let plus360 = JSON.parse(JSON.stringify(expeditionCoordinates));
        plus360 = copyPath(plus360, 360)

        let minus360 = JSON.parse(JSON.stringify(expeditionCoordinates));
        minus360 = copyPath(minus360, -360)

        coordinatesPlus360.push(plus360);
        coordinatesMinus360.push(minus360);

        L.polyline(coordinatesPlus360, {color: 'red'}).addTo(map)
        L.polyline(coordinatesMinus360, {color: 'red'}).addTo(map)
    }
}

/*
async function loadExpedition(map) {
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

    copyAllLayers(map, expeditionCoordinates, expeditionRouteCoordinates)
}*/

function showExpeditionInfo(marker){
    const infoExpName = document.querySelector(".info-container-exp-name");
    const infoExpStart = document.querySelector(".info-container-exp-start");
    const infoExpEnd = document.querySelector(".info-container-exp-end");
    const infoExpLeader = document.querySelector(".info-container-exp-leader");

    let startDate = new Date(marker.startdate).toLocaleDateString('de-DE')
    let endDate = new Date(marker.enddate).toLocaleDateString('de-DE')

    infoExpName.innerHTML = marker.exp_name;
    infoExpStart.innerHTML = "Startdatum: " + startDate;
    infoExpEnd.innerHTML = "Enddatum: " + endDate;
    infoExpLeader.innerHTML = "Expeditionsleiter: " + marker.leader;
}