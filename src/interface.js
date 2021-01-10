import {addDrawEventListener, initDrawControl} from "./draw";
import {getLastExpeditionId} from "./apiCalls";

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

        const userInterface = document.getElementById(interfaceid);
        const expForm = createNewExpeditionForm()
        userInterface.appendChild(expForm)
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

function createNewExpeditionForm(){
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