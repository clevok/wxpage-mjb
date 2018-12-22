module.exports = function () {
    let l = arguments.length,
        obj = {};
    for(let i = 0; i < l; i++) {
        
        let min = arguments[i];
        for(let e in min) {
            if(!obj[e]) {
                obj[e] = min[e];
                continue;
            }
            
            if(typeof min[e] == 'object') {
                obj[e] = Object.assign(obj[e]||{}, min[e]);
                continue;
            }
            obj[e] = min[e];
        }
    }
    return obj;
};