import L from "leaflet";
import {getExpeditionMarkers, getExpeditionRoute, getImages} from "./apiCalls";
import {
    buildImagePath,
    calculateLatForDateline,
    compareBySequence,
    copyPath,
    getColorForExpedition,
    ordinal_suffix_of,
    transformCoordinatesArrayToObjects
} from "./utilities";
import Shadow from 'leaflet/dist/images/marker-shadow.png'

let loadedExpeditions = []

/**
 * Loads and adds an expedition to the map.
 * @param {string} exp_id - ID of the expedition
 * @param {Object} map - Leaflet map object
 */
export async function loadExpedition(exp_id, map){
    let lineColor = getColorForExpedition(exp_id-1)
    let expeditionMarkers = await loadExpeditionMarkers(exp_id, map, lineColor);
    let expeditionRoute = await loadExpeditionRoute(exp_id, map, lineColor);
    loadedExpeditions.push([expeditionMarkers, expeditionRoute])
    copyExpeditionMarkers(expeditionMarkers, map, lineColor)
    copyExpeditionRoute(expeditionRoute, map, lineColor)

    return loadedExpeditions
}

/**
 * Loads and adds all markers of an expedition to the map.
 * @param {string} exp_id - ID of the expedition
 * @param {Object} map - Leaflet map object
 * @param {string} color - the color of the markers based on the expedition id
 */
async function loadExpeditionMarkers(exp_id, map, color) {
    let expeditionMarkers = await getExpeditionMarkers(exp_id)
    expeditionMarkers.sort(compareBySequence);

    let markers = [];
    for (let i = 0; i < expeditionMarkers.length; i++) {
        let marker = L.marker([expeditionMarkers[i].latitude, expeditionMarkers[i].longitude], {icon: getMarker(color)}).addTo(map)
        let images = [];
        if(expeditionMarkers[i].hasImages === "1"){
            images = await getImages(exp_id, expeditionMarkers[i].placeid);
        }
        marker.expId = expeditionMarkers[i].exp_id;
        marker.expName = expeditionMarkers[i].exp_name;
        marker.expLeader = expeditionMarkers[i].leader;
        marker.startDate = expeditionMarkers[i].startdate;
        marker.endDate =expeditionMarkers[i].enddate;
        marker.placeName = expeditionMarkers[i].name;
        marker.placeId = expeditionMarkers[i].placeid;
        marker.sequence = expeditionMarkers[i].sequence
        marker.date = expeditionMarkers[i].date;
        marker.placeInfo = expeditionMarkers[i].place_info;
        marker.placeInfoSrc = expeditionMarkers[i].place_info_src;
        marker.on('click', function(){
            const infoContainer = document.querySelector("#info-container")
            const infoContainerPlace = document.querySelector("#info-container-place")
            const infoPlaceName = document.querySelector(".info-container-place-name");
            const infoPlaceSeq = document.querySelector(".info-container-place-seq");
            const infoPlaceDate = document.querySelector(".info-container-place-date");
            const infoPlaceText = document.querySelector(".info-container-place-text");
            const infoPlaceSrc = document.querySelector(".info-container-place-src");
            const infoPlaceImages = document.querySelector(".info-container-place-images");

            let placeDate = new Date(expeditionMarkers[i].date).toLocaleDateString('de-DE')

            showExpeditionInfo(expeditionMarkers[i])

            infoContainerPlace.classList.remove("hide")
            infoPlaceName.innerHTML = expeditionMarkers[i].name
            infoPlaceSeq.innerHTML = ordinal_suffix_of(expeditionMarkers[i].sequence) + " station of <i>" + expeditionMarkers[i].exp_name + "</i>"
            infoPlaceDate.innerHTML = "Date: " + placeDate;
            infoPlaceText.innerHTML = expeditionMarkers[i].place_info;
            infoPlaceSrc.innerHTML = "Source: " + expeditionMarkers[i].place_info_src;

            infoPlaceImages.innerHTML = "";
            if(images.length > 0){
                for (let j = 0; j < images.length; j++){
                    let image = document.createElement('img');
                    image.src = buildImagePath(exp_id, expeditionMarkers[i].sequence, images[j].file_name)
                    image.addEventListener("click", function(e){
                        openImgInLightbox(e.target, images[j]);
                    })
                    infoPlaceImages.appendChild(image)
                }
            }
            infoContainer.classList.remove("hide")
        })
        markers.push(marker)
    }

    return markers;
}

/**
 * Loads and adds the route of an expedition to the map.
 * @param {string} exp_id - ID of the expedition
 * @param {Object} map - Leaflet map object
 * @param {string} lineColor - the color of the polyline based on the expedition id
 */
