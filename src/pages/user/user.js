
let event = require('../../core/event');
let config = require('../../core/config');

var item = {
	data: {
		name: wx.getStorageSync('user'),
		event: event,
		demo1: config.demo1,
		demo2: config.demo2,
		demo2Name: config.demo2.name
	},
	click () {
		// this.setData({
		// 	['demo2.name']: 'along'
		// });
		item.data.demo2.name = 'click主动修改'
		console.log(this.data);
		console.log(item.data);
		
	},
	onPreload: function (res) {
		console.log('[pages/play] 页面预加载:', res)
	},
	onNavigate: function (res) {
		console.log('[pages/play] 页面将要跳转：', res)
	},
	onLoad: function() {
		console.log(this);
		console.log(item);
		console.log(item === this);
		console.log(item.data.demo2 === config.demo2);
	},
	onShow: function () {
		console.log('[pages/play] 页面展示')
	},
	onReady: function () {
		console.log('[pages/play] 页面已就绪')
	}
}

event.on('change', ()=> {
	item.data.demo1 = 'a.直接修改';
	item.data.demo2.name = 'a.直接修改';
	console.log(item.data.demo2 === config.demo2);
	// config.demo1 = 'onchange更改';
	// config.demo2.name = 'onchange更改';
	
	wx.navigateTo({
		url: '/pages/user/user'
	})
}, 'user');

Page.P('/pages/user/user', item)
