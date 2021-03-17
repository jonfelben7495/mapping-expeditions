import './style.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import {
    deleteRoute,
    getLastExpeditionId,
    getLastMarkerSequence,
    getLastPlaceId,
    getLastSequenceOfRoute,
    saveImages,
    sendExpedition,
    sendImage,
    sendMarker,
    sendPlace,
    sendRoute, updateMarkerData, updatePlace
} from "./apiCalls";
import {loadExpedition, loadExpeditionRoute} from "./expedition";
import {
    changeExplanationText,
    hideAddExpeditionInterface,
    setPlaceFormDate,
    setPlaceFormInfo,
    setPlaceFormLatLng,
    setPlaceFormName,
    setPlaceFormSrc, showImgForm,
    showPlaceForm, showSaveButton, updateAddToExpeditionButton
} from "./interface";
import {removeMultipleLayers} from "./utilities";
import {updateLegend} from "./index";

let currentLayer = "";
let drawControl;
let drawnItems;
let newExpedition;
let mapObject;

/**
 * Initiates the draw control for drawing on the map.
 * @param {Object} map - Leaflet map object
 * @param {array} arrayOfElements - Array of already existing elements to add to the drawn items array
 */
export function initDrawControl(map, arrayOfElements){
    drawnItems = new L.FeatureGroup();
    if(arrayOfElements){
        setExpeditionInputs(arrayOfElements[0].expName, arrayOfElements[0].expLeader, arrayOfElements[0].startDate, arrayOfElements[0].endDate)
        for(let i = 0;i<arrayOfElements.length;i++){
            arrayOfElements[i]._events.click = []
            arrayOfElements[i].addTo(drawnItems)
        }
    }
    map.addLayer(drawnItems);
    drawControl = new L.Control.Draw({
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

/**
 * Removes the draw control for drawing on the map.
 * @param {Object} map - Leaflet map object
 */
export function removeDrawControl(map){
    map.removeControl(drawControl)
}

/**
 * Initiates the draw control for drawing on the map and adds event listeners for different drawing events.
 * @param {Object} map - Leaflet map object
 * @param {array} arrayOfElements - Array of already existing elements to add to the drawn items array
 * @param {boolean} isNewExpedition - Defines whether a new expedition is drawn or an existing expedition is edited.
 */
export function addDrawEventListener(map, isNewExpedition, arrayOfElements){
    newExpedition = isNewExpedition;
    mapObject = map;
    drawnItems = initDrawControl(map, arrayOfElements)
    let seq = 0;
    if(arrayOfElements){
        for(let i=0;i<arrayOfElements.length;i++){
            if(arrayOfElements[i]._icon){
                arrayOfElements[i].type = "marker"
                seq = initExistingMarker(arrayOfElements[i], seq)
            } else {
                arrayOfElements[i].type = "polyline"
            }
        }
    }
    const submitButton = document.getElementById('button-submit');
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

    map.on('draw:edited', function (e) {
        let layers = e.layers;
        layers.eachLayer(function (layer) {
            if (layer instanceof L.Marker){
                layer.coordinatesChanged = true;
            }
        });
    })

    map.on('draw:editstop', function (e) {
        submitButton.classList.remove("hide")
    })

    map.on('draw:drawstop', function (e) {
        submitButton.classList.remove("hide")
    })

    submitButton.removeEventListener('click', submitExpedition)
    submitButton.addEventListener('click', submitExpedition)
}

async function submitExpedition() {
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
        markerCoordinates[i].imgMetaData = markers[i].imgMetaData;
        markerCoordinates[i].placeId = markers[i].placeId;
        markerCoordinates[i].sequence = markers[i].sequence;
        markerCoordinates[i].dataEdited = markers[i].dataEdited
        markerCoordinates[i].coordinatesChanged = markers[i].coordinatesChanged
    }

    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[i]._latlngs.length; j++) {
            if (lines[i]._latlngs[j].length > 2) {
                lineCoordinates.push(lines[i]._latlngs[0]);
                break;
            } else {
                lineCoordinates.push(lines[i]._latlngs[j]);
            }
        }
    }

    if (newExpedition) {
        await addNewExpedition(markerCoordinates, lineCoordinates, mapObject, layers)
    } else {
        let expeditionID = markers[0].expId;
        await addToExistingExpedition(expeditionID, markerCoordinates, lineCoordinates, mapObject, layers)
    }

    changeExplanationText("")
}

