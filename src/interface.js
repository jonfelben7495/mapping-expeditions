import {addDrawEventListener, initDrawControl, setLayerName} from "./draw";
import {getLastExpeditionId} from "./apiCalls";

let currentLayer = "";

export function createSubmitButton(id, label){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("submit-button", "hide")
    button.innerHTML = label

    return button
}

export function createNewExpeditionButton(id, label, map, interfaceid){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("newExpedition-button")
    button.innerHTML = label

    button.addEventListener('click', async function(){
        let newExpeditionId = await getLastExpeditionId() + 1;
        let drawnItems = initDrawControl(map);
        addDrawEventListener(map, drawnItems, newExpeditionId, true);

        toggleExpeditionFormVisibility()
    })

    return button;
}

export function createAddToExpeditionButton(id, label, map, interfaceid){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("addToExpedition-button")
    button.innerHTML = label

    button.addEventListener('click', async function(){
        let expeditionId = 1;
        let drawnItems = initDrawControl(map);
        addDrawEventListener(map, drawnItems, expeditionId, false);
    })

    return button;
}

export function createNewExpeditionForm(){
    const form = document.createElement("form");
    form.classList.add("newExpedition-form");

    const expNameDiv = document.createElement('div');

    const expNameLabel = document.createElement("label");
    expNameLabel.setAttribute("for", "newExpedition-name");
    expNameLabel.innerHTML = "Name der Expedition:";

    const expNameInput = document.createElement("input");
    expNameInput.setAttribute("name", "newExpedition-name");
    expNameInput.setAttribute("type", "text");
    expNameInput.id = "newExpedition-name";

    expNameDiv.appendChild(expNameLabel)
    expNameDiv.appendChild(expNameInput)

    const expLeaderDiv = document.createElement('div');

    const expLeaderLabel = document.createElement("label");
    expLeaderLabel.setAttribute("for", "newExpedition-leader");
    expLeaderLabel.innerHTML = "Leiter der Expedition:";

    const expLeaderInput = document.createElement("input");
    expLeaderInput.setAttribute("name", "newExpedition-leader");
    expLeaderInput.setAttribute("type", "text");
    expLeaderInput.id = "newExpedition-leader";

    expLeaderDiv.appendChild(expLeaderLabel)
    expLeaderDiv.appendChild(expLeaderInput)

    const expStartDiv = document.createElement('div');

    const expStartLabel = document.createElement("label");
    expStartLabel.setAttribute("for", "newExpedition-startDate");
    expStartLabel.innerHTML = "Startdatum:";

    const expStartInput = document.createElement("input");
    expStartInput.setAttribute("name", "newExpedition-startDate");
    expStartInput.setAttribute("type", "date");
    expStartInput.id = "newExpedition-startDate";

    expStartDiv.appendChild(expStartLabel)
    expStartDiv.appendChild(expStartInput)

    const expEndDiv = document.createElement('div');

    const expEndLabel = document.createElement("label");
    expEndLabel.setAttribute("for", "newExpedition-endDate");
    expEndLabel.innerHTML = "Enddatum:";

    const expEndInput = document.createElement("input");
    expEndInput.setAttribute("name", "newExpedition-endDate");
    expEndInput.setAttribute("type", "date");
    expEndInput.id = "newExpedition-endDate";

    expEndDiv.appendChild(expEndLabel)
    expEndDiv.appendChild(expEndInput)

    form.appendChild(expNameDiv);
    form.appendChild(expLeaderDiv);
    form.appendChild(expStartDiv);
    form.appendChild(expEndDiv);

    return form;
}

function toggleExpeditionFormVisibility(){
    const newExpForm = document.querySelector(".newExpedition-form");
    if(newExpForm.style.display !== "block") {
        newExpForm.style.display = "block";
        return
    }
    newExpForm.style.display = "none";
}

