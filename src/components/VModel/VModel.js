Component({
    properties: {
        show: {
            type: Boolean,
            value: false
        },
        anima: {
            type: String,
            value: 'zoom'
        },
        tapClose: {
            type: Boolean,
            value: true
        }
    },
    data: {

    },
    methods: {
        tapBg() {
            if(!this.properties.tapClose) {
                return;
            }
            this.closeModel();
        },
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