/**
 * Fired after saving a new expedition. Sends expedition data to the database and prepares map for further use.
 * @param {Object} map - Leaflet map object
 * @param {array} markerCoordinates - Drawn markers for the expedition
 * @param {array} lineCoordinates - Coordinates of drawn polyline aka route of the expedition
 * @param {Array} layers - All newly drawn layers
 */
async function addNewExpedition(markerCoordinates, lineCoordinates, map, layers){
    let expeditionId = await getLastExpeditionId() + 1;
    let lastPlaceId = await getLastPlaceId();
    let lastMarkerSequence = 0;
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
                    await sendImage(expeditionId, lastPlaceId+i+1, lastMarkerSequence+i+1, imgInputs[i].files[j].name, markerCoordinates[i].imgMetaData[j].description, markerCoordinates[i].imgMetaData[j].creator, markerCoordinates[i].imgMetaData[j].src)
                }
            }
        }
    }

    if(lineCoordinates.length > 0){
        await sendRoute(expeditionId, lineCoordinates)
    }

    removeMultipleLayers(layers, map)
    drawnItems = new L.FeatureGroup();
    hideAddExpeditionInterface(map);
    removeDrawControl(map)

    await loadExpedition(expeditionId, map)
}

/**
 * Fired after saving an edited expedition. Sends expedition data to the database and prepares map for further use.
 * @param {string} expeditionId - ID of the expedition
 * @param {Object} map - Leaflet map object
 * @param {array} markerCoordinates - Drawn markers for the expedition
 * @param {array} lineCoordinates - Coordinates of drawn polyline aka route of the expedition
 * @param {Array} layers - All newly drawn layers
 */
async function addToExistingExpedition(expeditionId, markerCoordinates, lineCoordinates, map, layers){
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

    if(markerCoordinates.length > 0){
        for (let i = 0; i < markerCoordinates.length; i++){
            let hasImages = false;
            if (imgInputs[i].files.length > 0){
                hasImages = true;
            }
            if(markerCoordinates[i].dataEdited) {
                await updateMarkerData(expeditionId, markerCoordinates[i].placeId, markerCoordinates[i].name, markerCoordinates[i].sequence, markerCoordinates[i].date, markerCoordinates[i].info, markerCoordinates[i].src, hasImages)
            }
            if(markerCoordinates[i].coordinatesChanged){
                await updatePlace(markerCoordinates[i].placeId, markerCoordinates[i].name, markerCoordinates[i].lat, markerCoordinates[i].lng)
            }
            if(hasImages){
                for (let j = 0; j < imgInputs[i].files.length; j++){
                    await sendImage(expeditionId, markerCoordinates[i].placeId, markerCoordinates[i].sequence, imgInputs[i].files[j].name, markerCoordinates[i].imgMetaData[j].description, markerCoordinates[i].imgMetaData[j].creator, markerCoordinates[i].imgMetaData[j].src)
                }
            }
        }
    }

    if(lineCoordinates.length > 0){
        let allCoords = []
        for (let i=0;i<lineCoordinates.length; i++){
            if(Array.isArray(lineCoordinates[i])) {
                allCoords = allCoords.concat(lineCoordinates[i])
            } else {
                allCoords.push(lineCoordinates[i])
            }
        }
        await deleteRoute(expeditionId)
        await sendRoute(expeditionId, allCoords)
    }

    window.loadedExpeditions = []
    removeMultipleLayers(layers, map)
    drawnItems = new L.FeatureGroup();
    hideAddExpeditionInterface(map);
    removeDrawControl(map)

    let lastExpeditionId = await getLastExpeditionId();

    let expeditions = await drawAllExpeditions(lastExpeditionId, map)
    updateAddToExpeditionButton(expeditions, map)
    updateLegend(map, expeditions)

    await loadExpedition(expeditionId, map)
}

/**
 * Sorts an array of layers into two array depending on their type.
 * @param {array} markers - Array for layers of type marker
 * @param {array} lines - Array for layers of type polyline
 * @param {Array} layers - All newly drawn layers
 */
function sortLayers(markers, lines, layers){
    for (let i = 0; i < Object.keys(layers).length; i++) {
        if (Object.values(layers)[i].type === "marker") {
            markers.push(Object.values(layers)[i]);
        } else if (Object.values(layers)[i].type === "polyline") {
            lines.push(Object.values(layers)[i]);
        }
    }
}

