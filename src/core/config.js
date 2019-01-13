
exports.placeTyps = Object.freeze({
	// {text: '全部', value: 0}, 
	1: {text: '酒吧', value: 1}, 
	2: {text: '健身房', value: 2},
	3: {text: '旅社', value: 3},
	4: {text: '桑拿', value: 4},
	5: {text: '户外场所', value: 5},
	6: {text: '其他', value: 6},
	7: {text: '公园', value: 7},
	8: {text: '疾控中心', value: 8}
});

exports.ArtsStatus = Object.freeze({
	// {text: '全部', value: 0}, 
	1: {text: '八卦', value: 1},
	2: {text: '型男', value: 2},
	3: {text: '同文', value: 3},
	4: {text: '百度网盘', value: 4},     
	5: {text: '相亲帖', value: 5},
	6: {text: '电影资源', value: 6}
});

exports.demo1 = 'demo1'
exports.demo2 = {
	name: 'demo2'
}
exports.demo3 = [{name: 1}, {name: 2}]

let lib = {
	'detail' : {age: 3}
}
exports.lib = lib;
exports.getStatus = function (name) {
	return lib[name]||{};
}
exports.setStatus = (name, value) =>  {
	lib[name] = value;
}