export function createNewPlaceForm(){
    const form = document.createElement("form");
    form.classList.add("newPlace-form");

    const placeNameDiv = document.createElement('div');

    const placeNameLabel = document.createElement("label");
    placeNameLabel.setAttribute("for", "newPlace-name");
    placeNameLabel.innerHTML = "Name des Ortes:";

    const placeNameInput = document.createElement("input");
    placeNameInput.setAttribute("name", "newPlace-name");
    placeNameInput.setAttribute("type", "text");
    placeNameInput.id = "newPlace-name";

    placeNameDiv.appendChild(placeNameLabel)
    placeNameDiv.appendChild(placeNameInput)

    const placeLatDiv = document.createElement('div');

    const placeLatLabel = document.createElement("label");
    placeLatLabel.setAttribute("for", "newPlace-lat");
    placeLatLabel.innerHTML = "Latitude:";

    const placeLatInput = document.createElement("input");
    placeLatInput.setAttribute("name", "newPlace-lat");
    placeLatInput.setAttribute("type", "text");
    placeLatInput.id = "newPlace-lat";

    placeLatDiv.appendChild(placeLatLabel)
    placeLatDiv.appendChild(placeLatInput)

    const placeLongDiv = document.createElement('div');

    const placeLongLabel = document.createElement("label");
    placeLongLabel.setAttribute("for", "newPlace-lng");
    placeLongLabel.innerHTML = "Longitude:";

    const placeLongInput = document.createElement("input");
    placeLongInput.setAttribute("name", "newPlace-lng");
    placeLongInput.setAttribute("type", "text");
    placeLongInput.id = "newPlace-lng";

    placeLongDiv.appendChild(placeLongLabel)
    placeLongDiv.appendChild(placeLongInput)

    const placeDateDiv = document.createElement('div');

    const placeDateLabel = document.createElement("label");
    placeDateLabel.setAttribute("for", "newPlace-date");
    placeDateLabel.innerHTML = "Datum:";

    const placeDateInput = document.createElement("input");
    placeDateInput.setAttribute("name", "newPlace-date");
    placeDateInput.setAttribute("type", "date");
    placeDateInput.id = "newPlace-date";

    placeDateDiv.appendChild(placeDateLabel)
    placeDateDiv.appendChild(placeDateInput)

    const placeInfoDiv = document.createElement('div');

    const placeInfoLabel = document.createElement("label");
    placeInfoLabel.setAttribute("for", "newPlace-info");
    placeInfoLabel.innerHTML = "Zitat aus Quelle:";

    const placeInfoInput = document.createElement("input");
    placeInfoInput.setAttribute("name", "newPlace-info");
    placeInfoInput.setAttribute("type", "text");
    placeInfoInput.id = "newPlace-info";

    placeInfoDiv.appendChild(placeInfoLabel)
    placeInfoDiv.appendChild(placeInfoInput)

    const placeSrcDiv = document.createElement('div');

    const placeSrcLabel = document.createElement("label");
    placeSrcLabel.setAttribute("for", "newPlace-src");
    placeSrcLabel.innerHTML = "Quelle:";

    const placeSrcInput = document.createElement("input");
    placeSrcInput.setAttribute("name", "newPlace-src");
    placeSrcInput.setAttribute("type", "text");
    placeSrcInput.id = "newPlace-src";

    placeSrcDiv.appendChild(placeSrcLabel)
    placeSrcDiv.appendChild(placeSrcInput)

    const placeImgDiv = document.createElement('div');
    placeImgDiv.id = "newPlace-img-container"

    const placeImgLabel = document.createElement("label");
    placeImgLabel.setAttribute("for", "newPlace-img");
    placeImgLabel.innerHTML = "Bilder:";

    placeImgDiv.appendChild(placeImgLabel)

    form.appendChild(placeNameDiv);
    form.appendChild(placeLatDiv);
    form.appendChild(placeLongDiv);
    form.appendChild(placeDateDiv);
    form.appendChild(placeInfoDiv);
    form.appendChild(placeSrcDiv);
    form.appendChild(placeImgDiv);

    return form;
}

export function showPlaceForm(){
    const newPlaceForm = document.querySelector(".newPlace-form");
    newPlaceForm.style.display = "block";
}

export function setPlaceFormName(name){
    const nameInput = document.getElementById("newPlace-name")

    nameInput.value = name;
}

export function setPlaceFormLatLng(latlng){
    const lat = latlng.lat;
    const lng = latlng.lng;
    const latInput = document.getElementById("newPlace-lat")
    const lngInput = document.getElementById("newPlace-lng")

    latInput.value = lat;
    lngInput.value = lng;
}

export function setPlaceFormDate(date){
    const dateInput = document.getElementById("newPlace-date")

    dateInput.value = date;
}

export function setPlaceFormInfo(info){
    const infoInput = document.getElementById("newPlace-info")

    infoInput.value = info;
}

export function setPlaceFormSrc(src){
    const srcInput = document.getElementById("newPlace-src")

    srcInput.value = src;
}

export function setPlaceFormImg(img){
    const imgInput = document.getElementById("newPlace-img")

    imgInput.files = img;
}

export function resetPlaceFormImg(){
    const imgInput = document.getElementById("newPlace-img")

    imgInput.value = null;
}