/**
 * Fired after a new marker is set or drawn. Prepares input fields and meta data for the marker for further use.
 * @param {Object} layer - The Leaflet layer of the added marker.
 * @param {string} seq - Sequence number of the marker inside the expedition.
 */
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
    addImgInputEventListener();
    addSrcInputEventListener();
    createNewImgInput();
    clearImgFormContainer()
    seq++
    layer.sequence = seq;
    layer.name = "";
    layer.date = "";
    layer.info = "";
    layer.src = "";
    layer.img = "";
    layer.imgMetaData = [];
    layer.addEventListener('click', function (){
        currentLayer = layer;
        setPlaceFormLatLng(layer._latlng);
        setPlaceFormName(layer.name);
        setPlaceFormDate(layer.date);
        setPlaceFormInfo(layer.info);
        setPlaceFormSrc(layer.src);
        showImgInput(seq);
        setImgMetaDataForm(layer.imgMetaData, seq)
    })
    return seq;
}

/**
 * Fired when markers of an existing expedition are being prepared for editing. Prepares input fields and meta data for the marker for further use.
 * @param {Object} layer - The Leaflet layer of the marker.
 * @param {string} seq - Sequence number of the marker inside the expedition.
 */
function initExistingMarker(layer, seq){
    setPlaceFormLatLng(layer._latlng)
    addNameInputEventListener();
    addDateInputEventListener();
    addInfoInputEventListener();
    addImgInputEventListener();
    addSrcInputEventListener();
    createNewImgInput();
    clearImgFormContainer();
    seq++
    layer.sequence = seq;
    layer.name = layer.placeName;
    layer.info = layer.placeInfo;
    layer.src = layer.placeInfoSrc;
    layer.img = "";
    layer.imgMetaData = [];
    layer.addEventListener('click', function (){
        showPlaceForm()
        currentLayer = layer;
        setPlaceFormLatLng(layer._latlng);
        setPlaceFormName(layer.name);
        setPlaceFormDate(layer.date);
        setPlaceFormInfo(layer.info);
        setPlaceFormSrc(layer.src);
        showImgInput(seq);
        setImgMetaDataForm(layer.imgMetaData, seq)
    })
    return seq;
}

/**
 * Fired after changing the place name input. Saves the input to the current layer object for later use.
 */
export function setLayerName(){
    const nameInput = document.getElementById("newPlace-name");
    currentLayer.name = nameInput.value;
    currentLayer.dataEdited = true;
    showSaveButton()
}

/**
 * Fired after changing the place date input. Saves the input to the current layer object for later use.
 */
export function setLayerDate(){
    const dateInput = document.getElementById("newPlace-date");
    currentLayer.date = dateInput.value;
    currentLayer.dataEdited = true;
    showSaveButton()
}

/**
 * Fired after changing the place info input. Saves the input to the current layer object for later use.
 */
export function setLayerInfo(){
    const infoInput = document.getElementById("newPlace-info");
    currentLayer.info = infoInput.value;
    currentLayer.dataEdited = true;
    showSaveButton()
}

/**
 * Fired after changing the place src input. Saves the input to the current layer object for later use.
 */
export function setLayerSrc(){
    const srcInput = document.getElementById("newPlace-src");
    currentLayer.src = srcInput.value;
    currentLayer.dataEdited = true;
    showSaveButton()
}

/**
 * Removes former event listener and adds new event listener on the place name input.
 */
export function addNameInputEventListener(){
    const nameInput = document.getElementById("newPlace-name");
    nameInput.removeEventListener('keyup', setLayerName)
    nameInput.addEventListener('keyup', setLayerName)
}

/**
 * Removes former event listener and adds new event listener on the place date input.
 */
export function addDateInputEventListener(){
    const dateInput = document.getElementById("newPlace-date");
    dateInput.removeEventListener('change', setLayerDate)
    dateInput.addEventListener('change', setLayerDate)
}

/**
 * Removes former event listener and adds new event listener on the place info input.
 */
export function addInfoInputEventListener(){
    const infoInput = document.getElementById("newPlace-info");
    infoInput.removeEventListener('keyup', setLayerInfo)
    infoInput.addEventListener('keyup', setLayerInfo)
}

/**
 * Removes former event listener and adds new event listener on the place src input.
 */
export function addSrcInputEventListener(){
    const srcInput = document.getElementById("newPlace-src");
    srcInput.removeEventListener('keyup', setLayerSrc)
    srcInput.addEventListener('keyup', setLayerSrc)
}

/**
 * Removes former event listener and adds new event listener on the place img input.
 */
export function addImgInputEventListener(){
    const imgInput = document.getElementById("newPlace-img-container");
    imgInput.removeEventListener('change', showImgForm)
    imgInput.addEventListener('change', showImgForm)
}

/**
 * Creates a new img input and appends it to the container that contains the img inputs for all markers.
 */
