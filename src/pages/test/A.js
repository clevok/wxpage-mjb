
let event = require('../../core/event');
let config = require('../../core/config');
let item = {
	data: {
		list: [1,2,3,5,6,8,7,5,4]
	},
	onPreload: function () {
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