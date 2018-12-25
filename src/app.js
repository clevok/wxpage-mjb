const wxpage = require('./core/page');
App.A({
	config: {
		route: ['pages/$page', 'page/user/$page' , 'subpack/$page'],
		resolvePath: function (name) {
			debugger
			return '/pages/' + name
		}
	},
	onLaunch: function(opts) {
		wxpage.on('some_message', function (msg) {
			console.log('Receive message:', msg)
		})
		console.log('APP is Running', opts)
	},
	onAwake: function (time) {
		console.log('onAwake, after', time, 'ms')
	},
	onShow: function () {
		console.log('App onShow')
	}
})
