/**
 * Requests and returns the markers of a given expedition from the database
 * @param {string} exp_id - The ID of the expedition.
 */
export async function getExpeditionMarkers(exp_id) {
    return await makeRequest("GET", "http://mapping-expeditions.de/api/loadExpedition.php?q=" + exp_id);
}

/**
 * Requests and returns the route of a given expedition from the database
 * @param {string} exp_id - The ID of the expedition.
 */
export async function getExpeditionRoute(exp_id) {
    return await makeRequest("GET", "http://mapping-expeditions.de/api/loadRoute.php?q=" + exp_id);
}

/**
 * Requests and returns last (or rather largest) expedition id from the database.
 * @return {int} expedition id
 */
export async function getLastExpeditionId(){
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastExpedition.php");
    result = result[0];
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

/**
 * Requests and returns the sequence number of the last marker of a given expedition from the database.
 * @param {string} exp_id - The ID of the expedition.
 * @return {int} sequence
 */
export async function getLastMarkerSequence(exp_id){
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastMarker.php?q=" + exp_id);
    result = result[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}
/**
 * Requests and returns the sequence number of the last point of the route of a given expedition from the database.
 * @param {string} exp_id - The ID of the expedition.
 * @return {int} sequence
 */
export async function getLastSequenceOfRoute(exp_id){
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastSequence.php?q=" + exp_id);
    result = result[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

/**
 * Requests and returns last (or rather largest) place id from the database.
 * @return {int} placeID
 */
export async function getLastPlaceId() {
    let result = await makeRequest("GET", "http://mapping-expeditions.de/api/getLastPlaceId.php");
    result = result[0]
    result = result[Object.keys(result)[0]];
    if (result !== null) {
        return parseInt(result);
    }
    return 0;
}

/**
 * Requests and returns an JSON object of image meta data (paths etc.) for a given combination of expedition and place id.
 * @return JSON object
 */
export async function getImages(exp, place){
    return await makeRequest("GET", "http://mapping-expeditions.de/api/loadImages.php?e=" + exp + "&p=" + place);
}

/**
 * Sends expedition data to the expeditions table in the database.
 * @param {string} exp_id - ID of the expedition
 * @param {string} name - Name of the expedition
 * @param {string} leader - Leader of the expedition
 * @param {string} startdate - Start date of the expedition
 * @param {string} enddate - End date of the expedition
 */
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

/**
 * Sends data of a marker to the places_in_expeditions table in the database.
 * @param {string} exp_id - ID of the expedition
 * @param {string} placeid - ID of the place
 * @param {string} seq - Sequence number of the marker inside the expedition
 * @param {string} name - Name of the place
 * @param {string} date - Date when expedition arrived at the place
 * @param {string} info - Info text regarding the stay at the place
 * @param {string} src - Source of info text
 * @param {bool} hasImages - Whether there are images of the places stored or not
 */
export async function sendMarker(exp_id, placeid, seq, name, date, info, src, hasImages){
    hasImages = hasImages ? 1 : 0;
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

/**
 * Sends data of a place to the places table in the database.
 * @param {string} placeid - ID of the place
 * @param {string} name - Name of the place
 * @param {string} lat - Latitude of the place
 * @param {string} lng - Longitude of the place
 */
export async function sendPlace(placeid, name, lat, lng){
    let obj = {
        "placeid": placeid,
        "name": name,
        "lat": lat,
        "lng": lng
    }
    await sendRequest("http://mapping-expeditions.de/api/savePlace.php", obj)

}

/**
 * Sends and saves images on the server.
 * @param {formData} files - Uploaded image files
 * @param {string} expeditionId - ID of the expedition
 * @param {string} placeId - ID of the place
 */
export async function saveImages(files, expeditionId, placeId){
    fetch("http://mapping-expeditions.de/api/saveImages.php?e="+ expeditionId + "&p=" + placeId, {
        method: 'POST',
        body: files,
    }).then((response) => {
    })
}

/**
 * Sends image meta data to the images table of the database.
 * @param {string} exp_id - ID of the expedition
 * @param {string} place_id - ID of the place
 * @param {string} seq - Sequence number of the place inside the expedition
 * @param {string} fileName - Name of the image file
 * @param {string} description - Description text of the image
 * @param {string} creator - Creator of the image
 * @param {string} src - Source of the image
 */
export async function sendImage(exp_id, place_id, seq, fileName, description, creator, src) {
    let obj = {
        "exp_id": exp_id,
        "place_id": place_id,
        "seq": seq,
        "fileName": fileName,
        "description": description,
        "creator": creator,
        "src": src
    }
    await sendRequest("http://mapping-expeditions.de/api/sendImage.php", obj)
}

/**
 * Sends and saves the route of an expedition to the expedition_routes table of the database.
 * @param {string} exp_id - ID of the expedition
 * @param {array} array - Array of coordinates making up the route
 */
export async function sendRoute(exp_id, array){
    let obj = {
        "exp_id": exp_id,
        "array": array
    }
    await sendRequest("http://mapping-expeditions.de/api/saveRoute.php", obj)

}

/**
 * Updates data of a marker in the places_in_expeditions table in the database.
 * @param {string} expId - ID of the expedition
 * @param {string} placeId - ID of the place
 * @param {string} sequence - Sequence number of the marker inside the expedition
 * @param {string} name - Name of the place
 * @param {string} date - Date when expedition arrived at the place
 * @param {string} info - Info text regarding the stay at the place
 * @param {string} src - Source of info text
 * @param {bool} hasImages - Whether there are images of the places stored or not
 */
export async function updateMarkerData(expId, placeId, name, sequence, date, info, src, hasImages) {
    hasImages = hasImages ? 1 : 0;
    let obj = {
        "expId": expId,
        "placeId": placeId,
        "name": name,
        "sequence": sequence,
        "date": date,
        "info": info,
        "src": src,
        "hasImages": hasImages
    }
    await sendRequest("http://mapping-expeditions.de/api/updateMarkerData.php", obj)
}

/**
 * Updates data of a place in the places table in the database.
 * @param {string} placeId - ID of the place
 * @param {string} name - Name of the place
 * @param {string} lat - Latitude of the place
 * @param {string} lng - Longitude of the place
 */
export async function updatePlace(placeId, name, lat, lng) {
    let obj = {
        "placeId": placeId,
        "name": name,
        "lat": lat,
        "lng": lng
    }
    await sendRequest("http://mapping-expeditions.de/api/updatePlace.php", obj)
}

/**
 * Deletes a route from the expedition_routes table in the database.
 * @param {string} expId - ID of the expedition
 */
export async function deleteRoute(expId) {
    let obj = {
        "expId": expId
    }
    await sendRequest("http://mapping-expeditions.de/api/deleteRoute.php", obj)
}

/**
 * Makes a basic request to retrieve data.
 * @param {string} method - Method of the http request
 * @param {string} url - URL of the php file to make the request to
 */
async function makeRequest(method, url) {
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

    })
    return response.json()
}

/**
 * Send a basic POST request to store data.
 * @param {string} url - URL of the php file to make the request to
 * @param {object} data - JSON object containing the data
 */
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