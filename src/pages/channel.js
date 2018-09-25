// var P = require('../lib/wxpage')
var P = require('../core/page.js');

P('channel', {
	data: {},
	onLoad: function(res) {
		console.log('## On chennel page load, with query:', res)
	}
})
