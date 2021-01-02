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