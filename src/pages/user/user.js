Page.P('/user/user', {
	data: {},
	onPreload: function (res) {
		console.log('[pages/play] 页面预加载:', res)
	},
	onNavigate: function (res) {
		console.log('[pages/play] 页面将要跳转：', res)
	},
	onLoad: function(res) {
		console.log('[pages/play] 页面完成加载', res)
		let t = this.$take('t')
	},
	onShow: function () {
		console.log('[pages/play] 页面展示')
	},
	onReady: function () {
		console.log('[pages/play] 页面已就绪')
	}
})
