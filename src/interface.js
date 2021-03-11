import {addDrawEventListener, deleteDrawnItems, initDrawControl, removeDrawControl, setLayerName} from "./draw";
import {getLastExpeditionId} from "./apiCalls";
import {combineLatLngArraysOfFeature, removeAllLayers, removeMultipleLayers} from "./utilities";
import {loadExpedition} from "./expedition";

let currentLayer = "";
let state = {
    drawControlActivated: false
}

/**
 * Creates and returns a submit button for the interface.
 * @param {string} id - ID for the button
 * @param {string} label - Label for the button
 */
export function createSubmitButton(id, label){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("submit-button", "hide")
    button.innerHTML = label

    return button
}

/**
 * Creates and returns a button for adding a new expedition for the interface.
 * @param {string} id - ID for the button
 * @param {string} label - Label for the button
 * @param {Object} map - Leaflet map object
 */
export function createNewExpeditionButton(id, label, map){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("newExpedition-button")
    button.innerHTML = label

    button.addEventListener('click', async function(){
        addDrawEventListener(map, true);
        changeExplanationText("add")
        toggleExpeditionFormVisibility()
        toggleFormsVisibility()
        hideNewAndAddButtons()
        showCancelButton()
        clearAllInputFields()
    })

    return button;
}

/**
 * Creates and returns a button for editing an expedition for the interface.
 * @param {string} id - ID for the button
 * @param {string} label - Label for the button
 * @param {Object} map - Leaflet map object
 * @param {string} interfaceid - ID of the interface container
 * @param {array} expeditions - Array of all expeditions
 */
export function createAddToExpeditionButton(id, label, map, interfaceid, expeditions){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("addToExpedition-button")
    button.innerHTML = label

    button.addEventListener('click', async function(){
        let allElements = getAllElementsFromArray(expeditions)
        addOnClickToAllElements(allElements, map);
        changeExplanationText("editStart")
        toggleExpeditionFormVisibility()
        toggleFormsVisibility()
        hideNewAndAddButtons()
        showCancelButton()
    })

    return button;
}

/**
 * Creates and returns a button for cancelling for the interface.
 * @param {string} id - ID for the button
 * @param {string} label - Label for the button
 * @param {Object} map - Leaflet map object
 */
export function createCancelButton(id, label, map){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("cancel-button", "hide")
    button.innerHTML = label

    button.addEventListener('click', async function(){
        let lastExpeditionId = await getLastExpeditionId();
        removeDrawControl(map)
        toggleFormsVisibility()
        showNewAndAddButtons()
        hideCancelAndSaveButton()
        deleteDrawnItems(map)
        changeExplanationText("")
        hideAddExpeditionInterface(map)
        removeMultipleLayers(map._layers, map)
        for (let i = 1; i <= lastExpeditionId; i++) {
            await loadExpedition(i, map)
        }
    })

    return button;
}

/**
 * Creates and returns a form to add expedition info to for the interface.
 */
