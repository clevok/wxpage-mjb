/**
 * 全局事件模块
 */
let events = {};

/**
 * 订阅
 * @param {String} name 
 * @param {Function} callback 
 * @param {Object} self 
 */
function on(name, callback, self) {
	if(!self) {
		console.warn('缺少this参数'+name);
	}
	if(!events[name]) {
		events[name] = [];
	}

	let tuple = [self, callback],
		callbacks = events[name];

	// 往头部添加
	callbacks.unshift(tuple);

	// 重复绑定
	let num = 0,
		l   = callbacks.length;
	for(let i = 0; i < l; i++) {
		let tuple    = callbacks[i];
		if(tuple[0] == self) {
			num += 1;
		}
	}
	if(num>1) {
		console.warn('发现重复绑定'+name);
	}
	if(num == 0) {
		console.warn('绑定失败'+name);
	}
}

/**
 * 一个页面只能订阅一次, 后一个覆盖前一个
 * @param {String} name 
 * @param {Function} callback 
 * @param {Object} self 
 */
function once(name, callback, self) {
	if(!self) {
		console.warn('缺少this参数'+name);
	}
	if(!events[name]) {
		events[name] = [];
	}
	let callbacks = events[name],
		l = callbacks.length;

	for(let i = 0; i < l; i++) {
		let item = callbacks[i];
		if(!item) {
			continue;
		}
		if(item[0] == self) {
            
			callbacks.splice(i, 1);
			i-=1;
			l-=1;
		}
	}
	if(!callback) {
		console.warn('传入空回调函数'+name);
	}
	// 往头部添加
	let tuple = [self, callback];
	callbacks.unshift(tuple);
}

/**
 * 一个页面只能订阅一次, 不允许被覆盖
 * @param {String} name 
 * @param {Function} callback 
 * @param {Object} self 
 */
function onfirst(name, callback, self) {
	if(!self) {
		console.warn('缺少this参数'+name);
	}
	if(!events[name]) {
		events[name] = [];
	}
	let callbacks = events[name],
		l = callbacks.length,
		num = 0;

	for(let i = 0; i < l; i++) {
		let item = callbacks[i];
		if(!item) {
			continue;
		}
		if(item[0] == self) {
			num +=1;
			break;
		}
	}

	// 确认没有注册过才添加
	if(!num) {
		let tuple = [self, callback];
		callbacks.unshift(tuple);
	}
}

/**
 * 删除
 * @param {String} name 
 * @param {Object} self 
 */
function remove(name, self) {
	if(!events[name]) {
		events[name] = [];
	}

	let callbacks = events[name];
	let l = callbacks.length;
	if(l == 0) {
		console.error('移除空监听'+name);
		return;
	}
	for(let i = 0; i < l; i++) {
		if(callbacks[i][0] == self) {
			callbacks.splice(i, 1);
			i-=1;
			l-=1;
		}
	}
	// console.log('删除'+name+'监听,剩余事件数'+callbacks.length);
}

/**
 * 发布
 * @param {String} name 
 * @param {Object} data 
 */
function emitAll(name, data) {
	var callbacks = events[name];
	if(!callbacks || callbacks.length < 0) {
		return;
	}

	let l = callbacks.length;
    
	for(let i = 0; i < l; i++) {
		let tuple    = callbacks[i],
			self     = tuple[0],
			callback = tuple[1],
			_argument = [];
            
		try{
			_argument = [].slice.apply(arguments);
			_argument.shift();
		}catch(err) {
			console.error('emitAll解析数据失败', err)
		}
		if(callback) {
			try{
				callback.apply(self, [..._argument, i]);
			}catch(e) {
				console.error('响应失败emitAll', e)
			}
		}
	}
}
/**
 * 发布 只发布第一个人
 * @param {String} name 
 * @param {Object} data 
 */
function emit(name, data) {
	let callbacks = events[name],
		l         = 0;
    
	if(callbacks) {
		l = callbacks.length;
	}
	if(l <= 0) {
		console.error('空响应'+name);
		return;
	}

	let tuple    = callbacks[0],
		self     = tuple[0],
		callback = tuple[1],
		_argument = [];

	try{
		_argument = [].slice.apply(arguments);
		_argument.shift();
	}catch(err) {

	}
	callback.apply(self, [..._argument, 0]);
}

module.exports = {
	on,
	once,
	onfirst,
	remove,
	emit,
	emitAll
}
export default {
	on,
	once,
	onfirst,
	remove,
	emit,
	emitAll
};