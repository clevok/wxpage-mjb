Component({
    properties: {
        show: {
            type: Boolean,
            value: false
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
