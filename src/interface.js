export function createSubmitButton(id, label){
    const button = document.createElement("button");
    button.id = id;
    button.classList.add("submit-button", "hide")
    button.innerHTML = label
    document.body.appendChild(button);
}