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
    let x0 = Math.cos(coordinate1.longitude) * Math.sin(coordinate1.latitude);
    let y0 = Math.sin(coordinate1.longitude) * Math.sin(coordinate1.latitude);
    let z0 = Math.cos(coordinate1.latitude);
    let x1 = Math.cos(coordinate2.longitude) * Math.sin(coordinate2.latitude);
    let y1 = Math.sin(coordinate2.longitude) * Math.sin(coordinate2.latitude);
    let z1 = Math.cos(coordinate2.latitude);
    let t = y1 / (y1-y0);
    let x = t * x0 + (1-t) * x1;
    let z = t * z0 + (1-t) * z1;
    return Math.atan(z / x);
}

export function copyPath(array, addLong) {
    for (let i=0; i < array.length; i++){
        array[i] = parseFloat(array[i]) + addLong;
    }
    return array;
}