export function createNewImgInput(){
    const imgInputContainer = document.getElementById("newPlace-img-container");
    hideAllImgInputs()

    let newInput = document.createElement("input");
    newInput.setAttribute("type", "file");
    newInput.setAttribute("name", "files[]");
    newInput.setAttribute("multiple", 'true');
    newInput.class = "newPlace-img";
    newInput.addEventListener('change', function(){
        clearImgMetaDataForLayer()
        createMetaDataForLayer(newInput.files)
        createImgMetaDataInputs(newInput.files)
    })

    imgInputContainer.appendChild(newInput)
}

/**
 * Creates meta data inputs for all images to be uploaded.
 * @param {array} files - Array of all uploaded image files.
 */
function createImgMetaDataInputs(files){
    const imgFormContainer = document.getElementById("images-forms");
    clearImgFormContainer()
    for (let i = 0; i < files.length; i++) {
        createMetaDataContainer(imgFormContainer, files, i)
    }

}

/**
 * Clears the form container that contains all image data for the current layer.
 */
function clearImgFormContainer(){
    const imgFormContainer = document.getElementById("images-forms");
    imgFormContainer.innerHTML = "";
}

/**
 * Adds meta data attributes for all uploaded image files to the current layer.
 * @param {array} files - Array of all uploaded image files.
 */
function createMetaDataForLayer(files){
    for (let i = 0; i < files.length; i++) {
        let metaDataObj = {};
        metaDataObj.filename = files[i].name;
        metaDataObj.description = "";
        metaDataObj.creator = "";
        metaDataObj.src = "";
        currentLayer.imgMetaData.push(metaDataObj)
    }
}

/**
 * Clears the meta data attributes of the current layer.
 */
function clearImgMetaDataForLayer(){
    currentLayer.imgMetaData = [];
}

/**
 * Creates and initiates meta data inputs for a single image.
 * @param {Object} imgFormContainer - DOM object to which the meta data container will be appended
 * @param {array} files - Array of all uploaded image files.
 * @param {int} i -  running variable
 */
function createMetaDataContainer(imgFormContainer, files, i){
    const submitButton = document.getElementById('button-submit');
    const metaDataContainer = document.createElement('div');

    const fileNameDiv = document.createElement('div');

    const fileNameLabel = document.createElement("label");
    fileNameLabel.setAttribute("for", "img-filename-" + i);
    fileNameLabel.innerHTML = "Dateiname:";

    const fileNameInput = document.createElement("input");
    fileNameInput.setAttribute("name", "img-filename-" + i);
    fileNameInput.setAttribute("type", "text");
    fileNameInput.setAttribute("readonly", true)
    fileNameInput.id = "img-filename-" + i;
    fileNameInput.value = files[i].name;

    fileNameDiv.appendChild(fileNameLabel)
    fileNameDiv.appendChild(fileNameInput)

    const imgDescriptionDiv = document.createElement('div');

    const imgDescriptionLabel = document.createElement("label");
    imgDescriptionLabel.setAttribute("for", "img-description-" + i);
    imgDescriptionLabel.innerHTML = "Bildbeschreibung:";

    const imgDescriptionInput = document.createElement("input");
    imgDescriptionInput.setAttribute("name", "img-description-" + i);
    imgDescriptionInput.setAttribute("type", "text");
    imgDescriptionInput.id = "img-description-" + i;
    imgDescriptionInput.addEventListener('keyup', function(){
        currentLayer.imgMetaData[i].description = imgDescriptionInput.value;
        currentLayer.dataEdited = true;
        showSaveButton()
    })

    imgDescriptionDiv.appendChild(imgDescriptionLabel)
    imgDescriptionDiv.appendChild(imgDescriptionInput)

    const imgCreatorDiv = document.createElement('div');

    const imgCreatorLabel = document.createElement("label");
    imgCreatorLabel.setAttribute("for", "img-creator-" + i);
    imgCreatorLabel.innerHTML = "Urheber:";

    const imgCreatorInput = document.createElement("input");
    imgCreatorInput.setAttribute("name", "img-creator-" + i);
    imgCreatorInput.setAttribute("type", "text");
    imgCreatorInput.id = "img-creator-" + i;
    imgCreatorInput.addEventListener('keyup', function(){
        currentLayer.imgMetaData[i].creator = imgCreatorInput.value;
        currentLayer.dataEdited = true;
        showSaveButton()
    })

    imgCreatorDiv.appendChild(imgCreatorLabel)
    imgCreatorDiv.appendChild(imgCreatorInput)

    const imgSrcDiv = document.createElement('div');

    const imgSrcLabel = document.createElement("label");
    imgSrcLabel.setAttribute("for", "img-src-" + i);
    imgSrcLabel.innerHTML = "Bildquelle:";

    const imgSrcInput = document.createElement("input");
    imgSrcInput.setAttribute("name", "img-src-" + i);
    imgSrcInput.setAttribute("type", "text");
    imgSrcInput.id = "img-src-" + i;
    imgSrcInput.addEventListener('keyup', function(){
        currentLayer.imgMetaData[i].src = imgSrcInput.value;
        currentLayer.dataEdited = true;
        submitButton.classList.remove("hide")
    })

    imgSrcDiv.appendChild(imgSrcLabel)
    imgSrcDiv.appendChild(imgSrcInput)

    metaDataContainer.appendChild(fileNameDiv);
    metaDataContainer.appendChild(imgDescriptionDiv);
    metaDataContainer.appendChild(imgCreatorDiv);
    metaDataContainer.appendChild(imgSrcDiv);
    imgFormContainer.appendChild(metaDataContainer)
}

