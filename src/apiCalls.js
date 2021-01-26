export async function getExpeditionMarkers(exp_id) {
    return await makeRequest("GET", "http://mapping-expeditions.de/api/loadExpedition.php?q=" + exp_id);
}

export async function getExpeditionRoute(exp_id) {
    return await makeRequest("GET", "http://mapping-expeditions.de/api/loadRoute.php?q=" + exp_id);
}

export async function getLastExpeditionId(){
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastExpedition.php");
    result = JSON.parse(result)[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

export async function getLastMarkerSequence(exp_id){
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastMarker.php?q=" + exp_id);
    result = JSON.parse(result)[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

export async function getLastSequenceOfRoute(exp_id){
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastSequence.php?q=" + exp_id);
    result = JSON.parse(result)[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

export async function getLastPlaceId() {
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastPlaceId.php");
    result = JSON.parse(result)[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

export async function getImages(exp, place){
    return await makeRequest("GET", "http://mapping-expeditions.de/api/loadImages.php?e=" + exp + "&p=" + place);
}

export async function sendExpedition(exp_id, name, leader, startdate, enddate){
    let obj = {
        "exp_id": exp_id,
        "name": name,
        "leader": leader,
        "startdate": startdate,
        "enddate": enddate
    }
    await sendRequest("http://mapping-expeditions.de/api/saveExpedition.php", obj)
}

export async function sendMarker(exp_id, placeid, seq, name, date, info, src, hasImages){
    hasImages = hasImages ? 1 : 0;
    console.log(hasImages)
    let obj = {
        "exp_id": exp_id,
        "placeid": placeid,
        "sequence": seq,
        "name": name,
        "date": date,
        "info": info,
        "src": src,
        "hasImages": hasImages
    }
    await sendRequest("http://mapping-expeditions.de/api/saveMarker.php", obj)

}

export async function sendPlace(placeid, name, lat, lng){
    let obj = {
        "placeid": placeid,
        "name": name,
        "lat": lat,
        "lng": lng
    }
    await sendRequest("http://mapping-expeditions.de/api/savePlace.php", obj)

}

export async function saveImages(files, expeditionId, placeId){
    fetch("http://mapping-expeditions.de/api/saveImages.php?e="+ expeditionId + "&p=" + placeId, {
        method: 'POST',
        body: files,
    }).then((response) => {
    })
}

export async function sendImage(exp_id, place_id, seq, fileName) {
    let obj = {
        "exp_id": exp_id,
        "place_id": place_id,
        "seq": seq,
        "fileName": fileName
    }
    await sendRequest("http://mapping-expeditions.de/api/sendImage.php", obj)
}

export async function sendRoute(exp_id, seq, lat, lng){
    let obj = {
        "exp_id": exp_id,
        "sequence": seq,
        "lat": lat,
        "lng": lng
    }
    await sendRequest("http://mapping-expeditions.de/api/saveRoute.php", obj)

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


async function sendRequest(url, data){
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data)
    })
    return response
}