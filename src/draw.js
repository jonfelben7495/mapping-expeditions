import './style.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import {
    getLastMarkerSequence,
    getLastPlaceId,
    getLastSequenceOfRoute, saveImages, sendExpedition, sendImage,
    sendImages,
    sendMarker,
    sendPlace,
    sendRoute
} from "./apiCalls";
import {loadExpeditionRoute} from "./expedition";
import {
    setPlaceFormDate,
    setPlaceFormInfo,
    setPlaceFormLatLng,
    setPlaceFormName,
    setPlaceFormSrc,
    showPlaceForm
} from "./interface";

let currentLayer = "";

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
    let seq = 0;
    map.on('draw:created', async function (e) {
        let type = e.layerType,
            layer = e.layer;
        layer.type = type;
        map.addLayer(layer);
        layer.addTo(drawnItems)
        if(type === "marker") {
            seq = initNewMarker(layer, seq);
        }
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
            markerCoordinates[i].name = markers[i].name;
            markerCoordinates[i].date = markers[i].date;
            markerCoordinates[i].info = markers[i].info;
            markerCoordinates[i].src = markers[i].src;
            markerCoordinates[i].img = markers[i].img;
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

    let imgInputs = getAllImgInputs();

    for (let i = 0; i < imgInputs.length; i++){
        if(imgInputs[i].files.length > 0){
            let formData = new FormData();
            for (let j = 0; j < imgInputs[i].files.length; j++) {
                let file = imgInputs[i].files[j]

                formData.append('files[]', file)
            }
            await saveImages(formData, expeditionId, i+1)
        }
    }

    console.log(imgInputs)

    await sendExpedition(expeditionId,expeditionName,expeditionLeader,expeditionStart,expeditionEnd);

    if(markerCoordinates.length > 0){
        for (let i = 0; i < markerCoordinates.length; i++){
            let hasImages = false;
            if (imgInputs[i].files.length > 0){
                hasImages = true;
            }
            await sendPlace(lastPlaceId+i+1,markerCoordinates[i].name, markerCoordinates[i].lat, markerCoordinates[i].lng)
            await sendMarker(expeditionId, lastPlaceId+i+1, lastMarkerSequence+i+1, markerCoordinates[i].name,markerCoordinates[i].date,markerCoordinates[i].info,markerCoordinates[i].src, hasImages)
            if(hasImages){
                for (let j = 0; j < imgInputs[i].files.length; j++){
                    await sendImage(expeditionId, lastPlaceId+i+1, lastMarkerSequence+i+1, imgInputs[i].files[j].name)
                }
            }
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

function initNewMarker(layer, seq){
    currentLayer = layer;
    showPlaceForm();
    setPlaceFormLatLng(layer._latlng)
    setPlaceFormName("");
    setPlaceFormDate("");
    setPlaceFormInfo("");
    setPlaceFormSrc("");
    addNameInputEventListener();
    addDateInputEventListener();
    addInfoInputEventListener();
    addSrcInputEventListener();
    createNewImgInput();
    seq++
    layer.sequence = seq;
    layer.name = "";
    layer.date = "";
    layer.info = "";
    layer.src = "";
    layer.img = "";
    layer.addEventListener('click', function (){
        console.log(layer)
        currentLayer = layer;
        setPlaceFormLatLng(layer._latlng);
        setPlaceFormName(layer.name);
        setPlaceFormDate(layer.date);
        setPlaceFormInfo(layer.info);
        setPlaceFormSrc(layer.src);
        showImgInput(seq)
    })
    return seq;
}

export function setLayerName(){
    const nameInput = document.getElementById("newPlace-name");
    currentLayer.name = nameInput.value;
}

export function setLayerDate(){
    const dateInput = document.getElementById("newPlace-date");
    currentLayer.date = dateInput.value;
}

export function setLayerInfo(){
    const infoInput = document.getElementById("newPlace-info");
    currentLayer.info = infoInput.value;
}

export function setLayerSrc(){
    const srcInput = document.getElementById("newPlace-src");
    currentLayer.src = srcInput.value;
}

export function setLayerImg(){
    const imgInput = document.getElementById("newPlace-img");
    window.img = imgInput;
}

export function addNameInputEventListener(){
    const nameInput = document.getElementById("newPlace-name");
    nameInput.removeEventListener('keyup', setLayerName)
    nameInput.addEventListener('keyup', setLayerName)
}

export function addDateInputEventListener(){
    const dateInput = document.getElementById("newPlace-date");
    dateInput.removeEventListener('change', setLayerDate)
    dateInput.addEventListener('change', setLayerDate)
}

export function addInfoInputEventListener(){
    const infoInput = document.getElementById("newPlace-info");
    infoInput.removeEventListener('keyup', setLayerInfo)
    infoInput.addEventListener('keyup', setLayerInfo)
}

export function addSrcInputEventListener(){
    const srcInput = document.getElementById("newPlace-src");
    srcInput.removeEventListener('keyup', setLayerSrc)
    srcInput.addEventListener('keyup', setLayerSrc)
}


export function addImgInputEventListener(){
    const imgInput = document.getElementById("newPlace-img");
    imgInput.removeEventListener('change', setLayerImg)
    imgInput.addEventListener('change', setLayerImg)
}

export function createNewImgInput(){
    const imgInputContainer = document.getElementById("newPlace-img-container");
    hideAllImgInputs()

    let newInput = document.createElement("input");
    newInput.setAttribute("type", "file");
    newInput.setAttribute("name", "files[]");
    newInput.setAttribute("multiple", 'true');
    newInput.class = "newPlace-img";

    imgInputContainer.appendChild(newInput)
}

export function showImgInput(seq){
    let currentInputs = getAllImgInputs()
    let imgInput = currentInputs[seq-1];
    hideAllImgInputs();
    imgInput.style.display = "block"

}

function hideAllImgInputs(){
    let currentInputs = getAllImgInputs()
    if(currentInputs.length > 0){
        for (let i = 0; i < currentInputs.length; i++){
            currentInputs[i].style.display = "none"
        }
    }
}

function getAllImgInputs(){
    const imgInputContainer = document.getElementById("newPlace-img-container");
    return imgInputContainer.querySelectorAll("input");
}