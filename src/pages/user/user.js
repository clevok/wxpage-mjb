
let event = require('../../core/event');
let config = require('../../core/config');
const {router} = require('../../router');

Page.P(router.pages.user.user, {
	data: {
		name: wx.getStorageSync('user'),
		event: event,
		demo2: config.demo2,
		status: config.getStatus('detail')
	},
	click() {
		this.setData({
			['demo2.name']: 'along'
		});
		this.setData({
			'status': '更新status'
		});
	},
	onPreload: function (res) {
		console.log('[pages/play] 页面预加载:', res)
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
})
