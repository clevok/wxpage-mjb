let event = require('../../core/event');
const { router } = require('../../router');

Page.P(router.pages.user.index, {
	data: {
		tabs: [
			{ value: 0, text: '我的场所' },
			{ value: 1, text: '我的攻略' },
			{ value: 2, text: '消息' }
		]
	},

	/** 这里写预加载的方法 */
	onPreload() {
		this.$set('api/reuest', Api.demo({
			demo: 2
		}))
	},
	onLoad: function () {
		const data = await this.$take('user?cid=123') || Api.demo({
			demo: 2
		});

	},


	onReady: function () {

	},
	onPlay: function () {
		event.emit('change');
	},
	redirect() {
		this.$redirect('/pages/user/user')
	},
	route() {
		wx.navigateTo({
			url: '../place/place'
		})
	},
	navigate() {
		this.$navigate('user?cid=abcd')
	},
	onNavigate(taget) {
		console.log('监听页面跳转 onNavigate: taget', taget)
	},
	onShow: function () {
		console.log('[pages/index] 页面展示')
	}
})
