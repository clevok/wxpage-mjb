
let event = require('../../core/event');
let config = require('../../core/config');
const { router } = require('../../router');
let index = 0;

event.on('preload', () => {
	index++;

	config.demo2.name = `change${index}`;
	config.demo1 = `change${index}`; // 无效
	config.demo3.shift();

	item.onProled();
	setTimeout(() => {
		wx.navigateTo({
			url: 'B'
		})
	}, 500);

}, 'a');

let item = {
	data: {
		name: wx.getStorageSync('page'),
		demo1: config.demo1, // 因为是按值类型, 哪怕后来刚刚了config.demo1, Page再加载的时候, 也不变了。
		demo2: config.demo2, // 影响 按引用
		// demo2: {
		// 	name: 2
		// }, // 影响 按引用
		// demo3: config.demo3
		demo3: config.demo3
	},
	onLoad() {
		console.log(this.data);
	},
	onProled() {
		// 2.4.0以及一下的版本 视图能生效, 但是data内的变量不变 
		this.data.demo2.name = 'onProled';

		this.data.demo1 = 'onProled2'
	}

};
// Page.P('/page/test/B', item);
Page(item)