/**
 * Shows the img input of a specific marker.
 * @param {int} seq - Sequence number of the marker
 */
export function showImgInput(seq){
    let currentInputs = getAllImgInputs()
    let imgInput = currentInputs[seq-1];
    hideAllImgInputs();
    imgInput.classList.add("inlineBlock")
}

/**
 * Hides all img inputs.
 */
function hideAllImgInputs(){
    let currentInputs = getAllImgInputs()
    if(currentInputs.length > 0){
        for (let i = 0; i < currentInputs.length; i++){
            currentInputs[i].classList.remove("inlineBlock")
            currentInputs[i].classList.add("hide")
        }
    }
}

/**
 * Returns an array of all img inputs.
 */
function getAllImgInputs(){
    const imgInputContainer = document.getElementById("newPlace-img-container");
    return imgInputContainer.querySelectorAll("input");
}

/**
 * Returns a single img input.
 * @param {int} seq - Sequence number of the marker
 */
function getImgInput(seq){
    let currentInputs = getAllImgInputs()
    return currentInputs[seq - 1]
}

/**
 * Set the img meta data form to represent the images and data of a specific marker.
 * @param {Array} metaData - Img meta data of the marker
 * @param {int} seq - Sequence number of the marker
 */
function setImgMetaDataForm(metaData, seq){
    if(metaData.length === 0){
        clearImgFormContainer()
        return;
    }
    let imgInput = getImgInput(seq);
    createImgMetaDataInputs(imgInput.files);
    for (let i = 0; i < imgInput.files.length; i++){
        setImgMetaDataInputs(metaData[i], i);
    }
}

/**
 * Set the img meta data input values to the img meta data of a specific marker.
 * @param {Array} metaData - Img meta data of the marker
 * @param {int} seq - Sequence number of the marker
 */
function setImgMetaDataInputs(metaData, seq){
    const imgDescription = document.getElementById("img-description-" + seq);
    imgDescription.value = metaData.description;

    const imgCreator = document.getElementById("img-creator-" + seq);
    imgCreator.value = metaData.creator;

    const imgSrc = document.getElementById("img-src-" + seq);
    imgSrc.value = metaData.src;
}

/**
 * Removes all drawn items from the map
 * @param {Object} map - Leaflet map object
 */
export function deleteDrawnItems(map){
    map.removeLayer(drawnItems);
}

/**
 * Set the expedition input values to fit the chosen expedition.
 * @param {string} name - Name of the expedition
 * @param {string} leader - Leader of the expedition
 * @param {string} startdate - Start date of the expedition
 * @param {string} enddate - End date of the expedition
 */
function setExpeditionInputs(name, leader, startdate, enddate){
    let nameInput = document.getElementById("newExpedition-name");
    nameInput.value = name;

    let leaderInput = document.getElementById("newExpedition-leader");
    leaderInput.value = leader;

    let startDateInput = document.getElementById("newExpedition-startDate");
    startDateInput.value = startdate;

    let endDateInput = document.getElementById("newExpedition-endDate");
    endDateInput.value = enddate;
}

/**
 * Adds a number of expeditions to the map.
 * @param {int} lastExpeditionId - ID of the last expedition to be added
 * @param {Object} map - Leaflet map object
 */
export async function drawAllExpeditions(lastExpeditionId, map){
    let addedExpeditions = [];
    for (let i =1; i <= lastExpeditionId; i++) {
        addedExpeditions.push(await loadExpedition(i, map))
    }

    return addedExpeditions
}