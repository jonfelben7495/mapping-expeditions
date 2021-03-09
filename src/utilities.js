export function compareBySequence(a, b) {
    a = parseInt(a.sequence);
    b = parseInt(b.sequence);
    if ( a < b){
        return -1;
    }
    if ( a > b ){
        return 1;
    }
    return 0;
}

export function calculateLatForDateline(coordinate1, coordinate2){
/*    let x0 = Math.cos(coordinate1.lng) * Math.sin(coordinate1.lat);
    let y0 = Math.sin(coordinate1.lng) * Math.sin(coordinate1.lat);
    let z0 = Math.cos(coordinate1.lat);
    let x1 = Math.cos(coordinate2.lng) * Math.sin(coordinate2.lat);
    let y1 = Math.sin(coordinate2.lng) * Math.sin(coordinate2.lat);
    let z1 = Math.cos(coordinate2.lat);
    let t = y1 / (y1-y0);
    let x = t * x0 + (1-t) * x1;
    let z = t * z0 + (1-t) * z1;*/
    return (parseFloat(coordinate1.lat) + parseFloat(coordinate2.lat))/2
    // return Math.atan(z / x);
}

export function copyPath(obj, addLong) {
    obj.lng = obj.lng + addLong;
    return obj
}

export function getSizeOfObject(obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

export function concatArray(array) {
    let concatArray = []
    concatArray = concatArray.concat(array[0], array[1])
    return concatArray;
}

export function buildImagePath(exp, seq, file) {
    return "http://mapping-expeditions.de/images/" + exp + "/" + seq + "/" + file
}

export function removeMultipleLayers(layers, map){
    for (const [key, value] of Object.entries(layers)) {
        if(!value._url){
            map.removeLayer(value)
        }
    }
}

export function getColorForExpedition(exp_id) {
    const lineColors = [
        "#a93226",
        "#7d3c98",
        "#2e86c1",
        "#17a589",
        "#229954",
        "#f1c40f",
        "#d35400",
        "#34495e"
    ]
    return lineColors[exp_id]
}

export function transformCoordinatesArrayToObjects(coordinates){
    for(let i = 0; i < coordinates.length;i++){
        coordinates[i] = {lat: coordinates[i][0], lng: coordinates[i][1]}
    }
}

export function combineLatLngArraysOfFeature(feature){
    for(let i=0;i<feature._latlngs[1].length;i++){
        feature._latlngs[0].push(feature._latlngs[1][i])
    }
}

export function ordinal_suffix_of(i) {
    i = parseInt(i)
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}