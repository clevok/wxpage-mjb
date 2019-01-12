
let event = require('../../core/event');
let config = require('../../core/config');

let item = {
	data: {
	},
	onPreload: function () {
		config.demo2.name = 'change';
		event.emit('preload');
	},
	onNavigate: function (res) {
		console.log('[pages/play] 页面将要跳转：', res)
	},
	onLoad: function () {
	},
	onShow: function () {
		console.log('[pages/play] 页面展示')
	},
	onReady: function () {
		console.log('[pages/play] 页面已就绪')
	}
}

Page(item);