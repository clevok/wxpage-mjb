var fns = require('./fns');

/**
 * 混入 污染传入源, 注意了
 * 如果已有相同方法, 会先执行混入的方法, 混入多个对象, 已后面的最先执行
 * @param {*} obj 被深拷贝的对象
 */
function mixins (ctx) {
	if (!ctx) {
		return console.error(`mixins obj is null`)
	}

	let args = Array.prototype.slice.call(arguments, 1).filter(element => {
		if (element) return element;
	});

	args.forEach(element => {
		Object.keys(element).forEach(keys => {
			if (!ctx[keys]) {
				ctx[keys] = element[keys];
			}
			else if (fns.type(element[keys]) !== fns.type(ctx[keys])) {
				console.error('mixins 混入相同key对象类型不一致');
			}
			else if (fns.type(element[keys]) === 'function') {
				ctx[keys] = fns.wrapFun(ctx[keys], element[keys])
			}
			else if (fns.type(element[keys]) === 'object') {
				Object.assign(ctx[keys], element[keys]);
			}
		});
	});
	return ctx;
};

module.exports = mixins;