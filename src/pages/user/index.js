
var d = new Date()

Page.P('index', {
	data: {},
	onPageLaunch: function () {
		console.log('[pages/index] 页面启动：', new Date() - d, 'ms')
	},
	onAppLaunch: function (opts) {
		console.log('[pages/index]  程序启动：', opts)
	},
	onLoad: function() {
		this.$preload('play?cid=456')
		console.log('看组件', this.$refs);
		// cache test
		// console.log('[Step 1] cache get', this.$cache.get('cache'))
		// console.log('[Step 2] cache set "cache"')
		this.$cache.set('cache', {name: 'wxpage'})
		// console.log('[Step 3] cache get', this.$cache.get('cache'))

		// session test
		// console.log('[Step 1] session get', this.$session.get('session'))
		// console.log('[Step 2] session set "session"')
		this.$session.set('session', {name: 'wxpage'})
		// console.log('[Step 3] session get', this.$session.get('session'))

		setTimeout(function () {
			Page.P.emit('some_message', 'I am index!')
		}, 100)
	},
	onReady: function () {

	},
	onPlay: function () {
		this.$route('user?cid=123')
	},
	onPlayNav: function () {
		wx.navigateTo({
			url: '/pages/play?cid=abcd'
		})
	},
	onShow: function () {
		console.log('[pages/index] 页面展示')
	},
	onAwake: function (t) {
		console.log('[pages/index] 程序被唤醒：', t)
	},
	onClickBefore: function (e) {
		console.log('## On click before')
	},
	onClickAfter: function (e) {
	},
	onTouchend: function (e) {
	},
	onTTap: function () {
	},
	callFromComponent: function (name) {
		console.log('!!! call from component:', name)
	}
})
