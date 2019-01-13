require('./core/wx');
require('./core/page');

let config = require('./core/config');
const api = require('./core/api/index');
const app = require('./mixins/app');
const actions = require('./core/actions');

wx.$api = api;
wx.$actions = actions;

App.A({
	globalData: {
		getSystemInfo: null,
	},
	onLaunch: function() {
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