export async function loadExpeditionRoute(exp_id, map, lineColor) {
    let expeditionRoute = await getExpeditionRoute(exp_id);
    expeditionRoute.sort(compareBySequence);

    if(expeditionRoute.length > 0){
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

        let polyline = L.polyline(expeditionRouteCoordinates, {color: lineColor}).addTo(map)

        polyline.on('click', function (){
            showExpeditionInfo(expeditionRoute[0])
        })

        polyline.expId = expeditionRoute[0].exp_id
        polyline.expName = expeditionRoute[0].exp_name

        return polyline;
    }
    return null;


}

/**
 * Copies all markers of an expedition with an added and deducted longitude. Serves for higher zoom levels where the map can be seen multiple times.
 * @param {array} markers - Array of all markers of the expediton
 * @param {Object} map - Leaflet map object
 * @param {string} color - the color of the markers based on the expedition id
 */
function copyExpeditionMarkers(markers, map, color){
    for (let i = 0; i < markers.length; i++) {
        L.marker([markers[i]._latlng.lat,markers[i]._latlng.lng+360], {icon: getMarker(color)}).addTo(map)
        L.marker([markers[i]._latlng.lat,markers[i]._latlng.lng-360], {icon: getMarker(color)}).addTo(map)
    }
}

/**
 * Copies the route of an expedition with an added and deducted longitude. Serves for higher zoom levels where the map can be seen multiple times.
 * @param {Object} route - The route of the expedition including all coordinates
 * @param {Object} map - Leaflet map object
 * @param {string} lineColor - the color of the route based on the expedition id
 */
function copyExpeditionRoute(route, map, lineColor) {
    if(route === null){
        return;
    }
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
    if(typeof expeditionCoordinates[0][0] !== 'object' && expeditionCoordinates[0][0] !== null) {
        transformCoordinatesArrayToObjects(expeditionCoordinates)
    }
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
            L.polyline(coordinatesPlus360, {color: lineColor}).addTo(map)
            L.polyline(coordinatesMinus360, {color: lineColor}).addTo(map)
        }
    } else {
        let plus360 = JSON.parse(JSON.stringify(expeditionCoordinates));
        for(let i = 0; i < plus360.length; i++){
            plus360[i] = copyPath(plus360[i], 360)
        }

        let minus360 = JSON.parse(JSON.stringify(expeditionCoordinates));
        for(let i = 0; i < minus360.length; i++){
            minus360[i] = copyPath(minus360[i], -360)
        }

        coordinatesPlus360.push(plus360);
        coordinatesMinus360.push(minus360);

        L.polyline(coordinatesPlus360, {color: lineColor}).addTo(map)
        L.polyline(coordinatesMinus360, {color: lineColor}).addTo(map)
    }
}

/**
 * Renders the information about an expedition into the info container.
 * @param {Object} marker - A marker of the expedition
 */
function showExpeditionInfo(marker){
    const infoContainer = document.querySelector("#info-container")
    const infoContainerPlace = document.querySelector("#info-container-place")
    const infoExpName = document.querySelector(".info-container-exp-name");
    const infoExpStart = document.querySelector(".info-container-exp-start");
    const infoExpEnd = document.querySelector(".info-container-exp-end");
    const infoExpLeader = document.querySelector(".info-container-exp-leader");

    let startDate = new Date(marker.startdate).toLocaleDateString('de-DE')
    let endDate = new Date(marker.enddate).toLocaleDateString('de-DE')

    infoContainerPlace.classList.add("hide")
    infoContainer.classList.remove("hide")
    infoExpName.innerHTML = marker.exp_name;
    infoExpStart.innerHTML = "Start date: " + startDate;
    infoExpEnd.innerHTML = "End date: " + endDate;
    infoExpLeader.innerHTML = "Expedition leader: " + marker.leader;
}

/**
 * Returns a specifically colored marker icon.
 * @param {string} color - HTML color code for the icon
 */
function getMarker(color){
    return L.icon({
        iconUrl: colorToFileName(color),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: Shadow,
        shadowSize: [41, 41]
    })
}

/**
 * Returns the path for an icon svg based on a color.
 * @param {string} color - HTML color code for the icon
 */
function colorToFileName(color){
    return "./markers/" + color.replace("#", "") + ".svg"
}

/**
 * Inserts the clicked image into the image lightbox.
 * @param {Object} target - The clicked image elemetn
 * @param {Object} image - The images meta data from the database.
 */
function openImgInLightbox(target, image) {
    const lightbox = document.getElementById("img-lightbox")
    lightbox.classList.remove("hide");

    const lightboxImage = document.getElementById("img-lightbox-inner-img")
    lightboxImage.src = target.src;

    const lightboxText = document.getElementById("img-lightbox-inner-text");
    lightboxText.innerHTML = image.img_description + ".<br/>Urheber: " + image.img_creator + ". Quelle: " + image.img_src;
}