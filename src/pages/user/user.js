
let event = require('../../core/event');
let config = require('../../core/config');

var a = {
	data: {
		name: wx.getStorageSync('user'),
		event: event,
		demo1: config.demo1,
		demo2: config.demo2.name
	},
	onPreload: function (res) {
		console.log('[pages/play] 页面预加载:', res)
	},
	onNavigate: function (res) {
		console.log('[pages/play] 页面将要跳转：', res)
	},
	onLoad: function(res) {
		console.log(event);
		console.log(this.data.event);
		
		console.log('[pages/play] 页面完成加载', res)
		let t = this.$take('t')
	},
	onShow: function () {
		console.log('[pages/play] 页面展示')
	},
	onReady: function () {
		console.log('[pages/play] 页面已就绪')
	}
}
event.on('change', ()=> {
	config.demo1 = '更改';
	config.demo2.name = '更改';
	
	wx.navigateTo({
		url: '/pages/user/user'
	})
}, 'user');

Page.P('/pages/user/user', a)
