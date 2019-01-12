
let event = require('../../core/event');
let config = require('../../core/config');

event.on('preload', ()=> {
	console.log(item.data.demo2);
	setTimeout(()=> {
		wx.navigateTo({
			url: 'B'
		})
	}, 500);
	
}, 'a');

let item = {
	data: {
		demo2: config.demo2
	},
	onPreload: function () {
		console.log('[pages/play] 页面预加载:')
	},
	onLoad: function () {
		console.log(this.data.demo2);
		console.log('config', config.demo2)
	},
	onReady: function () {
		console.log('[pages/play] 页面已就绪')
	}
}

Page(item);