export function createNewExpeditionForm(){
    const form = document.createElement("form");
    form.classList.add("newExpedition-form", "hide");

    const expNameDiv = document.createElement('div');


    const expNameLabel = document.createElement("label");
    expNameLabel.setAttribute("for", "newExpedition-name");
    expNameLabel.innerHTML = "Expedition name:";

    const expNameInput = document.createElement("input");
    expNameInput.setAttribute("name", "newExpedition-name");
    expNameInput.setAttribute("type", "text");
    expNameInput.id = "newExpedition-name";

    expNameDiv.appendChild(expNameLabel)
    expNameDiv.appendChild(expNameInput)

    const expLeaderDiv = document.createElement('div');

    const expLeaderLabel = document.createElement("label");
    expLeaderLabel.setAttribute("for", "newExpedition-leader");
    expLeaderLabel.innerHTML = "Expedition leader:";

    const expLeaderInput = document.createElement("input");
    expLeaderInput.setAttribute("name", "newExpedition-leader");
    expLeaderInput.setAttribute("type", "text");
    expLeaderInput.id = "newExpedition-leader";

    expLeaderDiv.appendChild(expLeaderLabel)
    expLeaderDiv.appendChild(expLeaderInput)

    const expStartDiv = document.createElement('div');

    const expStartLabel = document.createElement("label");
    expStartLabel.setAttribute("for", "newExpedition-startDate");
    expStartLabel.innerHTML = "Start date:";

    const expStartInput = document.createElement("input");
    expStartInput.setAttribute("name", "newExpedition-startDate");
    expStartInput.setAttribute("type", "date");
    expStartInput.id = "newExpedition-startDate";

    expStartDiv.appendChild(expStartLabel)
    expStartDiv.appendChild(expStartInput)

    const expEndDiv = document.createElement('div');

    const expEndLabel = document.createElement("label");
    expEndLabel.setAttribute("for", "newExpedition-endDate");
    expEndLabel.innerHTML = "End date:";

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

/**
 * Creates and returns a container for explanation texts for the interface.
 */
export function createExplanationText(){
    const explanation = document.createElement("div");
    explanation.id = "explanation";
    return explanation
}

/**
 * Changes the content of the explanation text container based on the use case.
 * @param {string} useCase - Describes which text should be loaded
 */
export function changeExplanationText(useCase){
    let explanation = document.getElementById("explanation")
    if (useCase === "add") {
        explanation.innerHTML = "You can add new stations or markers for the expedition by choosing 'Draw a marker' in the draw options on the left side. The route of the expedition can be drawn with a polyline ('Draw a polyline'). You can always edit your drawn items with 'Edit layers'. Push your input to the database with the 'Save' button."
    } else if (useCase === "editStart"){
        explanation.innerHTML = "Choose an expedition to edit by clicking on one of its markers or its route."
    } else if (useCase === "edit") {
        explanation.innerHTML = "You can add new stations or markers for the expedition by choosing 'Draw a marker' in the draw options on the left side. You can either add to the route of the expedition by drawing a new polyline (which will add your input to the end of the route) or by editing the already exisiting polyline with 'Edit layers'. Push your changes to the database with the 'Save' button."
    } else {
        explanation.innerHTML = useCase
    }
}

/**
 * Toggles the visibility of the expedition form.
 */
function toggleExpeditionFormVisibility(){
    const newExpForm = document.querySelector(".newExpedition-form");
    if(newExpForm.style.display !== "block") {
        newExpForm.classList.remove("hide")
        return
    }
    newExpForm.classList.add("hide")
}

/**
 * Toggles the visibility of all forms.
 */
function toggleFormsVisibility(){
    const forms = document.getElementById("forms")
    if(forms.style.display !== "block") {
        forms.classList.remove("hide")
        return
    }
    forms.classList.add("hide")
}

/**
 * Creates and returns a form for adding information about a place for the interface.
 */
export function createNewPlaceForm(){
    const form = document.createElement("form");
    form.classList.add("newPlace-form", "hide");

    const placeNameDiv = document.createElement('div');

    const placeNameLabel = document.createElement("label");
    placeNameLabel.setAttribute("for", "newPlace-name");
    placeNameLabel.innerHTML = "Place name:";

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
    placeDateLabel.innerHTML = "Date:";

    const placeDateInput = document.createElement("input");
    placeDateInput.setAttribute("name", "newPlace-date");
    placeDateInput.setAttribute("type", "date");
    placeDateInput.id = "newPlace-date";

    placeDateDiv.appendChild(placeDateLabel)
    placeDateDiv.appendChild(placeDateInput)

    const placeInfoDiv = document.createElement('div');

    const placeInfoLabel = document.createElement("label");
    placeInfoLabel.setAttribute("for", "newPlace-info");
    placeInfoLabel.innerHTML = "Quote from source:";

    const placeInfoInput = document.createElement("input");
    placeInfoInput.setAttribute("name", "newPlace-info");
    placeInfoInput.setAttribute("type", "text");
    placeInfoInput.id = "newPlace-info";

    placeInfoDiv.appendChild(placeInfoLabel)
    placeInfoDiv.appendChild(placeInfoInput)

    const placeSrcDiv = document.createElement('div');

    const placeSrcLabel = document.createElement("label");
    placeSrcLabel.setAttribute("for", "newPlace-src");
    placeSrcLabel.innerHTML = "Source:";

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
    placeImgLabel.innerHTML = "Images:";

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
/**
 * Hides the expedition form.
 */
export function hideExpeditionForm(){
    const newPlaceForm = document.querySelector(".newExpedition-form");
    newPlaceForm.classList.add("hide")
}

/**
 * Shows the place form.
 */
export function showPlaceForm(){
    const newPlaceForm = document.querySelector(".newPlace-form");
    newPlaceForm.classList.remove("hide")
}

/**
 * Hides the place form.
 */
export function hidePlaceForm(){
    const newPlaceForm = document.querySelector(".newPlace-form");
    newPlaceForm.classList.add("hide")
}

/**
 * Shows the image form.
 */
export function showImgForm(){
    const imgForm = document.querySelector("#images-forms");
    imgForm.classList.remove("hide")
}

/**
 * Hides the image form.
 */
export function hideImgForm(){
    const imgForm = document.querySelector("#images-forms");
    imgForm.classList.add("hide")
}

/**
 * Sets the name input of the place form to a given value.
 * @param {string} name - Place name
 */
export function setPlaceFormName(name){
    const nameInput = document.getElementById("newPlace-name")

    nameInput.value = name;
}

/**
 * Sets the lat and lng inputs of the place form to given values.
 * @param {Object} latlng - Object containing coordinates
 */
export function setPlaceFormLatLng(latlng){
    const lat = latlng.lat;
    const lng = latlng.lng;
    const latInput = document.getElementById("newPlace-lat")
    const lngInput = document.getElementById("newPlace-lng")

    latInput.value = lat;
    lngInput.value = lng;
}

/**
 * Sets the date input of the place form to a given value.
 * @param {string} date - Date when a place was reached
 */
export function setPlaceFormDate(date){
    const dateInput = document.getElementById("newPlace-date")

    dateInput.value = date;
}

/**
 * Sets the info input of the place form to a given value.
 * @param {string} info - Information about a place
 */
export function setPlaceFormInfo(info){
    const infoInput = document.getElementById("newPlace-info")

    infoInput.value = info;
}

/**
 * Sets the src input of the place form to a given value.
 * @param {string} src - Source of info
 */
export function setPlaceFormSrc(src){
    const srcInput = document.getElementById("newPlace-src")

    srcInput.value = src;
}

/**
 * Hides the buttons for adding and editing expeditions.
 */
function hideNewAndAddButtons(){
    let newButton = document.querySelector(".newExpedition-button");
    let addButton = document.querySelector(".addToExpedition-button");

    newButton.classList.add("hide")
    addButton.classList.add("hide")
}

/**
 * Hides the buttons for canceling and saving.
 */
function hideCancelAndSaveButton(){
    let cancelButton = document.querySelector(".cancel-button");
    let saveButton = document.querySelector(".submit-button");

    cancelButton.classList.add("hide")
    saveButton.classList.add("hide")
}

/**
 * Shows the buttons for adding and editing expeditions.
 */
function showNewAndAddButtons(){
    let newButton = document.querySelector(".newExpedition-button");
    let addButton = document.querySelector(".addToExpedition-button");

    newButton.classList.remove("hide")
    addButton.classList.remove("hide")
}

/**
 * Shows the cancel button.
 */
function showCancelButton(){
    let cancelButton = document.querySelector(".cancel-button");

    cancelButton.classList.remove("hide")
}

/**
 * Hides all features for adding an expedition and removes the draw controls.
 * @param {Object} map - Leaflet map object
 */
export function hideAddExpeditionInterface(map){
    hideExpeditionForm();
    hidePlaceForm();
    hideImgForm();
    toggleFormsVisibility()
    hideCancelAndSaveButton();
    showNewAndAddButtons();
    removeDrawControl(map)
}

/**
 * Iterates over an array of expeditions and returns all their defining layers.
 * @param {array} array - Array of expeditions
 */
function getAllElementsFromArray(array){
    let returnArray = [];
    for (let i=0;i<array.length;i++){
        returnArray.push(array[i][0])
        returnArray.push(array[i][1])
    }
    return returnArray
}

/**
 * First removes all event listeners from a given array of layers. Then adds an event listener for preparing the map for editing.
 * @param {array} array - Array of expeditions
 * @param {Object} map - Leaflet map object
 */
function addOnClickToAllElements(array, map){
    for(let i=0;i<array.length;i++){
        if(Array.isArray(array[i])) {
            for(let j=0;j<array[i].length;j++){
                array[i][j]._events.click = [];
                array[i][j].on('click', function (){
                    prepareMapForEdit(map, array, array[i][j].expId)
                })
            }
        } else {
            if(array[i] !== null) {
                array[i]._events.click = [];
                array[i].on('click', function(){
                    prepareMapForEdit(map, array, array[i].expId)
                })
            }
        }

    }
}

/**
 * Hides the info container and removes all unnecessary layers e.g. all layers that dont belong to a given expedition id.
 * @param {Object} map - Leaflet map object
 * @param {array} array - Array of expeditions
 * @param {string} expId - ID of the expedition which layers should remain on the map
 */
function prepareMapForEdit(map, array, expId){
    let objects = [];
    hideInfoContainer()
    for(let i=0;i<array.length;i++){
        if(Array.isArray(array[i])) {
            for(let j=0;j<array[i].length;j++){
                if(array[i][j].expId !== expId){
                    map.removeLayer(array[i][j])
                } else {
                    objects.push(array[i][j])
                }
            }
        } else {
            if(array[i] === null){
                break;
            }
            if(array[i].expId !== expId){
                map.removeLayer(array[i])
            } else {
                if(array[i]._latlngs.length > 1){
                    combineLatLngArraysOfFeature(array[i])
                }
                objects.push(array[i])
            }
        }
    }
    changeExplanationText("edit")
    addDrawEventListener(map, false, objects)
}

/**
 * Hides the info container.
 */
function hideInfoContainer(){
    let container = document.getElementById("info-container")
    container.classList.add("hide")
}

/**
 * Shows the save button.
 */
export function showSaveButton(){
    const submitButton = document.getElementById('button-submit');
    submitButton.classList.remove("hide")
}

/**
 * Emptmies the values of all input fields.
 */
function clearAllInputFields(){
    let inputs = document.querySelectorAll("input");
    for(let i=0;i<inputs.length;i++){
        inputs[i].value = ""
    }
}
