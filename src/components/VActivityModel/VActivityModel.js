Component.C({
	properties: {
		show: {
			type: Boolean,
			value: false
		},
		anima: {
			type: String,
			value: 'zoom'
		}
	},
	data: {

	},
	methods: {
		closeModel() {
			this.setData({
				show: false
			});
			this.triggerEvent('close');
		},
		showModel() {
			this.setData({
				show: true
			});
			this.triggerEvent('show');
		}
	}
});
