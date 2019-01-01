require('./core/wx');
require('./core/page');

const api = require('./core/api/index');
const app = require('./mixins/app');
const actions = require('./core/actions');

wx.$api = api;
wx.$actions = actions;

App.A({
	config: {
		route: ['/pages/$page'],
		resolvePath: function (name) {
            debugger
			return '/pages/' + name
		}
	},
	globalData: {
		getSystemInfo: null,
	},
	onLaunch: function(opts) {
        this.getSystemInfo();
	},
	onShow: function () {
		console.log('App onShow')
	},
	/**
     * 记录系统信息
     */
	getSystemInfo: app.getSystemInfo

})
